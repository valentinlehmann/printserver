import { z } from "zod";

/**
 * Server-only, validated environment configuration. Import this anywhere on the
 * server to read deploy-time settings; never import it into client components.
 *
 * Every field has a development-friendly default so the app boots locally with
 * no `.env`. Production deployments MUST override the secrets and printer IP.
 */

/** Parse loose truthy strings ("1"/"true") without zod's footgun on "false". */
const boolFromEnv = z
  .string()
  .optional()
  .transform((v) => v === "1" || v?.toLowerCase() === "true");

const schema = z.object({
  // --- Printer addressing -------------------------------------------------
  // Empty PRINTER_IP => capability discovery fails fast and the UI uses the
  // static fallback profile (good for offline development).
  PRINTER_IP: z.string().default(""),
  PRINTER_IPP_PORT: z.coerce.number().int().positive().default(631),
  PRINTER_IPP_PATH: z.string().default("/ipp/print"),
  PRINTER_ESCL_SCHEME: z.enum(["http", "https"]).default("http"),
  PRINTER_ESCL_PORT: z.coerce.number().int().positive().default(80),
  PRINTER_ESCL_PATH: z.string().default("/eSCL"),

  // CUPS print backend (preferred — rasterizes PDF for the printer). If a queue
  // with this name already exists it is used as-is; otherwise an IPP-Everywhere
  // queue pointing at PRINTER_IP is created on demand.
  PRINTER_QUEUE_NAME: z.string().default("printserver"),
  // Force a print backend: "auto" (CUPS if `lp` exists, else direct IPP),
  // "cups", or "ipp".
  PRINT_BACKEND: z.enum(["auto", "cups", "ipp"]).default("auto"),

  // --- Auth ---------------------------------------------------------------
  BETTER_AUTH_SECRET: z
    .string()
    .min(16)
    .default("dev-only-insecure-secret-change-me"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  PASSKEY_RP_ID: z.string().default("localhost"),
  PASSKEY_RP_NAME: z.string().default("Printserver"),

  // --- Persistence & limits ----------------------------------------------
  DATABASE_PATH: z.string().default("./data/sqlite.db"),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(100),
  SCAN_JOB_TTL_SECONDS: z.coerce.number().int().positive().default(900),

  // --- Dev/testing --------------------------------------------------------
  // When true, IPP/eSCL clients serve fixtures instead of hitting hardware.
  PRINTER_MOCK: boolFromEnv,
});

export const env = schema.parse(process.env);

/** IPP printer URI, e.g. `ipp://192.168.1.50:631/ipp/print`. */
export function ipppUri(): string {
  return `ipp://${env.PRINTER_IP}:${env.PRINTER_IPP_PORT}${env.PRINTER_IPP_PATH}`;
}

/** eSCL base URL, e.g. `http://192.168.1.50/eSCL`. */
export function esclBase(): string {
  const portPart =
    (env.PRINTER_ESCL_SCHEME === "http" && env.PRINTER_ESCL_PORT === 80) ||
    (env.PRINTER_ESCL_SCHEME === "https" && env.PRINTER_ESCL_PORT === 443)
      ? ""
      : `:${env.PRINTER_ESCL_PORT}`;
  return `${env.PRINTER_ESCL_SCHEME}://${env.PRINTER_IP}${portPart}${env.PRINTER_ESCL_PATH}`;
}

/** Whether a printer address is configured at all. */
export function hasPrinterConfigured(): boolean {
  return env.PRINTER_IP.trim().length > 0;
}
