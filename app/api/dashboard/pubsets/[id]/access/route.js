import { NextResponse } from "next/server";
import {
  getSessionContext,
  unauthorized,
  forbidden,
  badRequest,
  serverError,
  requireAdminToken,
} from "@/lib/dashboard/apiHelpers";
import { getPubsetAccess, updatePubsetGrants } from "@/lib/dashboard/pubsets";
import { canManagePubsetAccess } from "@/lib/auth/rbac";

export const runtime = "nodejs";

// Normalize a comma-separated grant string to a clean, de-duplicated list.
function parseGrantList(value) {
  if (typeof value !== "string") return [];
  const seen = new Set();
  const out = [];
  for (const raw of value.split(",")) {
    const email = raw.trim();
    if (!email) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(email);
  }
  return out;
}

// GET /api/dashboard/pubsets/[id]/access — current grants + candidate resources.
// Administrator (matching customer) only.
export async function GET(request, { params }) {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const access = await getPubsetAccess(id, token);
    if (!access) return NextResponse.json({ error: "Pubset not found." }, { status: 404 });
    if (!canManagePubsetAccess(user, access)) {
      return forbidden("Only an Administrator for this customer can manage access.");
    }
    return NextResponse.json({
      pubset: { id: access.id, name: access.name },
      grant_pm_access_to: access.grant_pm_access_to,
      grant_tm_access_to: access.grant_tm_access_to,
      resources: access.resources,
    });
  } catch (err) {
    return serverError(err);
  }
}

// PATCH /api/dashboard/pubsets/[id]/access { grant_pm_access_to, grant_tm_access_to }
// Privileged write (admin token) after RBAC. Only the two grant fields change.
export async function PATCH(request, { params }) {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  try {
    // Re-read with the user's token to authorize against the live record.
    const access = await getPubsetAccess(id, token);
    if (!access) return NextResponse.json({ error: "Pubset not found." }, { status: 404 });
    if (!canManagePubsetAccess(user, access)) {
      return forbidden("Only an Administrator for this customer can manage access.");
    }

    const grant_pm_access_to = parseGrantList(body.grant_pm_access_to).join(", ");
    const grant_tm_access_to = parseGrantList(body.grant_tm_access_to).join(", ");

    await updatePubsetGrants(
      id,
      { grant_pm_access_to, grant_tm_access_to },
      requireAdminToken()
    );

    return NextResponse.json({ ok: true, grant_pm_access_to, grant_tm_access_to });
  } catch (err) {
    return serverError(err);
  }
}
