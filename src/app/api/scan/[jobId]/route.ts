import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/session";
import { cancelJob } from "@/lib/scan/job-store";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    await requireSession();
  } catch (res) {
    return res as Response;
  }
  const { jobId } = await params;
  const ok = await cancelJob(jobId);
  return NextResponse.json({ ok });
}
