import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/session";
import { getScannerCapabilities } from "@/lib/scan/capabilities";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
  } catch (res) {
    return res as Response;
  }
  const capabilities = await getScannerCapabilities();
  return NextResponse.json(capabilities);
}
