import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/session";
import { getPrinterCapabilities } from "@/lib/printer/capabilities";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
  } catch (res) {
    return res as Response;
  }
  const capabilities = await getPrinterCapabilities();
  return NextResponse.json(capabilities);
}
