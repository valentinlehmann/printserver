// Side-effect module: load .env files so standalone scripts (migrate/seed) use
// the same config as the Next.js app (which auto-loads these). Import this FIRST,
// before any module that reads process.env (e.g. @/lib/env).
//
// Precedence matches Next.js: .env.local overrides .env. process.loadEnvFile does
// not overwrite already-set variables, so load .env.local first.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // File missing — ignore.
  }
}
