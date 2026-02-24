/**
 * Admin dashboard auth: password check and cookie-based session.
 * Cookie is HttpOnly, signed with ADMIN_PASSWORD so we can verify without storing password in cookie.
 */

import { createHmac } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function getToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("msp-admin").digest("hex");
}

/** Verify the cookie from the request. Returns true if valid admin session. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME);
  return cookie?.value === token;
}

/** Set-Cookie header value for admin session (call from login handler). */
export function getAdminSetCookieHeader(): string | null {
  const token = getToken();
  if (!token) return null;
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
}

/** Set-Cookie header value to clear admin session (call from logout handler). */
export function getClearAdminCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
