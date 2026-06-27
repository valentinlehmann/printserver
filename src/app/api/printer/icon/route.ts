import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/session";
import { getPrinterIconUrl } from "@/lib/printer/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Proxies the printer's own icon PNG (the image macOS shows). The printer is on
// the LAN and not reachable by remote clients, so we fetch and stream it.
export async function GET() {
  try {
    await requireSession();
  } catch (res) {
    return res as Response;
  }

  const url = await getPrinterIconUrl();
  if (!url) return new NextResponse(null, { status: 404 });

  try {
    const upstream = await fetch(url, { cache: "no-store" });
    if (!upstream.ok || !upstream.body) {
      return new NextResponse(null, { status: 404 });
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
