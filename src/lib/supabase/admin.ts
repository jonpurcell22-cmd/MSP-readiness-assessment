/**
 * Server-side Supabase client with service role (bypasses RLS).
 * Use in Server Components and server actions; do not expose to the client.
 */

import { getServerSupabase } from "@/lib/supabase";

export function createAdminClient() {
  return getServerSupabase();
}
