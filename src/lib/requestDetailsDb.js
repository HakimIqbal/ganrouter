import { query } from "@/lib/pgPool.js";
import { v4 as uuidv4 } from "uuid";

const isCloud = typeof caches !== "undefined" && typeof caches === "object";

const DEFAULT_MAX_RECORDS = 200;
const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_FLUSH_INTERVAL_MS = 5000;
const DEFAULT_MAX_JSON_SIZE = 5 * 1024;
const CONFIG_CACHE_TTL_MS = 5000;

let cachedConfig = null;
let cachedConfigTs = 0;

async function getObservabilityConfig() {
  if (cachedConfig && (Date.now() - cachedConfigTs) < CONFIG_CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const { getSettings } = await import("@/lib/localDb");
    const settings = await getSettings();
    const envEnabled = process.env.OBSERVABILITY_ENABLED !== "false";
    const enabled = typeof settings.enableObservability === "boolean"
      ? settings.enableObservability
      : envEnabled;

    cachedConfig = {
      enabled,
      maxRecords: settings.observabilityMaxRecords || parseInt(process.env.OBSERVABILITY_MAX_RECORDS || String(DEFAULT_MAX_RECORDS), 10),
      batchSize: settings.observabilityBatchSize || parseInt(process.env.OBSERVABILITY_BATCH_SIZE || String(DEFAULT_BATCH_SIZE), 10),
      flushIntervalMs: settings.observabilityFlushIntervalMs || parseInt(process.env.OBSERVABILITY_FLUSH_INTERVAL_MS || String(DEFAULT_FLUSH_INTERVAL_MS), 10),
      maxJsonSize: (settings.observabilityMaxJsonSize || parseInt(process.env.OBSERVABILITY_MAX_JSON_SIZE || "5", 10)) * 1024,
    };
  } catch {
    cachedConfig = {
      enabled: false,
      maxRecords: DEFAULT_MAX_RECORDS,
      batchSize: DEFAULT_BATCH_SIZE,
      flushIntervalMs: DEFAULT_FLUSH_INTERVAL_MS,
      maxJsonSize: DEFAULT_MAX_JSON_SIZE,
    };
  }

  cachedConfigTs = Date.now();
  return cachedConfig;
}

let writeBuffer = [];
let flushTimer = null;
let isFlushing = false;

function sanitizeHeaders(headers) {
  if (!headers || typeof headers !== "object") return {};
  const sensitiveKeys = ["authorization", "x-api-key", "cookie", "token", "api-key"];
  const sanitized = { ...headers };
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      delete sanitized[key];
    }
  }
  return sanitized;
}

function truncateJson(obj, maxSize) {
  const str = JSON.stringify(obj);
  if (str.length > maxSize) {
    return { _truncated: true, _originalSize: str.length, _preview: str.substring(0, 200) };
  }
  return obj;
}

async function flushToDatabase() {
  if (isCloud || isFlushing || writeBuffer.length === 0) return;

  isFlushing = true;
  try {
    const itemsToSave = [...writeBuffer];
    writeBuffer = [];

    const config = await getObservabilityConfig();

    for (const item of itemsToSave) {
      const id = item.id || uuidv4();
      const timestamp = item.timestamp || new Date().toISOString();

      if (item.request?.headers) {
        item.request.headers = sanitizeHeaders(item.request.headers);
      }

      const maxSize = config.maxJsonSize;
      const request = truncateJson(item.request || {}, maxSize);
      const providerRequest = truncateJson(item.providerRequest || {}, maxSize);
      const providerResponse = truncateJson(item.providerResponse || {}, maxSize);
      const response = truncateJson(item.response || {}, maxSize);

      await query(
        `INSERT INTO request_details (id, provider, model, connection_id, timestamp, status, latency, tokens, request, provider_request, provider_response, response)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           latency = EXCLUDED.latency,
           tokens = EXCLUDED.tokens,
           request = EXCLUDED.request,
           provider_request = EXCLUDED.provider_request,
           provider_response = EXCLUDED.provider_response,
           response = EXCLUDED.response`,
        [
          id,
          item.provider || null,
          item.model || null,
          item.connectionId || null,
          timestamp,
          item.status || null,
          JSON.stringify(item.latency || {}),
          JSON.stringify(item.tokens || {}),
          JSON.stringify(request),
          JSON.stringify(providerRequest),
          JSON.stringify(providerResponse),
          JSON.stringify(response),
        ]
      );
    }

    // Prune old records beyond maxRecords
    await query(
      `DELETE FROM request_details WHERE id IN (
        SELECT id FROM request_details ORDER BY timestamp DESC OFFSET $1
      )`,
      [config.maxRecords]
    );
  } catch (error) {
    console.error("[requestDetailsDb] Batch write failed:", error);
  } finally {
    isFlushing = false;
  }
}

