import { NextResponse, type NextRequest } from "next/server";

import { requireSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { isCupsAvailable, printViaCups } from "@/lib/print/cups";
import { printPdf } from "@/lib/print/ipp";
import { toIppJobAttributes } from "@/lib/print/map-settings";
import type { PrintSettings } from "@/lib/printer/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    await requireSession();
  } catch (res) {
    return res as Response;
  }

  const form = await req.formData();
  const file = form.get("file");
  const settingsRaw = form.get("settings");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "INVALID_FILE" }, { status: 400 });
  }
  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json({ error: "INVALID_FILE" }, { status: 400 });
  }
  if (file.size > env.MAX_UPLOAD_MB * 1024 * 1024) {
    return NextResponse.json({ error: "TOO_LARGE" }, { status: 413 });
  }

  let settings: PrintSettings;
  try {
    settings = JSON.parse(String(settingsRaw)) as PrintSettings;
  } catch {
    return NextResponse.json({ error: "INVALID_SETTINGS" }, { status: 400 });
  }

  const pdf = Buffer.from(await file.arrayBuffer());

  try {
    // Prefer CUPS (rasterizes PDF for the printer); fall back to direct IPP.
    const useCups = !env.PRINTER_MOCK && (await isCupsAvailable());
    const result = useCups
      ? await printViaCups(pdf, settings, file.name)
      : await printPdf(pdf, toIppJobAttributes(settings), file.name);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (err) {
    console.error("[print] failed:", err);
    return NextResponse.json(
      { error: "PRINT_FAILED", message: err instanceof Error ? err.message : "unknown" },
      { status: 502 },
    );
  }
}
