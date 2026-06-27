/**
 * Create the first admin account and print a one-time enrollment link.
 * Run AFTER `pnpm migrate`, with `pnpm seed`.
 *
 * Configure via env or args:
 *   SEED_ADMIN_EMAIL / argv[2]  (default: info@valentinlehmann.de)
 *   SEED_ADMIN_NAME  / argv[3]  (default: Admin)
 *
 * Called without request headers, better-auth's admin createUser skips the
 * admin-session check, so this can bootstrap the very first admin. Open the
 * printed link to register your passkey.
 */
import { auth } from "@/lib/auth/auth";
import { takeEnrollmentLink } from "@/lib/auth/enrollment";

async function main() {
  const email = (
    process.env.SEED_ADMIN_EMAIL ??
    process.argv[2] ??
    "info@valentinlehmann.de"
  )
    .trim()
    .toLowerCase();
  const name = process.env.SEED_ADMIN_NAME ?? process.argv[3] ?? "Admin";

  try {
    await auth.api.createUser({ body: { email, name, role: "admin" } });
    console.log(`✓ Created admin account: ${email}`);
  } catch {
    console.log(`• Admin ${email} already exists — issuing a fresh link.`);
  }

  await auth.api.signInMagicLink({
    body: { email, callbackURL: "/enroll", errorCallbackURL: "/login" },
    // The sign-in endpoint requires a headers object even though this script
    // has no real request context.
    headers: new Headers(),
  });
  const link = takeEnrollmentLink(email);

  console.log("\nOpen this one-time link to register your passkey:\n");
  console.log(`  ${link ?? "<failed to generate enrollment link>"}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
