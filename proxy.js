import { NextResponse } from "next/server";

// Next 16 renamed the "middleware" file convention to "proxy". This runs the
// same best-effort route gate as before.

// Routes that never require authentication.
const PUBLIC_PATHS = ["/", "/login", "/register"];

// Only this prefix is actually access-controlled in the app today.
const PROTECTED_PREFIXES = ["/dashboard"];

// NOTE on the auth model: the JWT is held in client memory (Zustand) with no
// cookie/localStorage, so proxy (which runs on the server/edge) cannot see it
// on a normal navigation. Per the design, proxy does a best-effort header check
// and otherwise FALLS THROUGH to the client-side guard (AuthGuard + useAuth),
// which is the real enforcement layer.
export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  // Best-effort: honor an explicit Authorization/custom header if a client
  // forwards one. A genuine in-memory session won't include it on navigation,
  // so we do not hard-redirect here — we let the client-side guard decide.
  const hasAuthHeader =
    request.headers.get("authorization")?.startsWith("Bearer ") ||
    Boolean(request.headers.get("x-auth-token"));

  if (hasAuthHeader) {
    return NextResponse.next();
  }

  // Fall through to the client-side AuthGuard.
  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
