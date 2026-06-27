import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/session";
import { getPrinterStatus } from "@/lib/printer/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSession();
  } catch (res) {
    return res as Response;
  }
  const status = await getPrinterStatus();
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}
