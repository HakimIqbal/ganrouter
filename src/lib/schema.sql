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
