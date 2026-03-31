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

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const mapped = rows.map((row) => {
    // Support both old schema (full_name) and new schema (first_name + last_name)
    const fullName = (row.full_name as string) ||
      [row.first_name, row.last_name].filter(Boolean).join(" ") ||
      "";

    const scores = row.scores as { overall?: number; maturityLabel?: string } | null;
    const output = row.output as { priority_focus?: string; narrative?: string; recommended_service?: { name?: string; rationale?: string } } | null;

    // Old schema used ai_narrative for output
    const narrative = row.ai_narrative as Record<string, unknown> | null;
    const isV2 = narrative?.v === 2;
    const legacyAiOutput = isV2 ? (narrative?.output as string | undefined) : undefined;

    return {
      id: row.id,
      full_name: fullName,
      company_name: (row.company_name as string) ?? "",
      title: (row.title as string) ?? null,
      email: (row.email as string) ?? "",
      overall_score: scores?.overall ?? null,
      maturity_label: scores?.maturityLabel ?? null,
      has_output: !!output,
      ai_output: output?.narrative ?? legacyAiOutput ?? null,
      open_text: (row.open_text as string | null) ?? null,
      completed_at: (row.completed_at as string | null) ?? null,
      created_at: row.created_at,
    };
  });

  return NextResponse.json(mapped);
}

/** DELETE with body { ids: string[] } to delete multiple assessments. */
export async function DELETE(request: Request) {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { ids?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ids = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "Body must include non-empty ids array" },
      { status: 400 }
    );
  }

  const supabase = getServerSupabase();
  const { error } = await supabase.from("assessments").delete().in("id", ids);

  if (error) {
    console.error("Admin bulk delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: ids.length });
}
