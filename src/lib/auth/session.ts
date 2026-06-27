import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";

/** Cached per-request session lookup ({ session, user } | null). */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/**
 * Returns the active session or throws a 401 Response. Use at the top of every
 * route handler that touches the printer so a forged cookie cannot reach it.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return session;
}

/** Like requireSession but also requires the admin role (403 otherwise). */
export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
  return session;
}
