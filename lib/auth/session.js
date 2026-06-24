// Server-only session helpers. Resolves the full app user — the base
// /users/me record merged with the custom fields (customer_id / primary_role)
// that /users/me omits — from the cookie token. Consumed by /api/auth/* routes,
// the dashboard API proxy, and server components. RBAC (lib/auth/rbac.js) runs
// on the plain user object this returns.
import { getAuthToken } from "@/lib/authCookies";
import { getCurrentUser, getUserByEmail } from "@/lib/auth";

// Build the enriched app user from a token. Returns null when the token is
// missing or invalid. The customer_id/primary_role lookup is best-effort: if it
// fails, RBAC treats the user as having no role/customer (own-pubsets only).
export async function resolveUser(token) {
  if (!token) return null;

  const base = await getCurrentUser(token); // /users/me
  if (!base) return null;

  let extra = { customer_id: null, primary_role: null };
  try {
    const byEmail = await getUserByEmail(base.email, token);
    if (byEmail) {
      extra = {
        customer_id: byEmail.customer_id || null,
        primary_role: byEmail.primary_role || null,
      };
    }
  } catch {
    // Non-fatal — leave customer_id/primary_role null.
  }

  return { ...base, ...extra };
}

// Read the current session user from the httpOnly cookie. Returns null when
// unauthenticated.
export async function getSessionUser() {
  const token = await getAuthToken();
  return resolveUser(token);
}

// Read both the raw token and the enriched user in one cookie read. Used by the
// dashboard API proxy, which needs the user for RBAC and the token for reads.
export async function getSessionContext() {
  const token = await getAuthToken();
  const user = await resolveUser(token);
  return { token, user };
}
