import { query, getClient, initSchema } from "@/lib/pgPool.js";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_MITM_ROUTER_BASE = "http://localhost:20128";

const DEFAULT_SETTINGS = {
  cloudEnabled: false,
  tunnelEnabled: false,
  tunnelUrl: "",
  tunnelProvider: "cloudflare",
  tailscaleEnabled: false,
  tailscaleUrl: "",
  stickyRoundRobinLimit: 3,
  providerStrategies: {},
  comboStrategy: "fallback",
  comboStrategies: {},
  requireLogin: true,
  tunnelDashboardAccess: true,
  observabilityEnabled: true,
  observabilityMaxRecords: 1000,
  observabilityBatchSize: 20,
  observabilityFlushIntervalMs: 5000,
  observabilityMaxJsonSize: 1024,
  outboundProxyEnabled: false,
  outboundProxyUrl: "",
  outboundNoProxy: "",
  mitmRouterBaseUrl: DEFAULT_MITM_ROUTER_BASE,
};

// ── helpers ──────────────────────────────────────────────────────────

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function rowToCamel(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[snakeToCamel(k)] = v;
  }
  return out;
}

function rowsToCamel(rows) {
  return rows.map(rowToCamel);
}

// ── getDb (compatibility wrapper) ────────────────────────────────────

let schemaReady = false;

export async function getDb() {
  if (!schemaReady) {
    await initSchema();
    schemaReady = true;
  }
  // Return a thin compatibility wrapper so callers that do `const db = await getDb()` don't crash.
  return { data: null };
}

// ensure schema is ready before any query
async function ensureSchema() {
  if (!schemaReady) {
    await initSchema();
    schemaReady = true;
  }
}

// ── Provider Connections ─────────────────────────────────────────────

export async function getProviderConnections(filter = {}) {
  await ensureSchema();
  const conditions = [];
  const params = [];
  let idx = 1;

  if (filter.provider) {
    conditions.push(`provider = $${idx++}`);
    params.push(filter.provider);
  }
  if (filter.isActive !== undefined) {
    conditions.push(`is_active = $${idx++}`);
    params.push(filter.isActive);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT * FROM provider_connections ${where} ORDER BY priority ASC NULLS LAST`,
    params
  );
  return rowsToCamel(rows);
}

export async function getProviderConnectionById(id) {
  await ensureSchema();
  const { rows } = await query(`SELECT * FROM provider_connections WHERE id = $1`, [id]);
  return rows.length ? rowToCamel(rows[0]) : null;
}

export async function createProviderConnection(data) {
  await ensureSchema();
  const now = new Date().toISOString();

  // Upsert check: by provider+email (oauth) or provider+name (apikey)
  let existing = null;
  if (data.authType === "oauth" && data.email) {
    const { rows } = await query(
      `SELECT * FROM provider_connections WHERE provider = $1 AND auth_type = 'oauth' AND email = $2`,
      [data.provider, data.email]
    );
    if (rows.length) existing = rows[0];
  } else if (data.authType === "apikey" && data.name) {
    const { rows } = await query(
      `SELECT * FROM provider_connections WHERE provider = $1 AND auth_type = 'apikey' AND name = $2`,
      [data.provider, data.name]
    );
    if (rows.length) existing = rows[0];
  }

  if (existing) {
    // Merge update
    const updates = { ...data, updated_at: now };
    delete updates.id;
    const setClauses = [];
    const params = [];
    let idx = 1;
    for (const [key, value] of Object.entries(updates)) {
      const col = camelToSnake(key);
      setClauses.push(`${col} = $${idx++}`);
      params.push(key === "providerSpecificData" ? JSON.stringify(value) : value);
    }
    params.push(existing.id);
    const { rows } = await query(
      `UPDATE provider_connections SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );
    return rowToCamel(rows[0]);
  }

  // Determine name
  let connectionName = data.name || null;
  if (!connectionName && data.authType === "oauth") {
    if (data.email) {
      connectionName = data.email;
    } else {
      const { rows } = await query(
        `SELECT COUNT(*) AS cnt FROM provider_connections WHERE provider = $1`,
        [data.provider]
      );
      connectionName = `Account ${parseInt(rows[0].cnt, 10) + 1}`;
    }
  }

  // Determine priority
  let connectionPriority = data.priority;
  if (!connectionPriority) {
    const { rows } = await query(
      `SELECT COALESCE(MAX(priority), 0) AS max_p FROM provider_connections WHERE provider = $1`,
      [data.provider]
    );
    connectionPriority = parseInt(rows[0].max_p, 10) + 1;
  }

  const id = uuidv4();
  const optionalFields = [
    "displayName", "email", "globalPriority", "defaultModel",
    "accessToken", "refreshToken", "expiresAt", "tokenType",
    "scope", "idToken", "projectId", "apiKey", "testStatus",
    "lastTested", "lastError", "lastErrorAt", "rateLimitedUntil", "expiresIn", "errorCode",
    "consecutiveUseCount",
  ];

  const cols = ["id", "provider", "auth_type", "name", "priority", "is_active", "created_at", "updated_at"];
  const vals = [id, data.provider, data.authType || "oauth", connectionName, connectionPriority,
    data.isActive !== undefined ? data.isActive : true, now, now];

  for (const field of optionalFields) {
    if (data[field] !== undefined && data[field] !== null) {
      cols.push(camelToSnake(field));
      vals.push(data[field]);
    }
  }

  if (data.providerSpecificData && Object.keys(data.providerSpecificData).length > 0) {
    cols.push("provider_specific_data");
    vals.push(JSON.stringify(data.providerSpecificData));
  }

  const placeholders = vals.map((_, i) => `$${i + 1}`).join(", ");
  const { rows } = await query(
    `INSERT INTO provider_connections (${cols.join(", ")}) VALUES (${placeholders}) RETURNING *`,
    vals
  );

  await reorderProviderConnections(data.provider);
  return rowToCamel(rows[0]);
}

