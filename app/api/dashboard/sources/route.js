import { NextResponse } from "next/server";
import {
  getSessionContext,
  unauthorized,
  forbidden,
  badRequest,
  serverError,
  requireAdminToken,
} from "@/lib/dashboard/apiHelpers";
import { getAllDashboardSources, createDashboardSource } from "@/lib/dashboard/sources";
import { canManageDashboardSources } from "@/lib/auth/rbac";

export const runtime = "nodejs";

// GET /api/dashboard/sources — sources the current user can access (owned or
// shared). Read with the user's own token.
export async function GET() {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();

  try {
    const sources = await getAllDashboardSources(user.email, token);
    return NextResponse.json({ sources });
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/dashboard/sources — create a dashboard source. Privileged write
// (admin token), gated on role. The client sends the fully-built source body.
export async function POST(request) {
  const { user } = await getSessionContext();
  if (!user) return unauthorized();
  if (!canManageDashboardSources(user)) {
    return forbidden("Administrator, Project Manager, or Executive role required.");
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  // Force server-trusted ownership/customer fields; never trust the client for these.
  const data = {
    ...body,
    owner: user.email,
    Customer_id: user.customer_id != null ? String(user.customer_id) : body.Customer_id,
  };

  if (!data.Customer_id) {
    return badRequest("Could not determine your Customer_id.");
  }

  try {
    const created = await createDashboardSource(data, requireAdminToken());
    return NextResponse.json({ source: created });
  } catch (err) {
    return serverError(err);
  }
}
