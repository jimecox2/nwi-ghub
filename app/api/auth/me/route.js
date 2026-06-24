import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/authCookies";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/auth/me — resolves the current user from the cookie token by calling
// Strapi /users/me. Returns 401 when there is no valid session. The returned
// user carries whatever custom fields Strapi exposes (e.g. customer_id,
// primary_role), which RBAC (Stage 0b) consumes.
export async function GET() {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await getCurrentUser(token);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
