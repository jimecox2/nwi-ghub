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

// Proposal = a tbmdjoined row whose Status is "New". Field mapping is applied
// here so the client only receives the slim rows it renders (and the full
// pubset payload never leaves the server).
function toProposals(tbmdjoined) {
  return (Array.isArray(tbmdjoined) ? tbmdjoined : [])
    .filter((r) => r.tbMDStatus === "New")
    .map((r) => ({
      id: r.tbID ?? `${r.tbName}-${r.tbMDCustomerID}`,
      proposal: r.tbName || "",
      client: r.tbMDCustomerID || "",
      owner: r.tbOwner || "",
      status: r.tbMDStatus || "",
      stage: r.tbMDStage || "",
      approvalState: r.tbMDState || "",
      estValue: r.tbBudgetCost ?? null,
      lastUpdated: r.tbMDtbLastModified || null,
    }));
}

// GET /api/dashboard/pubsets/active?product=Costbars — proposals from the active
// pubset for the user's customer + product. RBAC: the viewer must have access to
// that pubset (owner, matching-customer Administrator, or be granted via
// grant_pm_access_to / grant_tm_access_to).
export async function GET(request) {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();
  if (!user.customer_id) {
    return forbidden("No customer is associated with your account.");
  }

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

    return NextResponse.json({
      pubset: { id: pubset.id, name: pubset.name, source_product: pubset.source_product },
      proposals: toProposals(pubset.tbmdjoined),
    });
  } catch (err) {
    return serverError(err);
  }
}
