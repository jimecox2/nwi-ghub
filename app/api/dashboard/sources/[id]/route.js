import { NextResponse } from "next/server";
import {
  getSessionContext,
  unauthorized,
  forbidden,
  badRequest,
  serverError,
  requireAdminToken,
} from "@/lib/dashboard/apiHelpers";
import {
  getOneDashboardSource,
  updateDashboardSource,
  deleteDashboardSource,
} from "@/lib/dashboard/sources";
import { canManageDashboardSources, canDeleteDashboardSource } from "@/lib/auth/rbac";

export const runtime = "nodejs";

// Fields the client is allowed to update (e.g. via the share dialog).
const UPDATABLE = ["grant_tm_access_to", "name"];

// GET /api/dashboard/sources/[id] — read one (user token).
export async function GET(request, { params }) {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();
  const { id } = await params;

  try {
    const source = await getOneDashboardSource(id, token);
    if (!source) return NextResponse.json({ error: "Source not found." }, { status: 404 });
    return NextResponse.json({ source });
  } catch (err) {
    return serverError(err);
  }
}

// PUT /api/dashboard/sources/[id] — update whitelisted fields (e.g. sharing).
// Privileged write; requires manage role and ownership (Administrators bypass).
export async function PUT(request, { params }) {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();
  if (!canManageDashboardSources(user)) {
    return forbidden("Administrator, Project Manager, or Executive role required.");
  }

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  try {
    const source = await getOneDashboardSource(id, token);
    if (!source) return NextResponse.json({ error: "Source not found." }, { status: 404 });
    const isAdmin = user.primary_role === "Administrator";
    if (!isAdmin && source.owner !== user.email) {
      return forbidden("You can only modify sources you own.");
    }

    const data = {};
    for (const key of UPDATABLE) {
      if (key in body) data[key] = body[key];
    }
    if (Object.keys(data).length === 0) return badRequest("No updatable fields provided.");

    await updateDashboardSource(id, data, requireAdminToken());
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/dashboard/sources/[id] — privileged delete, RBAC gated.
export async function DELETE(request, { params }) {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();
  const { id } = await params;

  try {
    const source = await getOneDashboardSource(id, token);
    if (!source) return NextResponse.json({ error: "Source not found." }, { status: 404 });
    if (!canDeleteDashboardSource(user, source)) {
      return forbidden("You do not have permission to delete this source.");
    }
    await deleteDashboardSource(id, requireAdminToken());
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
