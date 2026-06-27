import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/session";
import { snapshot } from "@/lib/scan/job-store";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    await requireSession();
  } catch (res) {
    return res as Response;
  }
  const { jobId } = await params;
  const snap = snapshot(jobId);
  if (!snap) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(snap);
}
