import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/authConstants";

// Next 16 renamed the "middleware" file convention to "proxy". With the JWT now
// in an httpOnly cookie, the proxy can do real server-side route protection:
// protected routes require the cookie to be present, otherwise redirect to
// /login. (Cryptographic verification of the token happens server-side in
// /api/auth/me and server components; the proxy only checks presence, which is
// enough to gate navigation.)

const PROTECTED_PREFIXES = ["/dashboard"];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
