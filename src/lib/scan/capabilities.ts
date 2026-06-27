import { env, hasPrinterConfigured } from "@/lib/env";
import { GX7100_SCANNER_FALLBACK } from "@/lib/scan/capabilities-fallback";
import { parseScannerCapabilities } from "@/lib/scan/escl-xml";
import { GX7100_SCANNER_CAPS_XML } from "@/lib/scan/fixtures/scanner-capabilities-fixture";
import type { ScannerCapabilities } from "@/lib/scan/types";

/**
 * Resolve the scanner's capabilities for the UI.
 * - PRINTER_MOCK: parse the bundled GX7100 eSCL fixture (offline dev).
 * - no printer configured: static fallback profile.
 * - otherwise: live eSCL ScannerCapabilities (wired in M6), falling back on error.
 */
export async function getScannerCapabilities(): Promise<ScannerCapabilities> {
  if (env.PRINTER_MOCK) {
    return parseScannerCapabilities(GX7100_SCANNER_CAPS_XML);
  }
  if (!hasPrinterConfigured()) {
    return GX7100_SCANNER_FALLBACK;
  }
  try {
    const { fetchScannerCapabilities } = await import("@/lib/scan/escl");
    return await fetchScannerCapabilities();
  } catch {
    return GX7100_SCANNER_FALLBACK;
  }
}
