import { NextResponse } from "next/server";
import { getClearAdminCookieHeader } from "@/lib/admin-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", getClearAdminCookieHeader());
  return res;
}
