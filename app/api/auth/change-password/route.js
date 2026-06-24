import { NextResponse } from "next/server";
import { getAuthToken, setAuthCookie } from "@/lib/authCookies";
import { changePassword } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/auth/change-password  { currentPassword, password, passwordConfirmation }
// Uses the cookie token as the current session. Strapi returns a fresh JWT on
// success, which we write back to the cookie so the session stays valid.
export async function POST(request) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { currentPassword, password, passwordConfirmation } = body || {};

  try {
    const { token: newToken, user } = await changePassword({
      token,
      currentPassword,
      password,
      passwordConfirmation,
    });
    if (newToken) await setAuthCookie(newToken);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Could not change password." },
      { status: 400 }
    );
  }
}
