import { NextResponse } from "next/server";
import { getAdminSetCookieHeader } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const submitted = (body.password as string) ?? "";

  if (submitted !== password) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const setCookie = getAdminSetCookieHeader();
  const res = NextResponse.json({ ok: true, token: "authenticated" });
  if (setCookie) res.headers.set("Set-Cookie", setCookie);
  return res;
}
