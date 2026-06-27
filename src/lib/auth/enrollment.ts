/**
 * In-process store for the most recent passkey-enrollment magic link per email.
 *
 * Rationale: this deployment has no SMTP server. Instead of emailing the magic
 * link, the `sendMagicLink` callback records it here, and the admin UI / seed
 * script reads it back to display a copyable enrollment URL that the admin
 * shares out-of-band (WhatsApp, etc.). The link itself is single-use and short
 * lived (enforced by better-auth's magic-link token).
 *
 * A module-scoped Map is correct for the single-container deployment. It is also
 * shared across dev hot-reloads via globalThis.
 */
type RecordedLink = { url: string; createdAt: number };

const globalForEnroll = globalThis as unknown as {
  __enrollmentLinks?: Map<string, RecordedLink>;
};
const links: Map<string, RecordedLink> =
  globalForEnroll.__enrollmentLinks ?? new Map();
globalForEnroll.__enrollmentLinks = links;

export function recordEnrollmentLink(email: string, url: string): void {
  links.set(email.toLowerCase(), { url, createdAt: Date.now() });
}

/** Read and remove the pending enrollment link for an email. */
export function takeEnrollmentLink(email: string): string | undefined {
  const key = email.toLowerCase();
  const entry = links.get(key);
  if (entry) links.delete(key);
  return entry?.url;
}
