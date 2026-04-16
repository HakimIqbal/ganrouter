-- GaNRouter PostgreSQL Schema
-- Replaces LowDB (db.json, usage.json, request-details.json)

CREATE TABLE IF NOT EXISTS provider_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(100) NOT NULL,
  auth_type VARCHAR(50) DEFAULT 'apikey',
  name VARCHAR(255),
  priority INTEGER DEFAULT 999,
  is_active BOOLEAN DEFAULT true,
  display_name VARCHAR(255),
  email VARCHAR(255),
  global_priority INTEGER,
  default_model VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  token_type VARCHAR(50),
  scope TEXT,
  id_token TEXT,
  project_id VARCHAR(255),
  api_key TEXT,
  test_status VARCHAR(50),
  last_tested TIMESTAMPTZ,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,
  rate_limited_until TIMESTAMPTZ,
  expires_in INTEGER,
  error_code VARCHAR(100),
  consecutive_use_count INTEGER DEFAULT 0,
  provider_specific_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS provider_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100),
  name VARCHAR(255),
  prefix VARCHAR(50),
  api_type VARCHAR(50),
  base_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proxy_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  proxy_url TEXT,
  no_proxy TEXT,
  type VARCHAR(50) DEFAULT 'http',
  is_active BOOLEAN DEFAULT true,
  strict_proxy BOOLEAN DEFAULT false,
  test_status VARCHAR(50),
  last_tested_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  models JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  key VARCHAR(255) UNIQUE NOT NULL,
  machine_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS model_aliases (
  alias VARCHAR(255) PRIMARY KEY,
  model VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS mitm_aliases (
  tool_name VARCHAR(255) PRIMARY KEY,
  mappings JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS pricing (
  provider VARCHAR(100) NOT NULL,
  model VARCHAR(255) NOT NULL,
  pricing_data JSONB DEFAULT '{}',
  PRIMARY KEY (provider, model)
);

-- Usage tracking (replaces usage.json)
CREATE TABLE IF NOT EXISTS usage_history (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  model VARCHAR(255),
  provider VARCHAR(100),
  connection_id UUID,
  endpoint VARCHAR(255),
  api_key VARCHAR(255),
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost DOUBLE PRECISION DEFAULT 0,
  status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS usage_daily_summary (
  date DATE NOT NULL,
  scope VARCHAR(50) NOT NULL DEFAULT 'total',
  scope_key VARCHAR(255) NOT NULL DEFAULT '',
  requests INTEGER DEFAULT 0,
  prompt_tokens BIGINT DEFAULT 0,
  completion_tokens BIGINT DEFAULT 0,
  cost DOUBLE PRECISION DEFAULT 0,
  PRIMARY KEY (date, scope, scope_key)
);

-- Request details (replaces request-details.json)
CREATE TABLE IF NOT EXISTS request_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(100),
  model VARCHAR(255),
  connection_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50),
  latency JSONB DEFAULT '{}',
  tokens JSONB DEFAULT '{}',
  request JSONB DEFAULT '{}',
  provider_request JSONB DEFAULT '{}',
  provider_response JSONB DEFAULT '{}',
  response JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_provider_connections_provider ON provider_connections(provider);
CREATE INDEX IF NOT EXISTS idx_provider_connections_active ON provider_connections(is_active);
CREATE INDEX IF NOT EXISTS idx_usage_history_timestamp ON usage_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_history_provider ON usage_history(provider);
CREATE INDEX IF NOT EXISTS idx_usage_history_model ON usage_history(model);
CREATE INDEX IF NOT EXISTS idx_usage_history_connection ON usage_history(connection_id);
CREATE INDEX IF NOT EXISTS idx_usage_daily_date ON usage_daily_summary(date);
CREATE INDEX IF NOT EXISTS idx_request_details_timestamp ON request_details(timestamp);
CREATE INDEX IF NOT EXISTS idx_request_details_provider ON request_details(provider);

-- Lifetime counter
CREATE TABLE IF NOT EXISTS counters (
  name VARCHAR(100) PRIMARY KEY,
  value BIGINT DEFAULT 0
);
INSERT INTO counters (name, value) VALUES ('total_requests_lifetime', 0) ON CONFLICT DO NOTHING;

-- ============================================================
-- GaN-SPECIFIC: Projects + Agent Routing
-- ============================================================

-- Projects — multi-project isolation
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  api_key_prefix VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO projects (name, description, api_key_prefix) VALUES ('gan', 'GaN — Governing Autonomous Navigator', 'gan') ON CONFLICT DO NOTHING;

-- Agent routing configs — per-agent model tiering
CREATE TABLE IF NOT EXISTS agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_name VARCHAR(100) NOT NULL,
  agent_role VARCHAR(100),
  combo_name VARCHAR(255),
  daily_token_budget INTEGER,
  tokens_used_today INTEGER DEFAULT 0,
  budget_reset_at DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, agent_name)
);

-- Agent usage tracking — per-agent cost/token analytics
CREATE TABLE IF NOT EXISTS agent_usage (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_name VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  model VARCHAR(255),
  provider VARCHAR(100),
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  cost DOUBLE PRECISION DEFAULT 0,
  combo_used VARCHAR(255),
  fallback_level INTEGER DEFAULT 0
);

-- Agent daily summary
CREATE TABLE IF NOT EXISTS agent_daily_summary (
  date DATE NOT NULL,
  project_id UUID NOT NULL,
  agent_name VARCHAR(100) NOT NULL,
  requests INTEGER DEFAULT 0,
  prompt_tokens BIGINT DEFAULT 0,
  completion_tokens BIGINT DEFAULT 0,
  cost DOUBLE PRECISION DEFAULT 0,
  fallbacks INTEGER DEFAULT 0,
  PRIMARY KEY (date, project_id, agent_name)
);

-- Project-level API keys — isolated per project
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);

-- Add agent_name + project_id to usage_history for tracking
ALTER TABLE usage_history ADD COLUMN IF NOT EXISTS agent_name VARCHAR(100);
ALTER TABLE usage_history ADD COLUMN IF NOT EXISTS project_id UUID;

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_agent_configs_project ON agent_configs(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_configs_name ON agent_configs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_usage_project ON agent_usage(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_agent ON agent_usage(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_usage_timestamp ON agent_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_daily_date ON agent_daily_summary(date);
CREATE INDEX IF NOT EXISTS idx_usage_history_agent ON usage_history(agent_name);
CREATE INDEX IF NOT EXISTS idx_usage_history_project ON usage_history(project_id);
