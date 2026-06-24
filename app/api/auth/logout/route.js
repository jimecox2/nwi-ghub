import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/authCookies";

export const runtime = "nodejs";

// POST /api/auth/logout — clears the httpOnly auth cookie.
export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}
