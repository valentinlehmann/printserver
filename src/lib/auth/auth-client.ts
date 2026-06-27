"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

/**
 * Browser auth client. Mirrors the server plugin set so the typed actions
 * (`signIn.passkey`, `passkey.addPasskey`, `admin.*`) are available.
 */
export const authClient = createAuthClient({
  plugins: [passkeyClient(), adminClient(), magicLinkClient()],
});

export const { signIn, signOut, useSession } = authClient;
