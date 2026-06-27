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

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Resolve a (possibly relative) job Location header against the scanner host. */
function resolveJobUri(location: string): string {
  return new URL(location, `${esclBase()}/`).toString().replace(/\/$/, "");
}

/**
 * POST /eSCL/ScanJobs with the given ScanSettings XML. Returns the absolute job
 * URI from the Location header. Throws on a non-201 response.
 */
export async function startScanJob(settingsXml: string): Promise<string> {
  const res = await fetch(`${esclBase()}/ScanJobs`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body: settingsXml,
  });
  if (res.status !== 201) {
    throw new Error(`eSCL ScanJobs returned ${res.status}`);
  }
  const location = res.headers.get("Location");
  if (!location) throw new Error("eSCL: ScanJobs response missing Location");
  // TODO(quirk): some firmware returns a relative Location; resolveJobUri copes.
  return resolveJobUri(location);
}

/**
 * GET <jobUri>/NextDocument. Returns the next page as a JPEG buffer, or null
 * when the scanner reports there are no more pages (404/410/empty body).
 * Retries briefly on 503 (scanner still processing).
 */
export async function nextDocument(jobUri: string): Promise<Buffer | null> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const res = await fetch(`${jobUri}/NextDocument`, { cache: "no-store" });
    // End of job: no more documents available.
    if (res.status === 404 || res.status === 410) return null;
    // Scanner still warming up / processing — wait and retry.
    if (res.status === 503) {
      await delay(1000);
      continue;
    }
    if (!res.ok) throw new Error(`eSCL NextDocument returned ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 0 ? buf : null;
  }
  throw new Error("eSCL NextDocument timed out (scanner busy)");
}

/** DELETE the scan job (best-effort cancel). */
export async function cancelScanJob(jobUri: string): Promise<void> {
  await fetch(jobUri, { method: "DELETE" }).catch(() => {});
}
