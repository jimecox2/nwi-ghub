import { NextResponse } from "next/server";
import { verifyTokenSignature } from "@/lib/serverAuth";

export const runtime = "nodejs"; // verifyTokenSignature uses node:crypto

// POST /api/auth/verify  { token }  ->  { valid: boolean }
// Optional server-side signature check using STRAPI_JWT_SECRET. The client may
// call this to validate a token without exposing the secret to the browser.
export async function POST(request) {
  let token;
  try {
    ({ token } = await request.json());
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  return NextResponse.json({ valid: verifyTokenSignature(token) });
}
