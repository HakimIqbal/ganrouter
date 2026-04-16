import { query } from "@/lib/pgPool.js";
import { EventEmitter } from "events";
import path from "path";
import os from "os";
import fs from "fs";
import { fileURLToPath } from "url";

const isCloud = typeof caches !== 'undefined' || typeof caches === 'object';

// Get app name from root package.json config
function getAppName() {
  if (isCloud) return "ganrouter"; // Skip file system access in Workers

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // Look for root package.json (monorepo root)
  const rootPkgPath = path.resolve(__dirname, "../../../package.json");
  try {
    const pkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf-8"));
    return pkg.config?.appName || "ganrouter";
  } catch {
    return "ganrouter";
  }
}

// Get user data directory based on platform
function getUserDataDir() {
  if (isCloud) return "/tmp"; // Fallback for Workers

  if (process.env.DATA_DIR) return process.env.DATA_DIR;

  try {
    const platform = process.platform;
    const homeDir = os.homedir();
    const appName = getAppName();

    if (platform === "win32") {
      return path.join(process.env.APPDATA || path.join(homeDir, "AppData", "Roaming"), appName);
    } else {
      // macOS & Linux: ~/.{appName}
      return path.join(homeDir, `.${appName}`);
    }
  } catch (error) {
    console.error("[usageDb] Failed to get user data directory:", error.message);
    // Fallback to cwd if homedir fails
    return path.join(process.cwd(), ".ganrouter");
  }
}

// Data file path - stored in user home directory
const DATA_DIR = getUserDataDir();
const LOG_FILE = isCloud ? null : path.join(DATA_DIR, "log.txt");

// Ensure data directory exists
if (!isCloud && fs && typeof fs.existsSync === "function") {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`[usageDb] Created data directory: ${DATA_DIR}`);
    }
  } catch (error) {
    console.error("[usageDb] Failed to create data directory:", error.message);
  }
}

