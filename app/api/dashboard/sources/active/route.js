import { NextResponse } from "next/server";
import {
  getSessionContext,
  unauthorized,
  badRequest,
  serverError,
  requireAdminToken,
} from "@/lib/dashboard/apiHelpers";
import { setActiveDashboardSource } from "@/lib/dashboard/sources";

export const runtime = "nodejs";

// POST /api/dashboard/sources/active { sourceId } — make a source the active one
// for the user's customer (deactivates the rest). Privileged write.
export async function POST(request) {
  const { user } = await getSessionContext();
  if (!user) return unauthorized();
  if (!user.customer_id) return badRequest("Could not determine your Customer_id.");

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const { sourceId } = body || {};
  if (!sourceId) return badRequest("Missing sourceId.");

  try {
    await setActiveDashboardSource(sourceId, String(user.customer_id), requireAdminToken());
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
