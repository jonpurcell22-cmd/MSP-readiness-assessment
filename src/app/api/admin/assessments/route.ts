import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin assessments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
