import { NextResponse } from "next/server";
import { getSessionContext, unauthorized, serverError } from "@/lib/dashboard/apiHelpers";
import { getAllPubsets } from "@/lib/dashboard/pubsets";
import { filterPubsetsByAccess } from "@/lib/auth/rbac";

export const runtime = "nodejs";

// GET /api/dashboard/pubsets — all pubsets the current user may view (RBAC
// filtered server-side).
export async function GET() {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();

  try {
    const all = await getAllPubsets(token);
    const accessible = filterPubsetsByAccess(all, user);
    return NextResponse.json({ pubsets: accessible });
  } catch (err) {
    return serverError(err);
  }
}
