import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins/admin";
import { magicLink } from "better-auth/plugins/magic-link";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "@better-auth/passkey";

import { db } from "@/lib/db/client";
import { env } from "@/lib/env";
import { recordEnrollmentLink } from "@/lib/auth/enrollment";

/**
 * Server-side auth instance.
 *
 * End users only ever log in with passkeys. Password sign-in is disabled, and
 * public sign-up is off — accounts are created by an admin. First-time passkey
 * enrollment (and device recovery) is bootstrapped with an admin-issued,
 * single-use magic link that opens a short session just long enough to register
 * a passkey (see /enroll). The magic link is the only non-passkey path and is
 * never surfaced as a self-service login.
 */
export const auth = betterAuth({
  database: db,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // Passwords are never used; passkeys + admin-issued magic links only.
  emailAndPassword: { enabled: false },

  plugins: [
    admin(),
    magicLink({
      // Magic links are issued by the admin for existing accounts only.
      disableSignUp: true,
      // 24h gives the recipient time to open the enrollment link.
      expiresIn: 60 * 60 * 24,
      sendMagicLink: async ({ email, url }) => {
        // No SMTP: hand the link to the admin UI / seed script instead.
        recordEnrollmentLink(email, url);
      },
    }),
    passkey({
      rpID: env.PASSKEY_RP_ID,
      rpName: env.PASSKEY_RP_NAME,
      // Full origin (scheme + host [+ port]); must match the public URL behind
      // the reverse proxy or WebAuthn verification fails.
      origin: env.BETTER_AUTH_URL,
    }),
    // nextCookies() must be the LAST plugin so it can set cookies on responses.
    nextCookies(),
  ],
});

export type Auth = typeof auth;
