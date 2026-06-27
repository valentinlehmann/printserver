"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { getSession } from "@/lib/auth/session";
import { takeEnrollmentLink } from "@/lib/auth/enrollment";
import { t } from "@/lib/messages";
import type { AdminActionResult } from "./types";

async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user.role === "admin";
}

/**
 * Trigger an admin-issued magic link for `email` and return the captured URL.
 * Passing the admin's headers makes better-auth enforce the admin role.
 */
async function issueEnrollmentLink(email: string): Promise<string | undefined> {
  await auth.api.signInMagicLink({
    body: {
      email,
      callbackURL: "/enroll",
      errorCallbackURL: "/login",
    },
    headers: await headers(),
  });
  return takeEnrollmentLink(email);
}

export async function createUserAction(
  _prev: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  if (!(await isAdmin())) return { ok: false, error: t.errors.unauthorized };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  if (!email || !name) {
    return { ok: false, error: t.admin.errorMissingFields };
  }

  try {
    // No `role` => defaults to "user". Admins are seeded out-of-band.
    await auth.api.createUser({
      body: { email, name },
      headers: await headers(),
    });
  } catch {
    return { ok: false, error: t.admin.errorUserExists };
  }

  const link = await issueEnrollmentLink(email);
  if (!link) return { ok: false, error: t.admin.errorLink };
  return { ok: true, link, email };
}

export async function reissueLinkAction(email: string): Promise<AdminActionResult> {
  if (!(await isAdmin())) return { ok: false, error: t.errors.unauthorized };
  try {
    const link = await issueEnrollmentLink(email);
    if (!link) return { ok: false, error: t.admin.errorLink };
    return { ok: true, link, email };
  } catch {
    return { ok: false, error: t.admin.errorLink };
  }
}
