import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/auth/session";
import { startJob } from "@/lib/scan/job-store";
import type { ScanSettings } from "@/lib/scan/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    await requireSession();
  } catch (res) {
    return res as Response;
  }

  let settings: ScanSettings;
  try {
    settings = (await req.json()) as ScanSettings;
  } catch {
    return NextResponse.json({ error: "INVALID_SETTINGS" }, { status: 400 });
  }

  const jobId = startJob(settings);
  return NextResponse.json({ jobId });
}
