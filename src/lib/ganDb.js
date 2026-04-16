import { query } from "@/lib/pgPool.js";
import { v4 as uuidv4 } from "uuid";

// ============================================================
// GaN Agent Model Tiering Presets
// Maps agent roles to combo names (fallback chains)
// ============================================================

export const GAN_AGENT_PRESETS = {
  right_hand:  { combo: "gan-premium",   budget: 50000, agents: ["GaN"] },
  security:    { combo: "gan-premium",   budget: 30000, agents: ["WARD", "CIPHER"] },
  orchestrator:{ combo: "gan-standard",  budget: 40000, agents: ["NEXUS"] },
  research:    { combo: "gan-standard",  budget: 25000, agents: ["ORACLE", "SCHOLAR", "PRISM", "BEACON"] },
  execution:   { combo: "gan-standard",  budget: 20000, agents: ["PHANTOM", "ANVIL", "HERMES", "TITAN", "ECHO"] },
  detection:   { combo: "gan-standard",  budget: 15000, agents: ["ARGUS"] },
  support:     { combo: "gan-economy",   budget: 15000, agents: ["AEGIS", "SPRING", "SAGE", "PIONEER"] },
  intelligence:{ combo: "gan-standard",  budget: 20000, agents: ["HERALD", "THREAD"] },
  human:       { combo: "gan-economy",   budget: 15000, agents: ["NOVA", "VEIL", "POSTAL", "WARDEN", "DARWIN", "MUSE"] },
  developer:   { combo: "gan-standard",  budget: 25000, agents: ["COMMIT", "CORE", "CANVAS", "DEPLOY"] },
  expansion:   { combo: "gan-economy",   budget: 15000, agents: ["CLOAK", "MINT", "YIELD", "BOUNTY", "QUORUM"] },
  meta:        { combo: "gan-standard",  budget: 20000, agents: ["LEDGER", "FORGE", "ATLAS"] },
};

export const GAN_COMBO_PRESETS = {
  "gan-premium": [
    "cc/claude-opus-4-6",
    "anthropic/claude-sonnet-4",
    "groq/llama-3.3-70b-versatile",
    "iflow/kimi-k2-thinking",
  ],
  "gan-standard": [
    "anthropic/claude-sonnet-4",
    "groq/llama-3.3-70b-versatile",
    "glm/glm-4.7",
    "iflow/kimi-k2-thinking",
  ],
  "gan-economy": [
    "groq/llama-3.3-70b-versatile",
    "glm/glm-4.7",
    "minimax/MiniMax-M2.1",
    "iflow/qwen3-coder-plus",
  ],
};

// ============================================================
// Projects
// ============================================================

export async function getProjects() {
  const result = await query("SELECT * FROM projects ORDER BY created_at");
  return result.rows.map(rowToProject);
}

export async function getProjectById(id) {
  const result = await query("SELECT * FROM projects WHERE id = $1", [id]);
  return result.rows.length > 0 ? rowToProject(result.rows[0]) : null;
}

export async function getProjectByName(name) {
  const result = await query("SELECT * FROM projects WHERE name = $1", [name]);
  return result.rows.length > 0 ? rowToProject(result.rows[0]) : null;
}