export async function saveRequestDetail(detail) {
  if (isCloud) return;

  const config = await getObservabilityConfig();
  if (!config.enabled) return;

  writeBuffer.push(detail);

  if (writeBuffer.length >= config.batchSize) {
    await flushToDatabase();
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
  } else if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushToDatabase().catch(() => {});
      flushTimer = null;
    }, config.flushIntervalMs);
  }
}

export async function getRequestDetails(filter = {}) {
  if (isCloud) {
    return { details: [], pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrev: false } };
  }

  const conditions = [];
  const params = [];
  let paramIdx = 1;

  if (filter.provider) { conditions.push(`provider = $${paramIdx++}`); params.push(filter.provider); }
  if (filter.model) { conditions.push(`model = $${paramIdx++}`); params.push(filter.model); }
  if (filter.connectionId) { conditions.push(`connection_id = $${paramIdx++}`); params.push(filter.connectionId); }
  if (filter.status) { conditions.push(`status = $${paramIdx++}`); params.push(filter.status); }
  if (filter.startDate) { conditions.push(`timestamp >= $${paramIdx++}`); params.push(new Date(filter.startDate).toISOString()); }
  if (filter.endDate) { conditions.push(`timestamp <= $${paramIdx++}`); params.push(new Date(filter.endDate).toISOString()); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await query(`SELECT COUNT(*) as total FROM request_details ${where}`, params);
  const totalItems = parseInt(countResult.rows[0].total, 10);

  const page = filter.page || 1;
  const pageSize = filter.pageSize || 50;
  const totalPages = Math.ceil(totalItems / pageSize);
  const offset = (page - 1) * pageSize;

  const result = await query(
    `SELECT * FROM request_details ${where} ORDER BY timestamp DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
    [...params, pageSize, offset]
  );

  const details = result.rows.map(row => ({
    id: row.id,
    provider: row.provider,
    model: row.model,
    connectionId: row.connection_id,
    timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : null,
    status: row.status,
    latency: row.latency || {},
    tokens: row.tokens || {},
    request: row.request || {},
    providerRequest: row.provider_request || {},
    providerResponse: row.provider_response || {},
    response: row.response || {},
  }));

  return {
    details,
    pagination: { page, pageSize, totalItems, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
}

export async function getRequestDetailById(id) {
  if (isCloud) return null;

  const result = await query("SELECT * FROM request_details WHERE id = $1", [id]);
  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    provider: row.provider,
    model: row.model,
    connectionId: row.connection_id,
    timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : null,
    status: row.status,
    latency: row.latency || {},
    tokens: row.tokens || {},
    request: row.request || {},
    providerRequest: row.provider_request || {},
    providerResponse: row.provider_response || {},
    response: row.response || {},
  };
}

const _shutdownHandler = async () => {
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
  if (writeBuffer.length > 0) await flushToDatabase();
};

function ensureShutdownHandler() {
  if (isCloud) return;
  process.off("beforeExit", _shutdownHandler);
  process.off("SIGINT", _shutdownHandler);
  process.off("SIGTERM", _shutdownHandler);
  process.on("beforeExit", _shutdownHandler);
  process.on("SIGINT", _shutdownHandler);
  process.on("SIGTERM", _shutdownHandler);
}

ensureShutdownHandler();
