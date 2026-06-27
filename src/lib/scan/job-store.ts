import { randomUUID } from "node:crypto";

import { env } from "@/lib/env";
import { jpegsToPdf, jpegsToZip } from "@/lib/scan/assemble";
import { DOCUMENT_SIZES } from "@/lib/scan/capabilities-fallback";
import {
  cancelScanJob,
  nextDocument,
  startScanJob,
} from "@/lib/scan/escl";
import { buildScanSettingsXml } from "@/lib/scan/escl-xml";
import { SAMPLE_JPEG } from "@/lib/scan/fixtures/sample-page";
import type {
  ScanJobSnapshot,
  ScanSettings,
  ScanState,
} from "@/lib/scan/types";

interface Job {
  id: string;
  state: ScanState;
  pagesPulled: number;
  pages: Buffer[];
  jobUri?: string;
  canceled: boolean;
  output: ScanSettings["output"];
  result?: Buffer;
  resultMime?: "application/pdf" | "application/zip";
  filename?: string;
  error?: string;
  createdAt: number;
}

// Single-container deployment => an in-memory map is correct. Jobs do not
// survive a restart (acceptable for a family tool). Shared across dev reloads.
const globalForJobs = globalThis as unknown as {
  __scanJobs?: Map<string, Job>;
};
const jobs: Map<string, Job> = globalForJobs.__scanJobs ?? new Map();
globalForJobs.__scanJobs = jobs;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function regionFor(documentSizeId: string) {
  const size =
    DOCUMENT_SIZES.find((d) => d.id === documentSizeId) ?? DOCUMENT_SIZES[0];
  return { width: size.width, height: size.height };
}

async function run(job: Job, settings: ScanSettings) {
  try {
    job.state = "scanning";

    if (env.PRINTER_MOCK) {
      // Produce a couple of fake pages so the assembly path is exercised.
      const count = settings.source === "Adf" ? 2 : 1;
      for (let i = 0; i < count && !job.canceled; i++) {
        job.pages.push(SAMPLE_JPEG);
        job.pagesPulled = job.pages.length;
        await delay(400);
      }
    } else {
      const xml = buildScanSettingsXml(settings, regionFor(settings.documentSizeId));
      job.jobUri = await startScanJob(xml);
      for (;;) {
        if (job.canceled) break;
        const page = await nextDocument(job.jobUri);
        if (!page) break;
        job.pages.push(page);
        job.pagesPulled = job.pages.length;
      }
    }

    if (job.canceled) {
      job.state = "canceled";
      return;
    }
    if (job.pages.length === 0) throw new Error("no pages scanned");

    job.state = "assembling";
    if (settings.output === "document") {
      job.result = await jpegsToPdf(job.pages);
      job.resultMime = "application/pdf";
      job.filename = `scan-${job.id}.pdf`;
    } else {
      job.result = await jpegsToZip(job.pages);
      job.resultMime = "application/zip";
      job.filename = `scan-${job.id}.zip`;
    }
    job.state = "done";
  } catch (err) {
    if (job.canceled) {
      job.state = "canceled";
    } else {
      job.state = "error";
      job.error = err instanceof Error ? err.message : "scan failed";
    }
  }
}

function reapExpired() {
  const ttl = env.SCAN_JOB_TTL_SECONDS * 1000;
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > ttl) jobs.delete(id);
  }
}

export function startJob(settings: ScanSettings): string {
  reapExpired();
  const id = randomUUID();
  const job: Job = {
    id,
    state: "pending",
    pagesPulled: 0,
    pages: [],
    canceled: false,
    output: settings.output,
    createdAt: Date.now(),
  };
  jobs.set(id, job);
  void run(job, settings);
  return id;
}

export function snapshot(id: string): ScanJobSnapshot | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  return {
    id: job.id,
    state: job.state,
    pagesPulled: job.pagesPulled,
    error: job.error,
    output: job.output,
    resultMime: job.resultMime,
    resultFilename: job.filename,
  };
}

export function takeResult(id: string) {
  const job = jobs.get(id);
  if (!job || job.state !== "done" || !job.result) return undefined;
  return {
    buffer: job.result,
    mime: job.resultMime!,
    filename: job.filename!,
  };
}

export async function cancelJob(id: string): Promise<boolean> {
  const job = jobs.get(id);
  if (!job) return false;
  job.canceled = true;
  if (job.jobUri) await cancelScanJob(job.jobUri);
  return true;
}
