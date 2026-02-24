/**
 * Supabase client for MSP Channel Readiness Assessment
 * Uses anon key for client-side; use getServerSupabase() on the server (API routes) when needed.
 * When env vars are missing, client is still created so the app builds; API calls will fail until configured.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/** Server-side client using service role key for API routes (bypasses RLS). */
export function getServerSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey);
}
