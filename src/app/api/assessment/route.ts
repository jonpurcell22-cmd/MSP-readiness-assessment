import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

/** Body from the "Begin Your Assessment" lead capture form. */
export interface StartAssessmentBody {
  contact_name: string;
  email: string;
  phone?: string | null;
  title?: string | null;
  company_name: string;
  company_website?: string | null;
  product_category?: string | null;
  current_revenue?: unknown;
}

type AssessmentInsert = Database["public"]["Tables"]["assessments"]["Insert"];

function startBodyToRow(body: StartAssessmentBody): AssessmentInsert {
  return {
    full_name: body.contact_name,
    email: body.email,
    phone: body.phone ?? "",
    title: body.title ?? "",
    company_name: body.company_name,
    company_website: body.company_website ?? null,
    product_category: body.product_category ?? "Other",

    arr: null,
    acv: null,
    customer_count: null,
    direct_revenue_pct: null,
    sales_cycle_days: null,
    cac: null,
    existing_msp_relationships: null,

    section_1_scores: null,
    section_2_scores: null,
    section_3_scores: null,
    section_4_scores: null,
    section_5_scores: null,
    section_6_scores: null,
    section_7_scores: null,
    section_7_skipped: false,

    section_1_total: null,
    section_2_total: null,
    section_3_total: null,
    section_4_total: null,
    section_5_total: null,
    section_6_total: null,
    section_7_total: null,
    overall_score: null,
    readiness_tier: null,
    red_flags: null,

    pdf_url: null,
    ai_narrative: null,
  };
}

/** POST: create a new assessment from the lead capture form; returns { id }. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartAssessmentBody;

    if (!body.contact_name?.trim() || !body.email?.trim() || !body.company_name?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: contact_name, email, company_name" },
        { status: 400 }
      );
    }

    const row = startBodyToRow(body);
    const supabase = getServerSupabase();

    const { data: rawData, error } = await supabase
      .from("assessments")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase insert inference
      .insert(row as any)
      .select("id, created_at")
      .single();

    const data = rawData as { id: string; created_at: string } | null;

    if (error || !data) {
      console.error("Assessment create error:", error);
      return NextResponse.json(
        { error: error?.message ?? "Failed to create assessment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id, created_at: data.created_at });
  } catch (e) {
    console.error("Assessment API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