export async function updateProviderConnection(id, data) {
  await ensureSchema();

  // Get current row to know provider for reorder
  const { rows: current } = await query(`SELECT provider FROM provider_connections WHERE id = $1`, [id]);
  if (!current.length) return null;
  const providerId = current[0].provider;

  const updates = { ...data, updated_at: new Date().toISOString() };
  delete updates.id;

  const setClauses = [];
  const params = [];
  let idx = 1;
  for (const [key, value] of Object.entries(updates)) {
    const col = camelToSnake(key);
    setClauses.push(`${col} = $${idx++}`);
    params.push(key === "providerSpecificData" ? JSON.stringify(value) : value);
  }
  params.push(id);

  const { rows } = await query(
    `UPDATE provider_connections SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    params
  );
  if (!rows.length) return null;

  if (data.priority !== undefined) await reorderProviderConnections(providerId);
  return rowToCamel(rows[0]);
}

export async function deleteProviderConnection(id) {
  await ensureSchema();
  const { rows: current } = await query(`SELECT provider FROM provider_connections WHERE id = $1`, [id]);
  if (!current.length) return false;
  const providerId = current[0].provider;

  await query(`DELETE FROM provider_connections WHERE id = $1`, [id]);
  await reorderProviderConnections(providerId);
  return true;
}

export async function deleteProviderConnectionsByProvider(providerId) {
  await ensureSchema();
  const { rowCount } = await query(`DELETE FROM provider_connections WHERE provider = $1`, [providerId]);
  return rowCount;
}

export async function reorderProviderConnections(providerId) {
  await ensureSchema();
  const { rows } = await query(
    `SELECT id, priority, updated_at FROM provider_connections WHERE provider = $1 ORDER BY priority ASC NULLS LAST, updated_at DESC`,
    [providerId]
  );
  for (let i = 0; i < rows.length; i++) {
    const newPriority = i + 1;
    if (rows[i].priority !== newPriority) {
      await query(`UPDATE provider_connections SET priority = $1 WHERE id = $2`, [newPriority, rows[i].id]);
    }
  }
}

export async function cleanupProviderConnections() {
  // Not needed with PG — columns are nullable natively
  return 0;
}

// ── Provider Nodes ───────────────────────────────────────────────────

export async function getProviderNodes(filter = {}) {
  await ensureSchema();
  const conditions = [];
  const params = [];
  let idx = 1;

  if (filter.type) {
    conditions.push(`type = $${idx++}`);
    params.push(filter.type);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query(`SELECT * FROM provider_nodes ${where}`, params);
  return rowsToCamel(rows);
}

export async function getProviderNodeById(id) {
  await ensureSchema();
  const { rows } = await query(`SELECT * FROM provider_nodes WHERE id = $1`, [id]);
  return rows.length ? rowToCamel(rows[0]) : null;
}

export async function createProviderNode(data) {
  await ensureSchema();
  const now = new Date().toISOString();
  const id = data.id || uuidv4();
  const { rows } = await query(
    `INSERT INTO provider_nodes (id, type, name, prefix, api_type, base_url, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [id, data.type, data.name, data.prefix, data.apiType, data.baseUrl, now, now]
  );
  return rowToCamel(rows[0]);
}

export async function updateProviderNode(id, data) {
  await ensureSchema();
  const updates = { ...data, updated_at: new Date().toISOString() };
  delete updates.id;

  const setClauses = [];
  const params = [];
  let idx = 1;
  for (const [key, value] of Object.entries(updates)) {
    setClauses.push(`${camelToSnake(key)} = $${idx++}`);
    params.push(value);
  }
  params.push(id);

  const { rows } = await query(
    `UPDATE provider_nodes SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? rowToCamel(rows[0]) : null;
}

export async function deleteProviderNode(id) {
  await ensureSchema();
  const { rows } = await query(`DELETE FROM provider_nodes WHERE id = $1 RETURNING *`, [id]);
  return rows.length ? rowToCamel(rows[0]) : null;
}

// ── Proxy Pools ──────────────────────────────────────────────────────

export async function getProxyPools(filter = {}) {
  await ensureSchema();
  const conditions = [];
  const params = [];
  let idx = 1;

  if (filter.isActive !== undefined) {
    conditions.push(`is_active = $${idx++}`);
    params.push(filter.isActive);
  }
  if (filter.testStatus) {
    conditions.push(`test_status = $${idx++}`);
    params.push(filter.testStatus);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT * FROM proxy_pools ${where} ORDER BY updated_at DESC NULLS LAST`,
    params
  );
  return rowsToCamel(rows);
}

export async function getProxyPoolById(id) {
  await ensureSchema();
  const { rows } = await query(`SELECT * FROM proxy_pools WHERE id = $1`, [id]);
  return rows.length ? rowToCamel(rows[0]) : null;
}

export async function createProxyPool(data) {
  await ensureSchema();
  const now = new Date().toISOString();
  const id = data.id || uuidv4();
  const { rows } = await query(
    `INSERT INTO proxy_pools (id, name, proxy_url, no_proxy, type, is_active, strict_proxy, test_status, last_tested_at, last_error, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [
      id,
      data.name,
      data.proxyUrl,
      data.noProxy || "",
      data.type || "http",
      data.isActive !== undefined ? data.isActive : true,
      data.strictProxy === true,
      data.testStatus || "unknown",
      data.lastTestedAt || null,
      data.lastError || null,
      now,
      now,
    ]
  );
  return rowToCamel(rows[0]);
}

export async function updateProxyPool(id, data) {
  await ensureSchema();
  const updates = { ...data, updated_at: new Date().toISOString() };
  delete updates.id;

  const setClauses = [];
  const params = [];
  let idx = 1;
  for (const [key, value] of Object.entries(updates)) {
    setClauses.push(`${camelToSnake(key)} = $${idx++}`);
    params.push(value);
  }
  params.push(id);

  const { rows } = await query(
    `UPDATE proxy_pools SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? rowToCamel(rows[0]) : null;
}

export async function deleteProxyPool(id) {
  await ensureSchema();
  const { rows } = await query(`DELETE FROM proxy_pools WHERE id = $1 RETURNING *`, [id]);
  return rows.length ? rowToCamel(rows[0]) : null;
}

// ── Model Aliases ────────────────────────────────────────────────────

export async function getModelAliases() {
  await ensureSchema();
  const { rows } = await query(`SELECT alias, model FROM model_aliases`);
  const out = {};
  for (const r of rows) out[r.alias] = r.model;
  return out;
}

export async function setModelAlias(alias, model) {
  await ensureSchema();
  await query(
    `INSERT INTO model_aliases (alias, model) VALUES ($1, $2)
     ON CONFLICT (alias) DO UPDATE SET model = EXCLUDED.model`,
    [alias, model]
  );
}

export async function deleteModelAlias(alias) {
  await ensureSchema();
  await query(`DELETE FROM model_aliases WHERE alias = $1`, [alias]);
}

// ── MITM Aliases ─────────────────────────────────────────────────────

export async function getMitmAlias(toolName) {
  await ensureSchema();
  if (toolName) {
    const { rows } = await query(`SELECT mappings FROM mitm_aliases WHERE tool_name = $1`, [toolName]);
    return rows.length ? rows[0].mappings : {};
  }
  const { rows } = await query(`SELECT tool_name, mappings FROM mitm_aliases`);
  const out = {};
  for (const r of rows) out[r.tool_name] = r.mappings;
  return out;
}

export async function setMitmAliasAll(toolName, mappings) {
  await ensureSchema();
  await query(
    `INSERT INTO mitm_aliases (tool_name, mappings) VALUES ($1, $2)
     ON CONFLICT (tool_name) DO UPDATE SET mappings = EXCLUDED.mappings`,
    [toolName, JSON.stringify(mappings || {})]
  );
}

// ── Combos ───────────────────────────────────────────────────────────

export async function getCombos() {
  await ensureSchema();
  const { rows } = await query(`SELECT * FROM combos ORDER BY created_at`);
  return rowsToCamel(rows);
}

export async function getComboById(id) {
  await ensureSchema();
  const { rows } = await query(`SELECT * FROM combos WHERE id = $1`, [id]);
  return rows.length ? rowToCamel(rows[0]) : null;
}

export async function getComboByName(name) {
  await ensureSchema();
  const { rows } = await query(`SELECT * FROM combos WHERE name = $1`, [name]);
  return rows.length ? rowToCamel(rows[0]) : null;
}

export async function createCombo(data) {
  await ensureSchema();
  const now = new Date().toISOString();
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO combos (id, name, models, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, data.name, JSON.stringify(data.models || []), now, now]
  );
  return rowToCamel(rows[0]);
}

export async function updateCombo(id, data) {
  await ensureSchema();
  const updates = { ...data, updated_at: new Date().toISOString() };
  delete updates.id;

  const setClauses = [];
  const params = [];
  let idx = 1;
  for (const [key, value] of Object.entries(updates)) {
    const col = camelToSnake(key);
    setClauses.push(`${col} = $${idx++}`);
    params.push(key === "models" ? JSON.stringify(value) : value);
  }
  params.push(id);

  const { rows } = await query(
    `UPDATE combos SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? rowToCamel(rows[0]) : null;
}

export async function deleteCombo(id) {
  await ensureSchema();
  const { rowCount } = await query(`DELETE FROM combos WHERE id = $1`, [id]);
  return rowCount > 0;
}

// ── API Keys ─────────────────────────────────────────────────────────

export async function getApiKeys() {
  await ensureSchema();
  const { rows } = await query(`SELECT * FROM api_keys ORDER BY created_at`);
  return rowsToCamel(rows);
}

export async function createApiKey(name, machineId) {
  if (!machineId) throw new Error("machineId is required");
  await ensureSchema();

  const { generateApiKeyWithMachine } = await import("@/shared/utils/apiKey");
  const result = generateApiKeyWithMachine(machineId);

  const now = new Date().toISOString();
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO api_keys (id, name, key, machine_id, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, name, result.key, machineId, true, now]
  );
  return rowToCamel(rows[0]);
}

export async function deleteApiKey(id) {
  await ensureSchema();
  const { rowCount } = await query(`DELETE FROM api_keys WHERE id = $1`, [id]);
  return rowCount > 0;
}

export async function getApiKeyById(id) {
  await ensureSchema();
  const { rows } = await query(`SELECT * FROM api_keys WHERE id = $1`, [id]);
  return rows.length ? rowToCamel(rows[0]) : null;
}

export async function updateApiKey(id, data) {
  await ensureSchema();
  const setClauses = [];
  const params = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    setClauses.push(`${camelToSnake(key)} = $${idx++}`);
    params.push(value);
  }
  if (!setClauses.length) return null;
  params.push(id);

  const { rows } = await query(
    `UPDATE api_keys SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? rowToCamel(rows[0]) : null;
}

export async function validateApiKey(key) {
  await ensureSchema();
  const { rows } = await query(`SELECT is_active FROM api_keys WHERE key = $1`, [key]);
  return rows.length > 0 && rows[0].is_active !== false;
}

// ── Settings ─────────────────────────────────────────────────────────

export async function getSettings() {
  await ensureSchema();
  const { rows } = await query(`SELECT key, value FROM settings`);
  const stored = {};
  for (const r of rows) {
    stored[r.key] = r.value;
  }
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function updateSettings(updates) {
  await ensureSchema();
  for (const [key, value] of Object.entries(updates)) {
    await query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, JSON.stringify(value)]
    );
  }
  return getSettings();
}

// ── Export / Import ──────────────────────────────────────────────────

export async function exportDb() {
  await ensureSchema();
  const [
    providerConnections,
    providerNodes,
    proxyPools,
    modelAliases,
    mitmAlias,
    combos,
    apiKeys,
    settings,
    pricing,
  ] = await Promise.all([
    getProviderConnections(),
    getProviderNodes(),
    getProxyPools(),
    getModelAliases(),
    getMitmAlias(),
    getCombos(),
    getApiKeys(),
    getSettings(),
    getPricing(),
  ]);

  return {
    providerConnections,
    providerNodes,
    proxyPools,
    modelAliases,
    mitmAlias,
    combos,
    apiKeys,
    settings,
    pricing,
  };
}

export async function importDb(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid database payload");
  }
  await ensureSchema();

  const client = await getClient();
  try {
    await client.query("BEGIN");

    // Clear all tables
    await client.query("DELETE FROM provider_connections");
    await client.query("DELETE FROM provider_nodes");
    await client.query("DELETE FROM proxy_pools");
    await client.query("DELETE FROM model_aliases");
    await client.query("DELETE FROM mitm_aliases");
    await client.query("DELETE FROM combos");
    await client.query("DELETE FROM api_keys");
    await client.query("DELETE FROM settings");
    await client.query("DELETE FROM pricing");

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  // Re-insert data using the public functions (they handle camel→snake)
  if (Array.isArray(payload.providerConnections)) {
    for (const c of payload.providerConnections) {
      await createProviderConnection(c);
    }
  }
  if (Array.isArray(payload.providerNodes)) {
    for (const n of payload.providerNodes) {
      await createProviderNode(n);
    }
  }
  if (Array.isArray(payload.proxyPools)) {
    for (const p of payload.proxyPools) {
      await createProxyPool(p);
    }
  }
  if (payload.modelAliases && typeof payload.modelAliases === "object") {
    for (const [alias, model] of Object.entries(payload.modelAliases)) {
      await setModelAlias(alias, model);
    }
  }
  if (payload.mitmAlias && typeof payload.mitmAlias === "object") {
    for (const [toolName, mappings] of Object.entries(payload.mitmAlias)) {
      await setMitmAliasAll(toolName, mappings);
    }
  }
  if (Array.isArray(payload.combos)) {
    for (const c of payload.combos) {
      await createCombo(c);
    }
  }
  if (Array.isArray(payload.apiKeys)) {
    for (const k of payload.apiKeys) {
      // Direct insert for imported keys (they already have key field)
      const now = new Date().toISOString();
      await query(
        `INSERT INTO api_keys (id, name, key, machine_id, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [k.id || uuidv4(), k.name, k.key, k.machineId || k.machine_id, k.isActive !== false, k.createdAt || now]
      );
    }
  }
  if (payload.settings && typeof payload.settings === "object" && !Array.isArray(payload.settings)) {
    const merged = { ...DEFAULT_SETTINGS, ...payload.settings };
    await updateSettings(merged);
  }
  if (payload.pricing && typeof payload.pricing === "object") {
    await updatePricing(payload.pricing);
  }

  return exportDb();
}

// ── Cloud helpers ────────────────────────────────────────────────────

export async function isCloudEnabled() {
  const settings = await getSettings();
  return settings.cloudEnabled === true;
}

export async function getCloudUrl() {
  const settings = await getSettings();
  return settings.cloudUrl || process.env.CLOUD_URL || process.env.NEXT_PUBLIC_CLOUD_URL || "";
}

// ── Pricing ──────────────────────────────────────────────────────────

export async function getPricing() {
  await ensureSchema();
  const { rows } = await query(`SELECT provider, model, pricing_data FROM pricing`);
  const userPricing = {};
  for (const r of rows) {
    if (!userPricing[r.provider]) userPricing[r.provider] = {};
    userPricing[r.provider][r.model] = r.pricing_data;
  }

  const { PROVIDER_PRICING } = await import("@/shared/constants/pricing.js");
  const merged = {};

  for (const [provider, models] of Object.entries(PROVIDER_PRICING)) {
    merged[provider] = { ...models };
    if (userPricing[provider]) {
      for (const [model, pricing] of Object.entries(userPricing[provider])) {
        merged[provider][model] = merged[provider][model]
          ? { ...merged[provider][model], ...pricing }
          : pricing;
      }
    }
  }

  for (const [provider, models] of Object.entries(userPricing)) {
    if (!merged[provider]) {
      merged[provider] = { ...models };
    } else {
      for (const [model, pricing] of Object.entries(models)) {
        if (!merged[provider][model]) merged[provider][model] = pricing;
      }
    }
  }

  return merged;
}

export async function getPricingForModel(provider, model) {
  if (!model) return null;
  await ensureSchema();

  if (provider) {
    const { rows } = await query(
      `SELECT pricing_data FROM pricing WHERE provider = $1 AND model = $2`,
      [provider, model]
    );
    if (rows.length) return rows[0].pricing_data;
  }

  const { getPricingForModel: resolve } = await import("@/shared/constants/pricing.js");
  return resolve(provider, model);
}

export async function updatePricing(pricingData) {
  await ensureSchema();
  for (const [provider, models] of Object.entries(pricingData)) {
    for (const [model, pricing] of Object.entries(models)) {
      await query(
        `INSERT INTO pricing (provider, model, pricing_data) VALUES ($1, $2, $3)
         ON CONFLICT (provider, model) DO UPDATE SET pricing_data = EXCLUDED.pricing_data`,
        [provider, model, JSON.stringify(pricing)]
      );
    }
  }
  // Return only user-stored pricing
  const { rows } = await query(`SELECT provider, model, pricing_data FROM pricing`);
  const out = {};
  for (const r of rows) {
    if (!out[r.provider]) out[r.provider] = {};
    out[r.provider][r.model] = r.pricing_data;
  }
  return out;
}

export async function resetPricing(provider, model) {
  await ensureSchema();
  if (model) {
    await query(`DELETE FROM pricing WHERE provider = $1 AND model = $2`, [provider, model]);
  } else {
    await query(`DELETE FROM pricing WHERE provider = $1`, [provider]);
  }
  // Return remaining user pricing
  const { rows } = await query(`SELECT provider, model, pricing_data FROM pricing`);
  const out = {};
  for (const r of rows) {
    if (!out[r.provider]) out[r.provider] = {};
    out[r.provider][r.model] = r.pricing_data;
  }
  return out;
}

export async function resetAllPricing() {
  await ensureSchema();
  await query(`DELETE FROM pricing`);
  return {};
}