export async function createProject(data) {
  const id = uuidv4();
  const now = new Date().toISOString();
  await query(
    `INSERT INTO projects (id, name, description, api_key_prefix, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, data.name, data.description || null, data.apiKeyPrefix || data.name, data.isActive !== false, now, now]
  );
  return getProjectById(id);
}

export async function updateProject(id, data) {
  const fields = [];
  const params = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    const col = camelToSnake(key);
    fields.push(`${col} = $${idx++}`);
    params.push(value);
  }
  fields.push(`updated_at = $${idx++}`);
  params.push(new Date().toISOString());
  params.push(id);

  await query(`UPDATE projects SET ${fields.join(", ")} WHERE id = $${idx}`, params);
  return getProjectById(id);
}

export async function deleteProject(id) {
  const result = await query("DELETE FROM projects WHERE id = $1", [id]);
  return result.rowCount > 0;
}

// ============================================================
// Agent Configs
// ============================================================

export async function getAgentConfigs(projectId) {
  const result = await query(
    "SELECT * FROM agent_configs WHERE project_id = $1 ORDER BY agent_name",
    [projectId]
  );
  return result.rows.map(rowToAgentConfig);
}

export async function getAgentConfig(projectId, agentName) {
  const result = await query(
    "SELECT * FROM agent_configs WHERE project_id = $1 AND agent_name = $2",
    [projectId, agentName]
  );
  return result.rows.length > 0 ? rowToAgentConfig(result.rows[0]) : null;
}

export async function upsertAgentConfig(projectId, agentName, data) {
  const now = new Date().toISOString();
  await query(
    `INSERT INTO agent_configs (id, project_id, agent_name, agent_role, combo_name, daily_token_budget, is_active, metadata, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (project_id, agent_name) DO UPDATE SET
       agent_role = COALESCE(EXCLUDED.agent_role, agent_configs.agent_role),
       combo_name = COALESCE(EXCLUDED.combo_name, agent_configs.combo_name),
       daily_token_budget = COALESCE(EXCLUDED.daily_token_budget, agent_configs.daily_token_budget),
       is_active = COALESCE(EXCLUDED.is_active, agent_configs.is_active),
       metadata = COALESCE(EXCLUDED.metadata, agent_configs.metadata),
       updated_at = EXCLUDED.updated_at`,
    [
      uuidv4(), projectId, agentName,
      data.agentRole || null,
      data.comboName || null,
      data.dailyTokenBudget || null,
      data.isActive !== false,
      JSON.stringify(data.metadata || {}),
      now, now,
    ]
  );
  return getAgentConfig(projectId, agentName);
}

export async function deleteAgentConfig(projectId, agentName) {
  const result = await query(
    "DELETE FROM agent_configs WHERE project_id = $1 AND agent_name = $2",
    [projectId, agentName]
  );
  return result.rowCount > 0;
}

export async function resolveAgentCombo(projectId, agentName) {
  const config = await getAgentConfig(projectId, agentName);
  if (config?.comboName) return config.comboName;

  for (const [role, preset] of Object.entries(GAN_AGENT_PRESETS)) {
    if (preset.agents.includes(agentName)) return preset.combo;
  }
  return "gan-economy";
}

export async function checkAgentBudget(projectId, agentName) {
  const config = await getAgentConfig(projectId, agentName);
  if (!config || !config.dailyTokenBudget) return { allowed: true, remaining: null };

  const today = new Date().toISOString().slice(0, 10);

  if (config.budgetResetAt !== today) {
    await query(
      "UPDATE agent_configs SET tokens_used_today = 0, budget_reset_at = $1 WHERE project_id = $2 AND agent_name = $3",
      [today, projectId, agentName]
    );
    return { allowed: true, remaining: config.dailyTokenBudget };
  }

  const remaining = config.dailyTokenBudget - (config.tokensUsedToday || 0);
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

export async function trackAgentTokens(projectId, agentName, tokensUsed) {
  await query(
    "UPDATE agent_configs SET tokens_used_today = tokens_used_today + $1, updated_at = NOW() WHERE project_id = $2 AND agent_name = $3",
    [tokensUsed, projectId, agentName]
  );
}

// ============================================================
// Agent Usage Tracking
// ============================================================

export async function saveAgentUsage(entry) {
  await query(
    `INSERT INTO agent_usage (project_id, agent_name, timestamp, model, provider, prompt_tokens, completion_tokens, cost, combo_used, fallback_level)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      entry.projectId, entry.agentName, entry.timestamp || new Date().toISOString(),
      entry.model, entry.provider,
      entry.promptTokens || 0, entry.completionTokens || 0,
      entry.cost || 0, entry.comboUsed || null, entry.fallbackLevel || 0,
    ]
  );

  const date = (entry.timestamp || new Date().toISOString()).slice(0, 10);
  await query(
    `INSERT INTO agent_daily_summary (date, project_id, agent_name, requests, prompt_tokens, completion_tokens, cost, fallbacks)
     VALUES ($1, $2, $3, 1, $4, $5, $6, $7)
     ON CONFLICT (date, project_id, agent_name) DO UPDATE SET
       requests = agent_daily_summary.requests + 1,
       prompt_tokens = agent_daily_summary.prompt_tokens + EXCLUDED.prompt_tokens,
       completion_tokens = agent_daily_summary.completion_tokens + EXCLUDED.completion_tokens,
       cost = agent_daily_summary.cost + EXCLUDED.cost,
       fallbacks = agent_daily_summary.fallbacks + EXCLUDED.fallbacks`,
    [date, entry.projectId, entry.agentName, entry.promptTokens || 0, entry.completionTokens || 0, entry.cost || 0, entry.fallbackLevel > 0 ? 1 : 0]
  );

  if ((entry.promptTokens || 0) + (entry.completionTokens || 0) > 0) {
    await trackAgentTokens(entry.projectId, entry.agentName, (entry.promptTokens || 0) + (entry.completionTokens || 0));
  }
}

