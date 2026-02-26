import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import type {
  ContactInfo,
  FinancialData,
  SectionScores,
  SectionTotals,
  ComputedResults,
} from "@/types/assessment";
import type { Database } from "@/types/supabase";

/** Payload sent from the results page when the user completes the assessment. */
export interface SubmitPayload {
  contact: ContactInfo;
  financials: FinancialData;
  section1: SectionScores | null;
  section2: SectionScores | null;
  section3: SectionScores | null;
  section4: SectionScores | null;
  section5: SectionScores | null;
  section6: SectionScores | null;
  section7: SectionScores | null;
  section7Skipped: boolean;
  computed: ComputedResults;
}

type AssessmentInsert = Database["public"]["Tables"]["assessments"]["Insert"];

function payloadToRow(payload: SubmitPayload): AssessmentInsert {
  const { contact, financials, section7Skipped, computed } = payload;
  const totals: SectionTotals = computed.sectionTotals;

  return {
    full_name: contact.fullName,
    email: contact.email,
    phone: contact.phone,
    title: contact.title,
    company_name: contact.companyName,
    company_website: contact.companyWebsite || null,
    product_category: contact.productCategory,

    arr: financials.arr ?? null,
    acv: financials.acv ?? null,
    customer_count: financials.customerCount ?? null,
    direct_revenue_pct: financials.directRevenuePct ?? null,
    sales_cycle_days: financials.salesCycleDays ?? null,
    cac: financials.cac ?? null,
    existing_msp_relationships: financials.existingMspRelationships ?? null,

    section_1_scores: payload.section1 ? { q1: payload.section1.q1, q2: payload.section1.q2, q3: payload.section1.q3, q4: payload.section1.q4, q5: payload.section1.q5 } : null,
    section_2_scores: payload.section2 ? { q1: payload.section2.q1, q2: payload.section2.q2, q3: payload.section2.q3, q4: payload.section2.q4, q5: payload.section2.q5 } : null,
    section_3_scores: payload.section3 ? { q1: payload.section3.q1, q2: payload.section3.q2, q3: payload.section3.q3, q4: payload.section3.q4, q5: payload.section3.q5 } : null,
    section_4_scores: payload.section4 ? { q1: payload.section4.q1, q2: payload.section4.q2, q3: payload.section4.q3, q4: payload.section4.q4, q5: payload.section4.q5 } : null,
    section_5_scores: payload.section5 ? { q1: payload.section5.q1, q2: payload.section5.q2, q3: payload.section5.q3, q4: payload.section5.q4, q5: payload.section5.q5 } : null,
    section_6_scores: payload.section6 ? { q1: payload.section6.q1, q2: payload.section6.q2, q3: payload.section6.q3, q4: payload.section6.q4, q5: payload.section6.q5 } : null,
    section_7_scores: payload.section7 ? { q1: payload.section7.q1, q2: payload.section7.q2, q3: payload.section7.q3, q4: payload.section7.q4, q5: payload.section7.q5 } : null,
    section_7_skipped: section7Skipped,

    section_1_total: totals.section1,
    section_2_total: totals.section2,
    section_3_total: totals.section3,
    section_4_total: totals.section4,
    section_5_total: totals.section5,
    section_6_total: totals.section6,
    section_7_total: totals.section7 ?? null,
    overall_score: computed.overallScore,
    readiness_tier: computed.readinessTier,
    red_flags: computed.redFlags.length > 0 ? computed.redFlags : null,

    pdf_url: null,
    ai_narrative: null,
    completed_at: new Date().toISOString(),
  };
}

/** GET returns a short message; use POST from the results page to submit. */
export async function GET() {
  return NextResponse.json({
    message: "Use POST to submit an assessment. This endpoint is called automatically when you complete the assessment.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body as SubmitPayload;

    if (
      !payload.contact?.email ||
      !payload.contact?.fullName ||
      !payload.computed
    ) {
      return NextResponse.json(
        { error: "Missing required fields: contact (email, fullName) and computed" },
        { status: 400 }
      );
    }

    const row = payloadToRow(payload);
    const supabase = getServerSupabase();

    const { data: rawData, error } = await supabase
      .from("assessments")
      .insert(row as any)
      .select("id, created_at")
      .single();
    const data = rawData as { id: string; created_at: string } | null;

    if (error || !data) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: error?.message || "Failed to save assessment" },
        { status: 500 }
      );
    }

    // Narrative, PDF, and emails are generated asynchronously via client 3-part flow + finalize.
    return NextResponse.json({
      id: data.id,
      created_at: data.created_at,
    });
  } catch (e) {
    console.error("Submit API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
