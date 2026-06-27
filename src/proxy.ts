import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Next.js 16 "proxy" convention (formerly middleware).
//
// Optimistic gate: redirects to /login when no session cookie is present.
// This is a cheap check only — the authoritative session validation happens
// server-side in the (app) layout and in every printer route handler.
const PROTECTED_PREFIXES = ["/print", "/scan", "/status", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isProtected) return NextResponse.next();

  if (!getSessionCookie(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/print/:path*", "/scan/:path*", "/status/:path*", "/admin/:path*"],
};
