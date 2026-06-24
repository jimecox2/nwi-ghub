// Shared auth constants safe to import anywhere (no Node/next/headers deps), so
// both the proxy (edge) and server route handlers can reference the same name.
export const AUTH_COOKIE = "nwi_jwt";

// 7 days, in seconds.
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
