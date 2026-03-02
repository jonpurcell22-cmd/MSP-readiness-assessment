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

  // Map DB shape to admin UI shape (full_name -> contact_name, overall_score -> total_score, etc.)
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const mapped = rows.map((row) => ({
    id: row.id,
    company_name: row.company_name,
    contact_name: row.full_name ?? row.contact_name ?? "",
    title: row.title ?? null,
    email: row.email,
    phone: row.phone ?? null,
    total_score: row.overall_score ?? row.total_score ?? null,
    tier: row.readiness_tier ?? row.tier ?? null,
    section_scores:
      typeof row.section_1_total === "number" ||
      typeof row.section_2_total === "number"
        ? {
            section1: row.section_1_total ?? null,
            section2: row.section_2_total ?? null,
            section3: row.section_3_total ?? null,
            section4: row.section_4_total ?? null,
            section5: row.section_5_total ?? null,
            section6: row.section_6_total ?? null,
            section7: row.section_7_total ?? null,
          }
        : null,
    answers: { product_category: row.product_category },
    // Show as complete if completed_at set, or if narrative exists (legacy completed assessments)
    completed_at:
      row.completed_at ??
      (row.ai_narrative ? row.created_at : null),
    created_at: row.created_at,
  }));

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
