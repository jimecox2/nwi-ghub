// Server-only cookie helpers for the httpOnly JWT cookie. Uses next/headers
// `cookies()` (async in Next 16), so this must only be imported from route
// handlers and server components — never from a client component or the proxy.
import { cookies } from "next/headers";
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE } from "@/lib/authConstants";

const isProd = process.env.NODE_ENV === "production";

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: isProd, // allow http on localhost during dev
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

// Persist the Strapi JWT in an httpOnly cookie. The browser never sees it via JS.
export async function setAuthCookie(token, maxAge = AUTH_COOKIE_MAX_AGE) {
  const store = await cookies();
  store.set(AUTH_COOKIE, token, cookieOptions(maxAge));
}

// Expire the cookie (logout).
export async function clearAuthCookie() {
  const store = await cookies();
  store.set(AUTH_COOKIE, "", cookieOptions(0));
}

// Read the JWT from the cookie (server-side only). Returns null when absent.
export async function getAuthToken() {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value || null;
}
