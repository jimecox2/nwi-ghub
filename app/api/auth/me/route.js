import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export const runtime = "nodejs";

// GET /api/auth/me — resolves the current user from the cookie token, enriched
// with customer_id/primary_role (which /users/me omits). Returns 401 when there
// is no valid session. RBAC (lib/auth/rbac.js) consumes the returned fields.
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}
