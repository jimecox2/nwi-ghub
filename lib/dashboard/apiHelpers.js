// Shared helpers for the dashboard API proxy routes. Each route reads the
// session (cookie → enriched user) for RBAC, uses the user's token for reads,
// and FULL_ACCESS_ADMIN_TOKEN for privileged writes. Server-only.
import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";

export { getSessionContext };

export function unauthorized() {
  return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
}

export function forbidden(message = "You do not have permission to do that.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message = "Invalid request.") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(err) {
  return NextResponse.json(
    { error: err?.message || "Server error." },
    { status: 500 }
  );
}

// The server-only admin token for privileged Strapi writes. Throws if missing
// so misconfiguration surfaces clearly instead of silently using a user token.
export function requireAdminToken() {
  const token = process.env.FULL_ACCESS_ADMIN_TOKEN;
  if (!token) {
    throw new Error("FULL_ACCESS_ADMIN_TOKEN is not configured on the server.");
  }
  return token;
}
