import { NextResponse } from "next/server";
import {
  getSessionContext,
  unauthorized,
  forbidden,
  serverError,
} from "@/lib/dashboard/apiHelpers";
import { getActivePubsetForProduct } from "@/lib/dashboard/pubsets";
import { hasAccessToPubset } from "@/lib/auth/rbac";

export const runtime = "nodejs";

// GET /api/dashboard/pubsets/active/project/[tbID]?product=Costbars — the full
// tbmdjoined row for one Project in the active pubset, for the detail drawer.
// Same RBAC gate as the projects list.
export async function GET(request, { params }) {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();
  if (!user.customer_id) {
    return forbidden("No customer is associated with your account.");
  }

  const { tbID } = await params;
  const product = request.nextUrl.searchParams.get("product") || "Costbars";

  try {
    const pubset = await getActivePubsetForProduct(String(user.customer_id), product, token);
    if (!pubset) {
      return NextResponse.json(
        { error: `No active ${product} pubset found for your customer.` },
        { status: 404 }
      );
    }
    if (!hasAccessToPubset(user, pubset)) {
      return forbidden("You do not have access to this pubset.");
    }

    const rows = Array.isArray(pubset.tbmdjoined) ? pubset.tbmdjoined : [];
    const row = rows.find((r) => r.tbType === "Project" && String(r.tbID) === String(tbID));
    if (!row) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    return NextResponse.json({ project: row });
  } catch (err) {
    return serverError(err);
  }
}
