export type AdminActionResult =
  | { ok: true; link: string; email: string }
  | { ok: false; error: string };

export const ADMIN_INITIAL_RESULT: AdminActionResult | null = null;
