import { NextResponse } from "next/server";
import { getSessionContext, unauthorized, badRequest, serverError } from "@/lib/dashboard/apiHelpers";
import { getPubsetsByIds } from "@/lib/dashboard/pubsets";
import { hasAccessToPubset } from "@/lib/auth/rbac";

export const runtime = "nodejs";

// GET /api/dashboard/pubsets/by-ids?ids=1,2,3 — fetch several pubsets for the
// consolidated/review flow, dropping any the user may not access.
export async function GET(request) {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();

  const ids = request.nextUrl.searchParams.get("ids");
  if (!ids) return badRequest("Missing ids.");

  try {
    const pubsets = await getPubsetsByIds(ids, token);
    const accessible = pubsets.filter((p) => hasAccessToPubset(user, p));
    return NextResponse.json({ pubsets: accessible });
  } catch (err) {
    return serverError(err);
  }
}
