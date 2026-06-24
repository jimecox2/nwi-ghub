import { NextResponse } from "next/server";
import { register } from "@/lib/auth";
import { setAuthCookie } from "@/lib/authCookies";

export const runtime = "nodejs";

// POST /api/auth/register  { username, email, password }
// Strapi email confirmation is ON, so register normally returns no JWT and the
// UI shows a "check your email" screen (pending: true). If confirmation is ever
// turned off, Strapi returns a JWT and we sign the user in by setting the cookie.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { username, email, password } = body || {};
  if (!username || !email || !password) {
    return NextResponse.json({ error: "Username, email and password are required." }, { status: 400 });
  }

  try {
    const { token, user } = await register({ username, email, password });
    if (token) {
      await setAuthCookie(token);
      return NextResponse.json({ user, pending: false });
    }
    return NextResponse.json({ user: user || null, pending: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Registration failed." },
      { status: 400 }
    );
  }
}
