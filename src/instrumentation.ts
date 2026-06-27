/**
 * Runs once at server startup (Next.js instrumentation hook). In the Node.js
 * runtime it applies the better-auth DB schema and, on first run only, can seed
 * the initial admin and print a one-time passkey-enrollment link to the logs.
 *
 * This keeps the Docker image free of a separate migrate/seed toolchain — the
 * volume DB self-initializes on container start.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getMigrations } = await import("better-auth/db/migration");
  const { auth } = await import("@/lib/auth/auth");

  try {
    const { runMigrations } = await getMigrations(auth.options);
    await runMigrations();
  } catch (err) {
    console.error("[startup] database migration failed:", err);
    return;
  }

  // Optional first-run admin seed (configure SEED_ADMIN_EMAIL to enable).
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) return;
  const name = process.env.SEED_ADMIN_NAME || "Admin";

  let created = false;
  try {
    // No request headers => createUser bypasses the admin-session check and may
    // assign the admin role (used only for trusted server-side bootstrap).
    await auth.api.createUser({ body: { email, name, role: "admin" } });
    created = true;
    console.log(`[startup] created admin account: ${email}`);
  } catch {
    // Admin already exists — nothing to do.
  }

  if (created) {
    try {
      await auth.api.signInMagicLink({
        body: { email, callbackURL: "/enroll", errorCallbackURL: "/login" },
        headers: new Headers(),
      });
      const { takeEnrollmentLink } = await import("@/lib/auth/enrollment");
      const link = takeEnrollmentLink(email);
      console.log(
        `\n[startup] Open this one-time link to register the admin passkey:\n  ${link ?? "<failed to generate>"}\n`,
      );
    } catch (err) {
      console.error("[startup] failed to issue enrollment link:", err);
    }
  }
}
