import { NextResponse } from "next/server";
import {
  getSessionContext,
  unauthorized,
  forbidden,
  serverError,
  requireAdminToken,
} from "@/lib/dashboard/apiHelpers";
import { getOneDashboardSource, preprocessDashboardSourceData } from "@/lib/dashboard/sources";
import { canManageDashboardSources } from "@/lib/auth/rbac";

export const runtime = "nodejs";

// POST /api/dashboard/sources/[id]/preprocess — extract Allocation rows into
// tbrescalcs2 and persist on the source. Privileged write.
export async function POST(request, { params }) {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const source = await getOneDashboardSource(id, token);
    if (!source) return NextResponse.json({ error: "Source not found." }, { status: 404 });

    const isAdmin = user.primary_role === "Administrator";
    if (!canManageDashboardSources(user) && !isAdmin && source.owner !== user.email) {
      return forbidden("You do not have permission to preprocess this source.");
    }

    const result = await preprocessDashboardSourceData(source, requireAdminToken());
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err) {
    return serverError(err);
  }
}
