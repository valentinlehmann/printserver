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
}

/**
 * Submit a PDF to the printer via a Print-Job operation. `jobAttributes` is the
 * IPP job-attributes-tag produced by toIppJobAttributes(). In PRINTER_MOCK mode
 * no network call is made and a synthetic success is returned.
 */
export async function printPdf(
  pdf: Buffer,
  jobAttributes: ipp.JobTemplateAttributes,
  jobName: string,
): Promise<PrintResult> {
  if (env.PRINTER_MOCK) {
    return { ok: true, jobId: 1, state: "completed", statusCode: "successful-ok" };
  }

  const printer = newPrinter();
  const res = await new Promise<{
    statusCode?: string;
    "job-attributes-tag"?: { "job-id"?: number; "job-state"?: string };
  }>((resolve, reject) => {
    printer.execute(
      "Print-Job",
      {
        "operation-attributes-tag": {
          "requesting-user-name": "printerserver",
          "job-name": jobName,
          "document-format": "application/pdf",
        },
        "job-attributes-tag": jobAttributes,
        data: pdf,
      },
      (err: Error | null, res) => {
        if (err) reject(err);
        else resolve(res as never);
      },
    );
  });

  const statusCode = res.statusCode;
  return {
    ok: typeof statusCode === "string" && statusCode.startsWith("successful"),
    jobId: res["job-attributes-tag"]?.["job-id"],
    state: res["job-attributes-tag"]?.["job-state"],
    statusCode,
  };
  // TODO(cups-fallback): if statusCode === "client-error-document-format-not-supported",
  // route the job through CUPS (rasterize PDF) instead of direct IPP.
}
