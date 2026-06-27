import * as ipp from "ipp";

import { env, ipppUri } from "@/lib/env";

/** Attributes we ask the printer to report for capability discovery. */
const REQUESTED_ATTRIBUTES = [
  "printer-make-and-model",
  "printer-state",
  "document-format-supported",
  "sides-supported",
  "print-color-mode-supported",
  "media-supported",
  "media-default",
  "copies-supported",
  "number-up-supported",
  "print-quality-supported",
];

function newPrinter() {
  return new ipp.Printer(ipppUri());
}

/**
 * Run a Get-Printer-Attributes operation and return the raw
 * printer-attributes-tag object (normalized by fromIppAttributes elsewhere).
 * Throws on connection errors so the caller can fall back.
 */
export async function queryPrinterAttributes(): Promise<
  Record<string, unknown>
> {
  const printer = newPrinter();
  const res = await new Promise<Record<string, unknown>>((resolve, reject) => {
    printer.execute(
      "Get-Printer-Attributes",
      {
        "operation-attributes-tag": {
          "requesting-user-name": "printerserver",
          "requested-attributes": REQUESTED_ATTRIBUTES,
        },
        // @types/ipp's request shape omits requested-attributes here.
      } as unknown as Parameters<typeof printer.execute>[1],
      (err: Error | null, res: { "printer-attributes-tag"?: object }) => {
        if (err) reject(err);
        else resolve((res["printer-attributes-tag"] ?? {}) as Record<string, unknown>);
      },
    );
  });
  return res;
}

export interface PrintResult {
  ok: boolean;
  jobId?: number;
  state?: string;
  statusCode?: string;
  /** The document-format that was accepted (or last attempted). */
  documentFormat?: string;
  /** Formats the printer advertises (for diagnostics on failure). */
  supportedFormats?: string[];
}

const FORMAT_NOT_SUPPORTED = "client-error-document-format-not-supported";

/** The printer's document-format-supported list ([] if it can't be queried). */
async function getSupportedFormats(): Promise<string[]> {
  try {
    const attrs = await queryPrinterAttributes();
    const raw = attrs["document-format-supported"];
    return Array.isArray(raw) ? raw.map(String) : raw ? [String(raw)] : [];
  } catch {
    return [];
  }
}

interface SendResult {
  statusCode?: string;
  jobId?: number;
  state?: string;
}

/** One Print-Job attempt with an explicit document-format. */
function sendPrintJob(
  pdf: Buffer,
  jobAttributes: ipp.JobTemplateAttributes,
  jobName: string,
  documentFormat: string,
): Promise<SendResult> {
  const printer = newPrinter();
  return new Promise<SendResult>((resolve, reject) => {
    printer.execute(
      "Print-Job",
      {
        "operation-attributes-tag": {
          "requesting-user-name": "printerserver",
          "job-name": jobName,
          // documentFormat is negotiated at runtime; @types/ipp wants a literal.
          "document-format": documentFormat,
        },
        "job-attributes-tag": jobAttributes,
        data: pdf,
      } as ipp.PrintJobRequest,
      (
        err: Error | null,
        res: {
          statusCode?: string;
          "job-attributes-tag"?: { "job-id"?: number; "job-state"?: string };
        },
      ) => {
        if (err) reject(err);
        else
          resolve({
            statusCode: res.statusCode,
            jobId: res["job-attributes-tag"]?.["job-id"],
            state: res["job-attributes-tag"]?.["job-state"],
          });
      },
    );
  });
}

/**
 * Submit a PDF via Print-Job, negotiating the document-format.
 *
 * Many printers (incl. the Canon GX7100) reject an explicit `application/pdf`
 * even though they can print the bytes when told `application/octet-stream`
 * (auto-detect). So we try the formats the printer advertises, preferring
 * octet-stream, and retry on `document-format-not-supported`.
 *
 * In PRINTER_MOCK mode no network call is made.
 */
export async function printPdf(
  pdf: Buffer,
  jobAttributes: ipp.JobTemplateAttributes,
  jobName: string,
): Promise<PrintResult> {
  if (env.PRINTER_MOCK) {
    return { ok: true, jobId: 1, state: "completed", statusCode: "successful-ok" };
  }

  const formats = await getSupportedFormats();

  // Build the attempt order. octet-stream (auto-detect) is the most compatible.
  const candidates: string[] = [];
  if (formats.length === 0) {
    candidates.push("application/octet-stream", "application/pdf");
  } else {
    if (formats.includes("application/octet-stream"))
      candidates.push("application/octet-stream");
    if (formats.includes("application/pdf")) candidates.push("application/pdf");
    if (candidates.length === 0) candidates.push("application/octet-stream");
  }

  let last: SendResult = {};
  for (const format of candidates) {
    last = await sendPrintJob(pdf, jobAttributes, jobName, format);
    const ok =
      typeof last.statusCode === "string" &&
      last.statusCode.startsWith("successful");
    if (ok) {
      return {
        ok: true,
        jobId: last.jobId,
        state: last.state,
        statusCode: last.statusCode,
        documentFormat: format,
        supportedFormats: formats,
      };
    }
    if (last.statusCode !== FORMAT_NOT_SUPPORTED) break; // a different failure
    console.error(
      `[print] ${format} rejected (${last.statusCode}); printer supports: ${formats.join(", ") || "unknown"}`,
    );
  }

  return {
    ok: false,
    statusCode: last.statusCode,
    documentFormat: candidates[candidates.length - 1],
    supportedFormats: formats,
  };
  // TODO(cups-fallback): if every format is rejected the printer cannot render
  // PDF directly — rasterize to image/pwg-raster (e.g. via CUPS) before sending.
}
