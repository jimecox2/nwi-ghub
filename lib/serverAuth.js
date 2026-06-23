// Server-only auth helpers. This module uses Node's built-in `crypto` and the
// STRAPI_JWT_SECRET env var, so it must never be imported by client components.
// It is consumed by the /api/auth/verify route handler.
import crypto from "node:crypto";

// Verify the HS256 signature and expiry of a Strapi-issued JWT *offline*,
// without a network round-trip to Strapi. Uses STRAPI_JWT_SECRET (the same
// secret Strapi signs tokens with). Returns true only for a valid, unexpired
// token. No external auth library — just plain JWT handling.
export function verifyTokenSignature(token) {
  const secret = process.env.STRAPI_JWT_SECRET;
  if (!token || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [header, payload, signature] = parts;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (decoded.exp && Date.now() >= decoded.exp * 1000) return false;
  } catch {
    return false;
  }

  return true;
}
