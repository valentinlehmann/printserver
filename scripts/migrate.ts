/**
 * Apply better-auth's database schema to the configured SQLite file.
 * Run with `pnpm migrate`. Safe to re-run — only missing tables/columns are
 * created. Honors DATABASE_PATH (defaults to ./data/sqlite.db).
 */
import "./load-env"; // must run before any module that reads process.env

import { getMigrations } from "better-auth/db/migration";

import { auth } from "@/lib/auth/auth";

async function main() {
  const { runMigrations, toBeCreated, toBeAdded } = await getMigrations(
    auth.options,
  );
  await runMigrations();
  console.log(
    `✓ Migrations applied (tables created: ${toBeCreated.length}, columns added: ${toBeAdded.length}).`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
