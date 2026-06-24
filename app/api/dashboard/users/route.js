import { NextResponse } from "next/server";
import { getSessionContext, unauthorized, badRequest, serverError } from "@/lib/dashboard/apiHelpers";
import { getUsersByCustomerId } from "@/lib/dashboard/sources";

export const runtime = "nodejs";

// GET /api/dashboard/users — users in the current user's organization, for the
// share dialog. Scoped to the session's customer_id (read with the user token).
export async function GET() {
  const { token, user } = await getSessionContext();
  if (!user) return unauthorized();
  if (!user.customer_id) return badRequest("Could not determine your Customer_id.");

  try {
    const users = await getUsersByCustomerId(String(user.customer_id), token);
    return NextResponse.json({ users });
  } catch (err) {
    return serverError(err);
  }
}
