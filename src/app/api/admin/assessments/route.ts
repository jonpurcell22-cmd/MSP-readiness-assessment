import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const PATH_LABELS: Record<string, string> = {
  scratch: "Starting from Scratch",
  not_producing: "Not Producing Revenue",
  producing_broken: "Producing but Broken",
};

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
    const narrative = row.ai_narrative as Record<string, unknown> | null;
    const isV2 = narrative?.v === 2;
    const path = isV2
      ? (narrative?.path as string | undefined)
      : (row.readiness_tier as string | undefined);
    const aiOutput = isV2 ? (narrative?.output as string | undefined) : undefined;

    return {
      id: row.id,
      full_name: row.full_name ?? "",
      company_name: row.company_name ?? "",
      title: row.title ?? null,
      email: row.email ?? "",
      path: path ?? null,
      path_label: path ? (PATH_LABELS[path] ?? path) : null,
      ai_output: aiOutput ?? null,
      open_text: (row.open_text as string | null) ?? null,
      completed_at: row.completed_at ?? null,
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
