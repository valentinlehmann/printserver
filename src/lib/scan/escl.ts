import { esclBase } from "@/lib/env";
import { parseScannerCapabilities } from "@/lib/scan/escl-xml";
import type { ScannerCapabilities } from "@/lib/scan/types";

// Thin eSCL (AirScan) HTTP client. The scan-job lifecycle (startScanJob /
// nextDocument / cancelScanJob) is added in M6; this module currently exposes
// only live capability discovery.

/** GET /eSCL/ScannerCapabilities and normalize it. Throws on transport error. */
export async function fetchScannerCapabilities(): Promise<ScannerCapabilities> {
  const res = await fetch(`${esclBase()}/ScannerCapabilities`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`eSCL ScannerCapabilities returned ${res.status}`);
  }
  return parseScannerCapabilities(await res.text());
}
