import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (pool) return pool;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/ganrouter",
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on("error", (err) => {
    console.error("[PG] Unexpected pool error:", err.message);
  });

  return pool;
}

export async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}

export async function getClient() {
  const p = getPool();
  return p.connect();
}

let initialized = false;

export async function initSchema() {
  if (initialized) return;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  await query(schemaSql);
  initialized = true;
  console.log("[PG] Schema initialized");
}
