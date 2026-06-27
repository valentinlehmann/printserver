// NB: intentionally not `server-only` — this module is also imported by the
// standalone migrate/seed scripts, which run outside the RSC context.
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";

import { env } from "@/lib/env";

/**
 * Process-wide better-sqlite3 connection. better-auth consumes this instance
 * directly (better-sqlite3 is a supported driver), so we expose a single shared
 * handle. WAL mode keeps reads non-blocking during writes.
 */
function createDb(): Database.Database {
  const path = resolve(env.DATABASE_PATH);
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

// Reuse a single connection across hot-reloads in development.
const globalForDb = globalThis as unknown as { __db?: Database.Database };
export const db = globalForDb.__db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.__db = db;
