import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type AssessmentInsert = Database["public"]["Tables"]["assessments"]["Insert"];

/** Test assessments for local development. Only runs when NODE_ENV is development. */
const TEST_ASSESSMENTS: AssessmentInsert[] = [
  {
    full_name: "Alex Test",
    email: "alex@example.com",
    phone: "+1 555-0101",
    title: "VP of Sales",
    company_name: "Acme Security Inc",
    company_website: "https://acmesecurity.example.com",
    product_category: "Cybersecurity",

    arr: 2_500_000,
    acv: 45000,
    customer_count: 58,
    direct_revenue_pct: 92,
    sales_cycle_days: 45,
    cac: 12000,
    existing_msp_relationships: "no",

    section_1_scores: { q1: 4, q2: 4, q3: 3, q4: 3, q5: 4 },
    section_2_scores: { q1: 3, q2: 4, q3: 4, q4: 4, q5: 3 },
    section_3_scores: { q1: 4, q2: 4, q3: 3, q4: 3, q5: 4 },
    section_4_scores: { q1: 3, q2: 3, q3: 3, q4: 2, q5: 3 },
    section_5_scores: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3 },
    section_6_scores: { q1: 4, q2: 3, q3: 4, q4: 4, q5: 3 },
    section_7_scores: null,
    section_7_skipped: true,

    section_1_total: 18,
    section_2_total: 18,
    section_3_total: 18,
    section_4_total: 14,
    section_5_total: 15,
    section_6_total: 18,
    section_7_total: null,
    overall_score: 72,
    readiness_tier: "capable",
    red_flags: null,

    pdf_url: null,
    ai_narrative: null,
  },
  {
    full_name: "Jordan Demo",
    email: "jordan@demo.io",
    phone: "+1 555-0102",
    title: "CEO/Founder",
    company_name: "BackupFlow",
    company_website: "https://backupflow.io",
    product_category: "Backup & DR",

    arr: 800_000,
    acv: 12000,
    customer_count: 72,
    direct_revenue_pct: 100,
    sales_cycle_days: 30,
    cac: 6000,
    existing_msp_relationships: "yes",

    section_1_scores: { q1: 5, q2: 5, q3: 4, q4: 4, q5: 5 },
    section_2_scores: { q1: 5, q2: 4, q3: 5, q4: 5, q5: 4 },
    section_3_scores: { q1: 5, q2: 5, q3: 4, q4: 4, q5: 5 },
    section_4_scores: { q1: 4, q2: 4, q3: 4, q4: 4, q5: 4 },
    section_5_scores: { q1: 4, q2: 4, q3: 4, q4: 4, q5: 4 },
    section_6_scores: { q1: 4, q2: 4, q3: 5, q4: 4, q5: 4 },
    section_7_scores: { q1: 4, q2: 4, q3: 4, q4: 5, q5: 4 },
    section_7_skipped: false,

    section_1_total: 23,
    section_2_total: 23,
    section_3_total: 23,
    section_4_total: 20,
    section_5_total: 20,
    section_6_total: 21,
    section_7_total: 21,
    overall_score: 91,
    readiness_tier: "ready",
    red_flags: null,

    pdf_url: null,
    ai_narrative: null,
  },
];

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Seed is only available in development" },
      { status: 403 }
    );
  }

  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("assessments")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client infers insert as never
.insert(TEST_ASSESSMENTS as any)
      .select("id, email, company_name, overall_score, readiness_tier");

    if (error) {
      console.error("Seed insert error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to seed assessments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Inserted ${data?.length ?? 0} test assessments`,
      rows: data,
    });
  } catch (e) {
    console.error("Seed API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
