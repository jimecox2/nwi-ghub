import { NextResponse } from "next/server";
import { getSessionContext, unauthorized, forbidden, serverError } from "@/lib/dashboard/apiHelpers";
import { getPubsetById } from "@/lib/dashboard/pubsets";
import { hasAccessToPubset } from "@/lib/auth/rbac";

export const runtime = "nodejs";

// GET /api/dashboard/pubsets/[id] — single pubset for the report view.
export async function GET(request, { params }) {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const pubset = await getPubsetById(id, token);
    if (!pubset) return NextResponse.json({ error: "Pubset not found." }, { status: 404 });
    if (!hasAccessToPubset(user, pubset)) return forbidden("You do not have access to this pubset.");
    return NextResponse.json({ pubset });
  } catch (err) {
    return serverError(err);
  }
}