export async function getAgentUsageStats(projectId, period = "7d") {
  const days = { "24h": 1, "7d": 7, "30d": 30, "all": 9999 };
  const maxDays = days[period] || 7;

  const result = await query(
    `SELECT agent_name,
            SUM(requests) as requests,
            SUM(prompt_tokens) as prompt_tokens,
            SUM(completion_tokens) as completion_tokens,
            SUM(cost) as cost,
            SUM(fallbacks) as fallbacks
     FROM agent_daily_summary
     WHERE project_id = $1 AND date >= CURRENT_DATE - $2::integer
     GROUP BY agent_name
     ORDER BY SUM(cost) DESC`,
    [projectId, maxDays]
  );

  return result.rows.map(row => ({
    agentName: row.agent_name,
    requests: parseInt(row.requests, 10),
    promptTokens: parseInt(row.prompt_tokens, 10),
    completionTokens: parseInt(row.completion_tokens, 10),
    totalTokens: parseInt(row.prompt_tokens, 10) + parseInt(row.completion_tokens, 10),
    cost: parseFloat(row.cost),
    fallbacks: parseInt(row.fallbacks, 10),
  }));
}

export async function getProjectUsageStats(period = "7d") {
  const days = { "24h": 1, "7d": 7, "30d": 30, "all": 9999 };
  const maxDays = days[period] || 7;

  const result = await query(
    `SELECT p.name as project_name, p.id as project_id,
            COALESCE(SUM(a.requests), 0) as requests,
            COALESCE(SUM(a.prompt_tokens), 0) as prompt_tokens,
            COALESCE(SUM(a.completion_tokens), 0) as completion_tokens,
            COALESCE(SUM(a.cost), 0) as cost
     FROM projects p
     LEFT JOIN agent_daily_summary a ON p.id = a.project_id AND a.date >= CURRENT_DATE - $1::integer
     WHERE p.is_active = true
     GROUP BY p.id, p.name
     ORDER BY COALESCE(SUM(a.cost), 0) DESC`,
    [maxDays]
  );

  return result.rows.map(row => ({
    projectId: row.project_id,
    projectName: row.project_name,
    requests: parseInt(row.requests, 10),
    promptTokens: parseInt(row.prompt_tokens, 10),
    completionTokens: parseInt(row.completion_tokens, 10),
    cost: parseFloat(row.cost),
  }));
}

// ============================================================
// Seed GaN Combo Presets
// ============================================================

export async function seedGanCombos() {
  const { getCombos, createCombo } = await import("@/lib/localDb.js");
  const existing = await getCombos();
  const existingNames = new Set(existing.map(c => c.name));

  let created = 0;
  for (const [name, models] of Object.entries(GAN_COMBO_PRESETS)) {
    if (!existingNames.has(name)) {
      await createCombo({ name, models });
      created++;
      console.log(`[GaN] Created combo preset: ${name}`);
    }
  }
  return created;
}

export async function seedGanAgentConfigs(projectId) {
  let created = 0;
  for (const [role, preset] of Object.entries(GAN_AGENT_PRESETS)) {
    for (const agentName of preset.agents) {
      const existing = await getAgentConfig(projectId, agentName);
      if (!existing) {
        await upsertAgentConfig(projectId, agentName, {
          agentRole: role,
          comboName: preset.combo,
          dailyTokenBudget: preset.budget,
        });
        created++;
      }
    }
  }
  console.log(`[GaN] Seeded ${created} agent configs`);
  return created;
}

// ============================================================
// Helpers
// ============================================================

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function rowToProject(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    apiKeyPrefix: row.api_key_prefix,
    isActive: row.is_active,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

function rowToAgentConfig(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    agentName: row.agent_name,
    agentRole: row.agent_role,
    comboName: row.combo_name,
    dailyTokenBudget: row.daily_token_budget,
    tokensUsedToday: row.tokens_used_today,
    budgetResetAt: row.budget_reset_at ? row.budget_reset_at.toISOString().slice(0, 10) : null,
    isActive: row.is_active,
    metadata: row.metadata || {},
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}
