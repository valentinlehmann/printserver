import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/session";
import { takeResult } from "@/lib/scan/job-store";

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
  const result = takeResult(jobId);
  if (!result) {
    return NextResponse.json({ error: "NOT_READY" }, { status: 409 });
  }
  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": result.mime,
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Content-Length": String(result.buffer.length),
    },
  });
}