function getLocalDateKey(timestamp) {
  const d = timestamp ? new Date(timestamp) : new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Use global to share pending state across Next.js route modules
if (!global._pendingRequests) {
  global._pendingRequests = { byModel: {}, byAccount: {} };
}
const pendingRequests = global._pendingRequests;

// Track last error provider for UI edge coloring (auto-clears after 10s)
if (!global._lastErrorProvider) {
  global._lastErrorProvider = { provider: "", ts: 0 };
}
const lastErrorProvider = global._lastErrorProvider;

// Use global to share singleton across Next.js route modules
if (!global._statsEmitter) {
  global._statsEmitter = new EventEmitter();
  global._statsEmitter.setMaxListeners(50);
}
export const statsEmitter = global._statsEmitter;

// Safety timers — force-clear pending counts after 1 min if END was never called
if (!global._pendingTimers) global._pendingTimers = {};
const pendingTimers = global._pendingTimers;

const PENDING_TIMEOUT_MS = 60 * 1000; // 1 minute

/**
 * Track a pending request
 * @param {string} model
 * @param {string} provider
 * @param {string} connectionId
 * @param {boolean} started - true if started, false if finished
 * @param {boolean} [error] - true if ended with error
 */
export function trackPendingRequest(model, provider, connectionId, started, error = false) {
  const modelKey = provider ? `${model} (${provider})` : model;
  const timerKey = `${connectionId}|${modelKey}`;

  // Track by model
  if (!pendingRequests.byModel[modelKey]) pendingRequests.byModel[modelKey] = 0;
  pendingRequests.byModel[modelKey] = Math.max(0, pendingRequests.byModel[modelKey] + (started ? 1 : -1));

  // Track by account
  if (connectionId) {
    if (!pendingRequests.byAccount[connectionId]) pendingRequests.byAccount[connectionId] = {};
    if (!pendingRequests.byAccount[connectionId][modelKey]) pendingRequests.byAccount[connectionId][modelKey] = 0;
    pendingRequests.byAccount[connectionId][modelKey] = Math.max(0, pendingRequests.byAccount[connectionId][modelKey] + (started ? 1 : -1));
  }

  if (started) {
    // Safety timeout: force-clear if END is never called (client disconnect, crash, etc.)
    clearTimeout(pendingTimers[timerKey]);
    pendingTimers[timerKey] = setTimeout(() => {
      delete pendingTimers[timerKey];
      if (pendingRequests.byModel[modelKey] > 0) {
        pendingRequests.byModel[modelKey] = 0;
      }
      if (connectionId && pendingRequests.byAccount[connectionId]?.[modelKey] > 0) {
        pendingRequests.byAccount[connectionId][modelKey] = 0;
      }
      statsEmitter.emit("pending");
    }, PENDING_TIMEOUT_MS);
  } else {
    // END called normally — cancel the safety timer
    clearTimeout(pendingTimers[timerKey]);
    delete pendingTimers[timerKey];
  }

  // Track error provider (auto-clears after 10s)
  if (!started && error && provider) {
    lastErrorProvider.provider = provider.toLowerCase();
    lastErrorProvider.ts = Date.now();
  }

  const t = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  console.log(`[${t}] [PENDING] ${started ? "START" : "END"}${error ? " (ERROR)" : ""} | provider=${provider} | model=${model}`);
  statsEmitter.emit("pending");
}

/**
 * Lightweight: get only activeRequests + recentRequests without full stats recalc
 */
export async function getActiveRequests() {
  const activeRequests = [];

  // Build active requests from pending state
  let connectionMap = {};
  try {
    const { getProviderConnections } = await import("@/lib/localDb.js");
    const allConnections = await getProviderConnections();
    for (const conn of allConnections) {
      connectionMap[conn.id] = conn.name || conn.email || conn.id;
    }
  } catch {}

  for (const [connectionId, models] of Object.entries(pendingRequests.byAccount)) {
    for (const [modelKey, count] of Object.entries(models)) {
      if (count > 0) {
        const accountName = connectionMap[connectionId] || `Account ${connectionId.slice(0, 8)}...`;
        const match = modelKey.match(/^(.*) \((.*)\)$/);
        const modelName = match ? match[1] : modelKey;
        const providerName = match ? match[2] : "unknown";
        activeRequests.push({ model: modelName, provider: providerName, account: accountName, count });
      }
    }
  }

  // Get recent requests from usage_history
  let recentRequests = [];
  try {
    const res = await query(
      `SELECT timestamp, model, provider, prompt_tokens, completion_tokens, input_tokens, output_tokens, status
       FROM usage_history ORDER BY timestamp DESC LIMIT 100`
    );
    const seen = new Set();
    for (const row of res.rows) {
      const promptTokens = row.prompt_tokens || row.input_tokens || 0;
      const completionTokens = row.completion_tokens || row.output_tokens || 0;
      if (promptTokens === 0 && completionTokens === 0) continue;
      const ts = row.timestamp ? new Date(row.timestamp).toISOString() : "";
      const minute = ts.slice(0, 16);
      const key = `${row.model}|${row.provider}|${promptTokens}|${completionTokens}|${minute}`;
      if (seen.has(key)) continue;
      seen.add(key);
      recentRequests.push({
        timestamp: ts,
        model: row.model,
        provider: row.provider || "",
        promptTokens,
        completionTokens,
        status: row.status || "ok",
      });
      if (recentRequests.length >= 20) break;
    }
  } catch (err) {
    console.error("[usageDb] getActiveRequests recent query error:", err.message);
  }

  // Error provider (auto-clear after 10s)
  const errorProvider = (Date.now() - lastErrorProvider.ts < 10000) ? lastErrorProvider.provider : "";

  return { activeRequests, recentRequests, errorProvider };
}

/**
 * Get usage database instance (compat wrapper for PostgreSQL)
 * Returns an object with read/write/data for backward compat — but data is not used.
 */
export async function getUsageDb() {
  // Return a compat wrapper — callers should migrate to direct functions
  return {
    read: async () => {},
    write: async () => {},
    data: { history: [], totalRequestsLifetime: 0, dailySummary: {} },
  };
}

/**
 * Save request usage
 * @param {object} entry - Usage entry { provider, model, tokens: { prompt_tokens, completion_tokens, ... }, connectionId?, apiKey?, endpoint?, status? }
 */
export async function saveRequestUsage(entry) {
  if (isCloud) return; // Skip saving in Workers

  try {
    // Add timestamp if not present
    if (!entry.timestamp) {
      entry.timestamp = new Date().toISOString();
    }

    const entryCost = await calculateCost(entry.provider, entry.model, entry.tokens);
    entry.cost = entryCost;

    const promptTokens = entry.tokens?.prompt_tokens || entry.tokens?.input_tokens || 0;
    const completionTokens = entry.tokens?.completion_tokens || entry.tokens?.output_tokens || 0;
    const inputTokens = entry.tokens?.input_tokens || 0;
    const outputTokens = entry.tokens?.output_tokens || 0;

    // 1. INSERT into usage_history
    await query(
      `INSERT INTO usage_history (timestamp, model, provider, connection_id, endpoint, api_key, prompt_tokens, completion_tokens, input_tokens, output_tokens, cost, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        entry.timestamp,
        entry.model || null,
        entry.provider || null,
        entry.connectionId || null,
        entry.endpoint || null,
        entry.apiKey || null,
        promptTokens,
        completionTokens,
        inputTokens,
        outputTokens,
        entryCost,
        entry.status || null,
      ]
    );

    // 2. UPSERT into usage_daily_summary for multiple scopes
    const dateKey = getLocalDateKey(entry.timestamp);
    const cost = entryCost;

    const scopes = [
      { scope: "total", scope_key: "" },
      entry.provider ? { scope: "provider", scope_key: entry.provider } : null,
      entry.model ? { scope: "model", scope_key: `${entry.model}|${entry.provider || ""}` } : null,
      entry.connectionId ? { scope: "account", scope_key: entry.connectionId } : null,
    ];

    const apiKeyVal = entry.apiKey && typeof entry.apiKey === "string" ? entry.apiKey : "local-no-key";
    scopes.push({ scope: "apikey", scope_key: `${apiKeyVal}|${entry.model}|${entry.provider || "unknown"}` });

    const endpoint = entry.endpoint || "Unknown";
    scopes.push({ scope: "endpoint", scope_key: `${endpoint}|${entry.model}|${entry.provider || "unknown"}` });

    for (const s of scopes) {
      if (!s) continue;
      await query(
        `INSERT INTO usage_daily_summary (date, scope, scope_key, requests, prompt_tokens, completion_tokens, cost)
         VALUES ($1, $2, $3, 1, $4, $5, $6)
         ON CONFLICT (date, scope, scope_key) DO UPDATE SET
           requests = usage_daily_summary.requests + 1,
           prompt_tokens = usage_daily_summary.prompt_tokens + $4,
           completion_tokens = usage_daily_summary.completion_tokens + $5,
           cost = usage_daily_summary.cost + $6`,
        [dateKey, s.scope, s.scope_key, promptTokens, completionTokens, cost]
      );
    }

    // 3. INCREMENT counters.total_requests_lifetime
    await query(
      `UPDATE counters SET value = value + 1 WHERE name = 'total_requests_lifetime'`
    );

    statsEmitter.emit("update");
  } catch (error) {
    console.error("Failed to save usage stats:", error);
  }
}

/**
 * Get usage history
 * @param {object} filter - Filter criteria
 */
export async function getUsageHistory(filter = {}) {
  try {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filter.provider) {
      conditions.push(`provider = $${idx++}`);
      params.push(filter.provider);
    }
    if (filter.model) {
      conditions.push(`model = $${idx++}`);
      params.push(filter.model);
    }
    if (filter.startDate) {
      conditions.push(`timestamp >= $${idx++}`);
      params.push(new Date(filter.startDate).toISOString());
    }
    if (filter.endDate) {
      conditions.push(`timestamp <= $${idx++}`);
      params.push(new Date(filter.endDate).toISOString());
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const res = await query(
      `SELECT timestamp, model, provider, connection_id AS "connectionId", endpoint, api_key AS "apiKey",
              prompt_tokens, completion_tokens, input_tokens, output_tokens, cost, status
       FROM usage_history ${where} ORDER BY timestamp ASC`,
      params
    );

    // Map rows to match the old entry format
    return res.rows.map((row) => ({
      timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : null,
      model: row.model,
      provider: row.provider,
      connectionId: row.connectionId,
      endpoint: row.endpoint,
      apiKey: row.apiKey,
      tokens: {
        prompt_tokens: row.prompt_tokens || 0,
        completion_tokens: row.completion_tokens || 0,
        input_tokens: row.input_tokens || 0,
        output_tokens: row.output_tokens || 0,
      },
      cost: row.cost || 0,
      status: row.status,
    }));
  } catch (error) {
    console.error("[usageDb] getUsageHistory error:", error.message);
    return [];
  }
}

/**
 * Format date as dd-mm-yyyy h:m:s
 */
function formatLogDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${d}-${m}-${y} ${h}:${min}:${s}`;
}

/**
 * Append to log.txt
 * Format: datetime(dd-mm-yyyy h:m:s) | model | provider | account | tokens sent | tokens received | status
 */
export async function appendRequestLog({ model, provider, connectionId, tokens, status }) {
  if (isCloud) return; // Skip logging in Workers

  try {
    const timestamp = formatLogDate();
    const p = provider?.toUpperCase() || "-";
    const m = model || "-";

    // Resolve account name
    let account = connectionId ? connectionId.slice(0, 8) : "-";
    try {
      const { getProviderConnections } = await import("@/lib/localDb.js");
      const connections = await getProviderConnections();
      const conn = connections.find(c => c.id === connectionId);
      if (conn) {
        account = conn.name || conn.email || account;
      }
    } catch {}

    const sent = tokens?.prompt_tokens !== undefined ? tokens.prompt_tokens : "-";
    const received = tokens?.completion_tokens !== undefined ? tokens.completion_tokens : "-";

    const line = `${timestamp} | ${m} | ${p} | ${account} | ${sent} | ${received} | ${status}\n`;

    fs.appendFileSync(LOG_FILE, line);

    // Trim to keep only last 200 lines
    const content = fs.readFileSync(LOG_FILE, "utf-8");
    const lines = content.trim().split("\n");
    if (lines.length > 200) {
      fs.writeFileSync(LOG_FILE, lines.slice(-200).join("\n") + "\n");
    }
  } catch (error) {
    console.error("Failed to append to log.txt:", error.message);
  }
}

/**
 * Get last N lines of log.txt
 */
export async function getRecentLogs(limit = 200) {
  if (isCloud) return []; // Skip in Workers

  // Runtime check: ensure fs module is available
  if (!fs || typeof fs.existsSync !== "function") {
    console.error("[usageDb] fs module not available in this environment");
    return [];
  }

  if (!LOG_FILE) {
    console.error("[usageDb] LOG_FILE path not defined");
    return [];
  }

  if (!fs.existsSync(LOG_FILE)) {
    console.log(`[usageDb] Log file does not exist: ${LOG_FILE}`);
    return [];
  }

  try {
    const content = fs.readFileSync(LOG_FILE, "utf-8");
    const lines = content.trim().split("\n");
    return lines.slice(-limit).reverse();
  } catch (error) {
    console.error("[usageDb] Failed to read log.txt:", error.message);
    console.error("[usageDb] LOG_FILE path:", LOG_FILE);
    return [];
  }
}

/**
 * Calculate cost for a usage entry
 * @param {string} provider - Provider ID
 * @param {string} model - Model ID
 * @param {object} tokens - Token counts
 * @returns {number} Cost in dollars
 */
async function calculateCost(provider, model, tokens) {
  if (!tokens || !provider || !model) return 0;

  try {
    const { getPricingForModel } = await import("@/lib/localDb.js");
    const pricing = await getPricingForModel(provider, model);

    if (!pricing) return 0;

    let cost = 0;

    // Input tokens (non-cached)
    const inputTokens = tokens.prompt_tokens || tokens.input_tokens || 0;
    const cachedTokens = tokens.cached_tokens || tokens.cache_read_input_tokens || 0;
    const nonCachedInput = Math.max(0, inputTokens - cachedTokens);

    cost += (nonCachedInput * (pricing.input / 1000000));

    // Cached tokens
    if (cachedTokens > 0) {
      const cachedRate = pricing.cached || pricing.input; // Fallback to input rate
      cost += (cachedTokens * (cachedRate / 1000000));
    }

    // Output tokens
    const outputTokens = tokens.completion_tokens || tokens.output_tokens || 0;
    cost += (outputTokens * (pricing.output / 1000000));

    // Reasoning tokens
    const reasoningTokens = tokens.reasoning_tokens || 0;
    if (reasoningTokens > 0) {
      const reasoningRate = pricing.reasoning || pricing.output; // Fallback to output rate
      cost += (reasoningTokens * (reasoningRate / 1000000));
    }

    // Cache creation tokens
    const cacheCreationTokens = tokens.cache_creation_input_tokens || 0;
    if (cacheCreationTokens > 0) {
      const cacheCreationRate = pricing.cache_creation || pricing.input; // Fallback to input rate
      cost += (cacheCreationTokens * (cacheCreationRate / 1000000));
    }

    return cost;
  } catch (error) {
    console.error("Error calculating cost:", error);
    return 0;
  }
}

const PERIOD_MS = { "24h": 86400000, "7d": 604800000, "30d": 2592000000, "60d": 5184000000 };

/**
 * Get aggregated usage stats
 * @param {"24h"|"7d"|"30d"|"60d"|"all"} period - Time period to filter
 */
export async function getUsageStats(period = "all") {
  const { getProviderConnections, getApiKeys, getProviderNodes } = await import("@/lib/localDb.js");

  let allConnections = [];
  try { allConnections = await getProviderConnections(); } catch {}
  const connectionMap = {};
  for (const conn of allConnections) {
    connectionMap[conn.id] = conn.name || conn.email || conn.id;
  }

  const providerNodeNameMap = {};
  try {
    const nodes = await getProviderNodes();
    for (const node of nodes) {
      if (node.id && node.name) providerNodeNameMap[node.id] = node.name;
    }
  } catch {}

  let allApiKeys = [];
  try { allApiKeys = await getApiKeys(); } catch {}
  const apiKeyMap = {};
  for (const key of allApiKeys) {
    apiKeyMap[key.key] = { name: key.name, id: key.id, createdAt: key.createdAt };
  }

  // Get lifetime total requests from counters
  let lifetimeTotalRequests = 0;
  try {
    const cRes = await query(`SELECT value FROM counters WHERE name = 'total_requests_lifetime'`);
    if (cRes.rows.length > 0) lifetimeTotalRequests = Number(cRes.rows[0].value) || 0;
  } catch {}

  // Recent requests from usage_history (last 100, dedup to 20)
  let recentRequests = [];
  try {
    const res = await query(
      `SELECT timestamp, model, provider, prompt_tokens, completion_tokens, input_tokens, output_tokens, status
       FROM usage_history ORDER BY timestamp DESC LIMIT 100`
    );
    const seen = new Set();
    for (const row of res.rows) {
      const promptTokens = row.prompt_tokens || row.input_tokens || 0;
      const completionTokens = row.completion_tokens || row.output_tokens || 0;
      if (promptTokens === 0 && completionTokens === 0) continue;
      const ts = row.timestamp ? new Date(row.timestamp).toISOString() : "";
      const minute = ts.slice(0, 16);
      const key = `${row.model}|${row.provider}|${promptTokens}|${completionTokens}|${minute}`;
      if (seen.has(key)) continue;
      seen.add(key);
      recentRequests.push({
        timestamp: ts,
        model: row.model,
        provider: row.provider || "",
        promptTokens,
        completionTokens,
        status: row.status || "ok",
      });
      if (recentRequests.length >= 20) break;
    }
  } catch (err) {
    console.error("[usageDb] recentRequests query error:", err.message);
  }

  const stats = {
    totalRequests: lifetimeTotalRequests,
    totalPromptTokens: 0, totalCompletionTokens: 0, totalCost: 0,
    byProvider: {}, byModel: {}, byAccount: {}, byApiKey: {}, byEndpoint: {},
    last10Minutes: [],
    pending: pendingRequests,
    activeRequests: [],
    recentRequests,
    errorProvider: (Date.now() - lastErrorProvider.ts < 10000) ? lastErrorProvider.provider : "",
  };

  // Active requests from pending
  for (const [connectionId, models] of Object.entries(pendingRequests.byAccount)) {
    for (const [modelKey, count] of Object.entries(models)) {
      if (count > 0) {
        const accountName = connectionMap[connectionId] || `Account ${connectionId.slice(0, 8)}...`;
        const match = modelKey.match(/^(.*) \((.*)\)$/);
        stats.activeRequests.push({
          model: match ? match[1] : modelKey,
          provider: match ? match[2] : "unknown",
          account: accountName, count,
        });
      }
    }
  }

  // last10Minutes — from usage_history (last 10 minutes bucketed by minute)
  try {
    const now = new Date();
    const currentMinuteStart = new Date(Math.floor(now.getTime() / 60000) * 60000);
    const tenMinutesAgo = new Date(currentMinuteStart.getTime() - 9 * 60 * 1000);

    const bucketMap = {};
    for (let i = 0; i < 10; i++) {
      const bucketKey = currentMinuteStart.getTime() - (9 - i) * 60 * 1000;
      bucketMap[bucketKey] = { requests: 0, promptTokens: 0, completionTokens: 0, cost: 0 };
      stats.last10Minutes.push(bucketMap[bucketKey]);
    }

    const l10Res = await query(
      `SELECT timestamp, prompt_tokens, completion_tokens, cost
       FROM usage_history WHERE timestamp >= $1 AND timestamp <= $2`,
      [tenMinutesAgo.toISOString(), now.toISOString()]
    );
    for (const row of l10Res.rows) {
      const entryTime = new Date(row.timestamp);
      const entryMinuteStart = Math.floor(entryTime.getTime() / 60000) * 60000;
      if (bucketMap[entryMinuteStart]) {
        bucketMap[entryMinuteStart].requests++;
        bucketMap[entryMinuteStart].promptTokens += row.prompt_tokens || 0;
        bucketMap[entryMinuteStart].completionTokens += row.completion_tokens || 0;
        bucketMap[entryMinuteStart].cost += row.cost || 0;
      }
    }
  } catch (err) {
    console.error("[usageDb] last10Minutes query error:", err.message);
  }

  // Determine if we use usage_daily_summary (7d/30d/60d/all) or usage_history (24h)
  const useDailySummary = period !== "24h";

  if (useDailySummary) {
    // Build date filter for daily summary
    const periodDays = { "7d": 7, "30d": 30, "60d": 60 };
    const maxDays = periodDays[period] || null; // null = all

    let dateCondition = "";
    const dateParams = [];
    if (maxDays) {
      dateCondition = `AND date >= CURRENT_DATE - $1::integer`;
      dateParams.push(maxDays);
    }

    // Fetch all daily summary rows for the period
    let summaryRows = [];
    try {
      const res = await query(
        `SELECT date, scope, scope_key, requests, prompt_tokens, completion_tokens, cost
         FROM usage_daily_summary WHERE 1=1 ${dateCondition} ORDER BY date`,
        dateParams
      );
      summaryRows = res.rows;
    } catch (err) {
      console.error("[usageDb] daily summary query error:", err.message);
    }

    // Process each row by scope
    for (const row of summaryRows) {
      const dateKey = row.date instanceof Date
        ? `${row.date.getFullYear()}-${String(row.date.getMonth() + 1).padStart(2, "0")}-${String(row.date.getDate()).padStart(2, "0")}`
        : String(row.date);
      const rq = Number(row.requests) || 0;
      const pt = Number(row.prompt_tokens) || 0;
      const ct = Number(row.completion_tokens) || 0;
      const co = Number(row.cost) || 0;

      if (row.scope === "total") {
        stats.totalPromptTokens += pt;
        stats.totalCompletionTokens += ct;
        stats.totalCost += co;
      } else if (row.scope === "provider") {
        const prov = row.scope_key;
        if (!stats.byProvider[prov]) stats.byProvider[prov] = { requests: 0, promptTokens: 0, completionTokens: 0, cost: 0 };
        stats.byProvider[prov].requests += rq;
        stats.byProvider[prov].promptTokens += pt;
        stats.byProvider[prov].completionTokens += ct;
        stats.byProvider[prov].cost += co;
      } else if (row.scope === "model") {
        // scope_key = "model|provider"
        const parts = row.scope_key.split("|");
        const rawModel = parts[0] || "";
        const provider = parts[1] || "";
        const statsKey = provider ? `${rawModel} (${provider})` : rawModel;
        const providerDisplayName = providerNodeNameMap[provider] || provider;
        if (!stats.byModel[statsKey]) {
          stats.byModel[statsKey] = { requests: 0, promptTokens: 0, completionTokens: 0, cost: 0, rawModel, provider: providerDisplayName, lastUsed: dateKey };
        }
        stats.byModel[statsKey].requests += rq;
        stats.byModel[statsKey].promptTokens += pt;
        stats.byModel[statsKey].completionTokens += ct;
        stats.byModel[statsKey].cost += co;
        if (dateKey > (stats.byModel[statsKey].lastUsed || "")) stats.byModel[statsKey].lastUsed = dateKey;
      } else if (row.scope === "account") {
        // scope_key = connectionId
        const connId = row.scope_key;
        const accountName = connectionMap[connId] || `Account ${connId.slice(0, 8)}...`;
        // For account scope, we don't store rawModel/provider in daily summary per-account.
        // Use a generic key; the daily summary groups all models under one account scope.
        const accountKey = connId;
        const providerDisplayName = "";
        if (!stats.byAccount[accountKey]) {
          stats.byAccount[accountKey] = { requests: 0, promptTokens: 0, completionTokens: 0, cost: 0, rawModel: "", provider: providerDisplayName, connectionId: connId, accountName, lastUsed: dateKey };
        }
        stats.byAccount[accountKey].requests += rq;
        stats.byAccount[accountKey].promptTokens += pt;
        stats.byAccount[accountKey].completionTokens += ct;
        stats.byAccount[accountKey].cost += co;
        if (dateKey > (stats.byAccount[accountKey].lastUsed || "")) stats.byAccount[accountKey].lastUsed = dateKey;
      } else if (row.scope === "apikey") {
        // scope_key = "apiKeyVal|model|provider"
        const akKey = row.scope_key;
        const parts = akKey.split("|");
        const apiKeyVal = parts[0] || "";
        const rawModel = parts[1] || "";
        const provider = parts[2] || "";
        const providerDisplayName = providerNodeNameMap[provider] || provider;
        const keyInfo = apiKeyVal && apiKeyVal !== "local-no-key" ? apiKeyMap[apiKeyVal] : null;
        const keyName = keyInfo?.name || (apiKeyVal && apiKeyVal !== "local-no-key" ? apiKeyVal.slice(0, 8) + "..." : "Local (No API Key)");
        const apiKeyKey = apiKeyVal || "local-no-key";
        if (!stats.byApiKey[akKey]) {
          stats.byApiKey[akKey] = { requests: 0, promptTokens: 0, completionTokens: 0, cost: 0, rawModel, provider: providerDisplayName, apiKey: apiKeyVal !== "local-no-key" ? apiKeyVal : null, keyName, apiKeyKey, lastUsed: dateKey };
        }
        stats.byApiKey[akKey].requests += rq;
        stats.byApiKey[akKey].promptTokens += pt;
        stats.byApiKey[akKey].completionTokens += ct;
        stats.byApiKey[akKey].cost += co;
        if (dateKey > (stats.byApiKey[akKey].lastUsed || "")) stats.byApiKey[akKey].lastUsed = dateKey;
      } else if (row.scope === "endpoint") {
        // scope_key = "endpoint|model|provider"
        const epKey = row.scope_key;
        const parts = epKey.split("|");
        const endpoint = parts[0] || "Unknown";
        const rawModel = parts[1] || "";
        const provider = parts[2] || "";
        const providerDisplayName = providerNodeNameMap[provider] || provider;
        if (!stats.byEndpoint[epKey]) {
          stats.byEndpoint[epKey] = { requests: 0, promptTokens: 0, completionTokens: 0, cost: 0, endpoint, rawModel, provider: providerDisplayName, lastUsed: dateKey };
        }
        stats.byEndpoint[epKey].requests += rq;
        stats.byEndpoint[epKey].promptTokens += pt;
        stats.byEndpoint[epKey].completionTokens += ct;
        stats.byEndpoint[epKey].cost += co;
        if (dateKey > (stats.byEndpoint[epKey].lastUsed || "")) stats.byEndpoint[epKey].lastUsed = dateKey;
      }
    }
  } else {
    // 24h: query usage_history directly
    const cutoff = new Date(Date.now() - PERIOD_MS["24h"]).toISOString();
    let historyRows = [];
    try {
      const res = await query(
        `SELECT timestamp, model, provider, connection_id, endpoint, api_key,
                prompt_tokens, completion_tokens, input_tokens, output_tokens, cost, status
         FROM usage_history WHERE timestamp >= $1 ORDER BY timestamp ASC`,
        [cutoff]
      );
      historyRows = res.rows;
    } catch (err) {
      console.error("[usageDb] 24h history query error:", err.message);
    }

    for (const entry of historyRows) {
      const promptTokens = entry.prompt_tokens || 0;
      const completionTokens = entry.completion_tokens || 0;
      const entryCost = entry.cost || 0;
      const providerDisplayName = providerNodeNameMap[entry.provider] || entry.provider;
      const entryTimestamp = entry.timestamp ? new Date(entry.timestamp).toISOString() : "";

      stats.totalPromptTokens += promptTokens;
      stats.totalCompletionTokens += completionTokens;
      stats.totalCost += entryCost;

      // byProvider
      if (entry.provider) {
        if (!stats.byProvider[entry.provider]) stats.byProvider[entry.provider] = { requests: 0, promptTokens: 0, completionTokens: 0, cost: 0 };
        stats.byProvider[entry.provider].requests++;
        stats.byProvider[entry.provider].promptTokens += promptTokens;
        stats.byProvider[entry.provider].completionTokens += completionTokens;
        stats.byProvider[entry.provider].cost += entryCost;
      }

      // byModel
      const modelKey = entry.provider ? `${entry.model} (${entry.provider})` : entry.model;
      if (!stats.byModel[modelKey]) {
        stats.byModel[modelKey] = { requests: 0, promptTokens: 0, completionTokens: 0, cost: 0, rawModel: entry.model, provider: providerDisplayName, lastUsed: entryTimestamp };
      }
      stats.byModel[modelKey].requests++;
      stats.byModel[modelKey].promptTokens += promptTokens;
      stats.byModel[modelKey].completionTokens += completionTokens;
      stats.byModel[modelKey].cost += entryCost;
      if (new Date(entryTimestamp) > new Date(stats.byModel[modelKey].lastUsed)) stats.byModel[modelKey].lastUsed = entryTimestamp;

      // byAccount
      if (entry.connection_id) {
        const accountName = connectionMap[entry.connection_id] || `Account ${entry.connection_id.slice(0, 8)}...`;
        const accountKey = `${entry.model} (${entry.provider} - ${accountName})`;
        if (!stats.byAccount[accountKey]) {
          stats.byAccount[accountKey] = { requests: 0, promptTokens: 0, completionTokens: 0, cost: 0, rawModel: entry.model, provider: providerDisplayName, connectionId: entry.connection_id, accountName, lastUsed: entryTimestamp };
        }
        stats.byAccount[accountKey].requests++;
        stats.byAccount[accountKey].promptTokens += promptTokens;
        stats.byAccount[accountKey].completionTokens += completionTokens;
        stats.byAccount[accountKey].cost += entryCost;
        if (new Date(entryTimestamp) > new Date(stats.byAccount[accountKey].lastUsed)) stats.byAccount[accountKey].lastUsed = entryTimestamp;
      }

      // byApiKey
      if (entry.api_key && typeof entry.api_key === "string") {
        const keyInfo = apiKeyMap[entry.api_key];
        const keyName = keyInfo?.name || entry.api_key.slice(0, 8) + "...";
        const apiKeyModelKey = `${entry.api_key}|${entry.model}|${entry.provider || "unknown"}`;
        if (!stats.byApiKey[apiKeyModelKey]) {
          stats.byApiKey[apiKeyModelKey] = { requests: 0, promptTokens: 0, completionTokens: 0, cost: 0, rawModel: entry.model, provider: providerDisplayName, apiKey: entry.api_key, keyName, apiKeyKey: entry.api_key, lastUsed: entryTimestamp };
        }
        const ake = stats.byApiKey[apiKeyModelKey];
        ake.requests++; ake.promptTokens += promptTokens; ake.completionTokens += completionTokens; ake.cost += entryCost;
        if (new Date(entryTimestamp) > new Date(ake.lastUsed)) ake.lastUsed = entryTimestamp;
      } else {
        if (!stats.byApiKey["local-no-key"]) {
          stats.byApiKey["local-no-key"] = { requests: 0, promptTokens: 0, completionTokens: 0, cost: 0, rawModel: entry.model, provider: providerDisplayName, apiKey: null, keyName: "Local (No API Key)", apiKeyKey: "local-no-key", lastUsed: entryTimestamp };
        }
        const ake = stats.byApiKey["local-no-key"];
        ake.requests++; ake.promptTokens += promptTokens; ake.completionTokens += completionTokens; ake.cost += entryCost;
        if (new Date(entryTimestamp) > new Date(ake.lastUsed)) ake.lastUsed = entryTimestamp;
      }

      // byEndpoint
      const endpoint = entry.endpoint || "Unknown";
      const endpointModelKey = `${endpoint}|${entry.model}|${entry.provider || "unknown"}`;
      if (!stats.byEndpoint[endpointModelKey]) {
        stats.byEndpoint[endpointModelKey] = { requests: 0, promptTokens: 0, completionTokens: 0, cost: 0, endpoint, rawModel: entry.model, provider: providerDisplayName, lastUsed: entryTimestamp };
      }
      const epe = stats.byEndpoint[endpointModelKey];
      epe.requests++; epe.promptTokens += promptTokens; epe.completionTokens += completionTokens; epe.cost += entryCost;
      if (new Date(entryTimestamp) > new Date(epe.lastUsed)) epe.lastUsed = entryTimestamp;
    }
  }

  return stats;
}

/**
 * Get time-series chart data for a given period
 * @param {"24h"|"7d"|"30d"|"60d"} period
 * @returns {Promise<Array<{label: string, tokens: number, cost: number}>>}
 */
export async function getChartData(period = "7d") {
  const now = Date.now();

  // 24h: bucket by hour from usage_history
  if (period === "24h") {
    const bucketCount = 24;
    const bucketMs = 3600000;
    const labelFn = (ts) => new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const startTime = now - bucketCount * bucketMs;
    const buckets = Array.from({ length: bucketCount }, (_, i) => {
      const ts = startTime + i * bucketMs;
      return { label: labelFn(ts), tokens: 0, cost: 0 };
    });

    try {
      const res = await query(
        `SELECT timestamp, prompt_tokens, completion_tokens, cost
         FROM usage_history WHERE timestamp >= $1 ORDER BY timestamp ASC`,
        [new Date(startTime).toISOString()]
      );
      for (const row of res.rows) {
        const entryTime = new Date(row.timestamp).getTime();
        if (entryTime < startTime || entryTime > now) continue;
        const idx = Math.min(Math.floor((entryTime - startTime) / bucketMs), bucketCount - 1);
        buckets[idx].tokens += (row.prompt_tokens || 0) + (row.completion_tokens || 0);
        buckets[idx].cost += row.cost || 0;
      }
    } catch (err) {
      console.error("[usageDb] getChartData 24h query error:", err.message);
    }

    return buckets;
  }

  // 7d/30d/60d: bucket by day from usage_daily_summary
  const bucketCount = period === "7d" ? 7 : period === "30d" ? 30 : 60;
  const today = new Date();
  const labelFn = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // Pre-build bucket array and a dateKey map
  const buckets = [];
  const dateKeyMap = {};
  for (let i = 0; i < bucketCount; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (bucketCount - 1 - i));
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const bucket = { label: labelFn(d), tokens: 0, cost: 0 };
    buckets.push(bucket);
    dateKeyMap[dateKey] = bucket;
  }

  // Query total scope from daily summary
  try {
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (bucketCount - 1));
    const startDateKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;

    const res = await query(
      `SELECT date, prompt_tokens, completion_tokens, cost
       FROM usage_daily_summary
       WHERE scope = 'total' AND scope_key = '' AND date >= $1
       ORDER BY date`,
      [startDateKey]
    );

    for (const row of res.rows) {
      const dk = row.date instanceof Date
        ? `${row.date.getFullYear()}-${String(row.date.getMonth() + 1).padStart(2, "0")}-${String(row.date.getDate()).padStart(2, "0")}`
        : String(row.date);
      if (dateKeyMap[dk]) {
        dateKeyMap[dk].tokens = (Number(row.prompt_tokens) || 0) + (Number(row.completion_tokens) || 0);
        dateKeyMap[dk].cost = Number(row.cost) || 0;
      }
    }
  } catch (err) {
    console.error("[usageDb] getChartData daily query error:", err.message);
  }

  return buckets;
}

// Re-export request details functions from new module
export { saveRequestDetail, getRequestDetails, getRequestDetailById } from "./requestDetailsDb.js";
