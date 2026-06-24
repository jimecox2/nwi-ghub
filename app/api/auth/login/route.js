import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { setAuthCookie } from "@/lib/authCookies";

export const runtime = "nodejs";

// POST /api/auth/login  { identifier, password }
// Logs in against Strapi server-side, stores the JWT in an httpOnly cookie, and
// returns only the (non-sensitive) user for client UI. The raw token never
// reaches the browser.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { identifier, password } = body || {};
  if (!identifier || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const { token, user } = await login({ identifier, password });
    await setAuthCookie(token);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Invalid email or password." },
      { status: 401 }
    );
  }
}
