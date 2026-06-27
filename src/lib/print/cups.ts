import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { env, ipppUri } from "@/lib/env";
import type { PrintResult } from "@/lib/print/ipp";
import type { PrintSettings } from "@/lib/printer/types";

const execFileAsync = promisify(execFile);

// lp/lpstat live in /usr/bin, but lpadmin/cupsaccept/cupsenable are in /usr/sbin
// which isn't always on the server process's PATH — make sure both are searched.
const CUPS_PATH = [
  process.env.PATH ?? "",
  "/usr/local/sbin",
  "/usr/local/bin",
  "/usr/sbin",
  "/usr/bin",
]
  .filter(Boolean)
  .join(":");

function run(cmd: string, args: string[]) {
  return execFileAsync(cmd, args, {
    env: { ...process.env, PATH: CUPS_PATH },
  });
}

/**
 * CUPS-based printing. Direct IPP sends raw PDF, which AirPrint printers like
 * the Canon GX7100 accept but cannot render (the job "completes" with no
 * output). CUPS' IPP-Everywhere driver rasterizes the PDF into the format the
 * printer understands — the same path the user's Mac uses — and honors all the
 * print options via `lp -o`.
 */

let cupsAvailable: boolean | null = null;

/** Whether the `lp`/`lpstat` CUPS client tools are usable in this environment. */
export async function isCupsAvailable(): Promise<boolean> {
  if (env.PRINT_BACKEND === "ipp") return false;
  if (env.PRINT_BACKEND === "cups") return true;
  if (cupsAvailable !== null) return cupsAvailable;
  try {
    await run("lpstat", ["-r"]);
    cupsAvailable = true;
  } catch {
    cupsAvailable = false;
  }
  return cupsAvailable;
}

let queueReady = false;

/**
 * Ensure a usable CUPS queue exists. If a queue named PRINTER_QUEUE_NAME is
 * already configured (e.g. an existing macOS printer), it is used unchanged.
 * Otherwise an IPP-Everywhere queue pointing at PRINTER_IP is created.
 */
async function ensureQueue(): Promise<string> {
  const queue = env.PRINTER_QUEUE_NAME;
  if (queueReady) return queue;

  try {
    await run("lpstat", ["-p", queue]);
    queueReady = true;
    return queue;
  } catch {
    // Queue missing — create a driverless (IPP Everywhere) queue.
  }

  await run("lpadmin", [
    "-p",
    queue,
    "-E",
    "-v",
    ipppUri(),
    "-m",
    "everywhere",
    "-o",
    "printer-is-shared=false",
  ]);
  await run("cupsaccept", [queue]).catch(() => {});
  await run("cupsenable", [queue]).catch(() => {});
  queueReady = true;
  return queue;
}

/** Map normalized print settings to `lp -o` option arguments. */
function toLpArgs(s: PrintSettings): string[] {
  const args: string[] = [];
  if (s.copies > 1) args.push("-n", String(s.copies));
  args.push("-o", `sides=${s.sides}`);
  args.push("-o", `print-color-mode=${s.colorMode}`);
  args.push("-o", `media=${s.media}`);
  args.push(
    "-o",
    `orientation-requested=${s.orientation === "landscape" ? 4 : 3}`,
  );
  if (s.numberUp > 1) args.push("-o", `number-up=${s.numberUp}`);
  const quality = s.quality === "draft" ? 3 : s.quality === "high" ? 5 : 4;
  args.push("-o", `print-quality=${quality}`);
  if (s.copies > 1) args.push("-o", `collate=${s.collate ? "true" : "false"}`);
  if (s.pageRangeMode === "custom" && s.pageRanges?.length) {
    const ranges = s.pageRanges
      .map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`))
      .join(",");
    args.push("-o", `page-ranges=${ranges}`);
  }
  return args;
}

/** Submit a PDF through CUPS, returning a PrintResult. Throws on lp/lpadmin failure. */
export async function printViaCups(
  pdf: Buffer,
  settings: PrintSettings,
  jobName: string,
): Promise<PrintResult> {
  const queue = await ensureQueue();
  const tmp = join(tmpdir(), `print-${randomUUID()}.pdf`);
  await writeFile(tmp, pdf);
  try {
    const { stdout } = await run("lp", [
      "-d",
      queue,
      "-t",
      jobName,
      ...toLpArgs(settings),
      tmp,
    ]);
    // e.g. "request id is printserver-7 (1 file(s))"
    const requestId = stdout.match(/request id is (\S+)/)?.[1];
    return {
      ok: true,
      statusCode: "successful-ok",
      state: "pending",
      documentFormat: "cups",
      requestId,
    };
  } finally {
    await unlink(tmp).catch(() => {});
  }
}
