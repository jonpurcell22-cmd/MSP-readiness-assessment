/**
 * AI-generated narrative for MSP Channel Readiness Assessment PDF.
 * Produced by Claude API or generateFallbackNarrative().
 */

import { SECTION_QUESTION_NAMES } from "@/lib/pdf-questions";

export interface SectionInterpretation {
  section_number: number;
  section_name: string;
  interpretation: string;
  recommendation: string;
}

export interface NarrativeOutput {
  executive_summary: string;
  section_interpretations: SectionInterpretation[];
  financial_commentary: string;
  cost_of_delay_narrative: string;
  roadmap_narrative: string;
}

const SECTION_NAMES: Record<number, string> = {
  1: "MSP-Ready Product Architecture",
  2: "Pricing & Partner Economics",
  3: "Organizational & GTM Readiness",
  4: "Partner Ecosystem & Recruitment",
  5: "Enablement & Partner Experience",
  6: "Competitive & Distribution Landscape",
  7: "Existing MSP Channel Health",
};

/** Flattened assessment data for the prompt (matches doc's buildNarrativePrompt shape). */
interface NarrativeInput {
  companyName: string;
  productCategory: string;
  title: string;
  overallScore: number;
  readinessTier: string;
  section7Skipped: boolean;
  section1Total: number;
  section2Total: number;
  section3Total: number;
  section4Total: number;
  section5Total: number;
  section6Total: number;
  section7Total: number | null;
  s1: { q1: number; q2: number; q3: number; q4: number; q5: number };
  s2: { q1: number; q2: number; q3: number; q4: number; q5: number };
  s3: { q1: number; q2: number; q3: number; q4: number; q5: number };
  s4: { q1: number; q2: number; q3: number; q4: number; q5: number };
  s5: { q1: number; q2: number; q3: number; q4: number; q5: number };
  s6: { q1: number; q2: number; q3: number; q4: number; q5: number };
  s7: { q1: number; q2: number; q3: number; q4: number; q5: number } | null;
  redFlags: string[];
  arr: number | null;
  acv: number | null;
  customerCount: number | null;
  directRevenuePct: number;
  salesCycleDays: number | null;
  cac: number | null;
  existingMspRelationships: string | null;
}

export type { NarrativeInput };

export function payloadToNarrativeInput(payload: {
  contact: { companyName: string; productCategory: string; title: string };
  computed: {
    overallScore: number;
    readinessTier: string;
    sectionTotals: {
      section1: number;
      section2: number;
      section3: number;
      section4: number;
      section5: number;
      section6: number;
      section7: number | null;
    };
    redFlags: string[];
    section7Skipped: boolean;
  };
  section1: { q1: number; q2: number; q3: number; q4: number; q5: number } | null;
  section2: { q1: number; q2: number; q3: number; q4: number; q5: number } | null;
  section3: { q1: number; q2: number; q3: number; q4: number; q5: number } | null;
  section4: { q1: number; q2: number; q3: number; q4: number; q5: number } | null;
  section5: { q1: number; q2: number; q3: number; q4: number; q5: number } | null;
  section6: { q1: number; q2: number; q3: number; q4: number; q5: number } | null;
  section7: { q1: number; q2: number; q3: number; q4: number; q5: number } | null;
  financials: {
    arr: number | null;
    acv: number | null;
    customerCount: number | null;
    directRevenuePct: number;
    salesCycleDays: number | null;
    cac: number | null;
    existingMspRelationships: string | null;
  };
}): NarrativeInput {
  const empty = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };
  return {
    companyName: payload.contact.companyName,
    productCategory: payload.contact.productCategory,
    title: payload.contact.title,
    overallScore: payload.computed.overallScore,
    readinessTier: payload.computed.readinessTier,
    section7Skipped: payload.computed.section7Skipped,
    section1Total: payload.computed.sectionTotals.section1,
    section2Total: payload.computed.sectionTotals.section2,
    section3Total: payload.computed.sectionTotals.section3,
    section4Total: payload.computed.sectionTotals.section4,
    section5Total: payload.computed.sectionTotals.section5,
    section6Total: payload.computed.sectionTotals.section6,
    section7Total: payload.computed.sectionTotals.section7 ?? null,
    s1: payload.section1 ?? empty,
    s2: payload.section2 ?? empty,
    s3: payload.section3 ?? empty,
    s4: payload.section4 ?? empty,
    s5: payload.section5 ?? empty,
    s6: payload.section6 ?? empty,
    s7: payload.section7 ?? null,
    redFlags: payload.computed.redFlags,
    arr: payload.financials.arr,
    acv: payload.financials.acv,
    customerCount: payload.financials.customerCount,
    directRevenuePct: payload.financials.directRevenuePct,
    salesCycleDays: payload.financials.salesCycleDays,
    cac: payload.financials.cac,
    existingMspRelationships: payload.financials.existingMspRelationships,
  };
}

const SYSTEM_PROMPT = `You are Jon Purcell, a senior MSP channel strategist who built Apple's MSP program from zero, spent 9 years in VMware's channel organization, and is currently rebuilding Workiva's MSP motion. You are writing a personalized executive assessment for a software vendor evaluating MSP channel readiness.

Your voice is authoritative but not arrogant. You write like someone who has seen 50 vendors attempt this and knows exactly which patterns lead to success and which lead to failure. You are specific, never generic. You never say things like "there are areas for improvement" or "consider focusing on key areas." You name the specific problem, explain why it matters to MSPs in operational terms, and say what to do about it.

Rules:
- Analyze ALL individual question scores (1-5) across every section. Do not just summarize section totals.
- Identify the 2-3 most critical gaps that will block MSP program success. Prioritize by impact: a score of 1-2 on multi-tenancy, pricing, or channel conflict is more damaging than a 2 on community visibility. Explain WHY each gap matters in concrete MSP operational terms.
- Identify 1-2 genuine strengths the company has today. Be specific about what they scored well on and how it gives them an advantage. Do not fabricate strengths that don't exist in the data.
- Never use generic filler phrases like "there are opportunities for growth," "several areas need attention," "the assessment reveals," or "key areas to focus on."
- Never repeat the same point across different sections of the narrative. Each section should add new insight.
- Reference actual MSP ecosystem dynamics by name: Pax8, ConnectWise, IT Nation, PSA/RMM integrations, multi-tenant architecture, partner activation rates, deal registration.
- When referencing their product category, explain how that category specifically maps to MSP demand and competitive dynamics.
- Always use the term "expert" not "someone who has built these programs" when recommending the deep-dive.
- Always end the executive summary with: "Regardless of where you landed, the logical next step is a complimentary 90-minute deep-dive assessment with an expert who can uncover the nuances a self-assessment cannot. No cost, no obligation."
- Never use em dashes. Use commas, periods, colons, or separate sentences.
- Write in second person ("your product," "your organization").
- The tone should make the reader think "this person clearly understands our situation" not "this is a generic report."

You will receive the full assessment data as structured text and must return ONLY valid JSON matching the specified output format (no markdown, no preamble).`;

function formatSectionScores(
  sectionNum: number,
  sectionTitle: string,
  scores: { q1: number; q2: number; q3: number; q4: number; q5: number },
  total: number
): string {
  const names = SECTION_QUESTION_NAMES[sectionNum as keyof typeof SECTION_QUESTION_NAMES];
  if (!names) return `Section ${sectionNum} (${sectionTitle}): ${total}/25 total`;
  const parts = names.map((name, i) => {
    const q = (["q1", "q2", "q3", "q4", "q5"] as const)[i];
    return `${name}=${scores[q]}`;
  });
  return `Section ${sectionNum} (${sectionTitle}): ${parts.join(", ")} | total ${total}/25`;
}

export function buildNarrativePrompt(data: NarrativeInput): string {
  const lines: string[] = [
    formatSectionScores(1, "MSP-Ready Product Architecture", data.s1, data.section1Total),
    formatSectionScores(2, "Pricing & Partner Economics", data.s2, data.section2Total),
    formatSectionScores(3, "Organizational & GTM Readiness", data.s3, data.section3Total),
    formatSectionScores(4, "Partner Ecosystem & Recruitment", data.s4, data.section4Total),
    formatSectionScores(5, "Enablement & Partner Experience", data.s5, data.section5Total),
    formatSectionScores(6, "Competitive & Distribution Landscape", data.s6, data.section6Total),
  ];
  if (!data.section7Skipped && data.s7) {
    lines.push(
      formatSectionScores(7, "Existing MSP Channel Health", data.s7, data.section7Total ?? 0)
    );
  }

  return `Generate a personalized executive assessment for this MSP Channel Readiness Assessment. Analyze every individual question score below. Identify 2-3 critical gaps (prioritize by impact), 1-2 genuine strengths from the data, and write section-specific insight without repeating yourself. Reference MSP ecosystem dynamics (Pax8, ConnectWise, IT Nation, PSA/RMM, partner activation, deal registration) and map their product category to MSP demand where relevant.

ASSESSMENT DATA:
- Company: ${data.companyName}
- Product Category: ${data.productCategory}
- Title of Person: ${data.title}
- Overall Score: ${data.overallScore}/100
- Readiness Tier: ${data.readinessTier}
- Section 7 Skipped: ${data.section7Skipped} (true = greenfield, no existing MSP program)

INDIVIDUAL QUESTION SCORES (analyze every score; name specific questions in your narrative):
${lines.map((line) => `- ${line}`).join("\n")}

RED FLAGS DETECTED: ${data.redFlags.length > 0 ? data.redFlags.join("; ") : "None"}

FINANCIAL DATA (reference actual ARR and ACV in financial_commentary):
- ARR: $${data.arr ?? "N/A"}
- ACV: $${data.acv ?? "N/A"}
- Customer Count: ${data.customerCount ?? "N/A"}
- Direct Sales %: ${data.directRevenuePct}%
- Sales Cycle: ${data.salesCycleDays ?? "N/A"} days
- CAC: $${data.cac ?? "N/A"}
- Existing MSP Relationships: ${data.existingMspRelationships ?? "N/A"}

Respond with ONLY valid JSON (no markdown, no backticks, no preamble) in this exact structure:

{
  "executive_summary": "At least 4 full sentences. What the score means, single biggest opportunity, single biggest blocker, one clear recommendation. Reference specific question names and product category. End with exactly: Regardless of where you landed, the logical next step is a complimentary 90-minute deep-dive assessment with an expert who can uncover the nuances a self-assessment cannot. No cost, no obligation.",
  "section_interpretations": [
    {
      "section_number": 1,
      "section_name": "MSP-Ready Product Architecture",
      "interpretation": "At least 3 sentences. Name specific questions and scores. Explain operational impact for MSPs. No generic filler.",
      "recommendation": "One concrete, actionable recommendation."
    }
  ],
  "financial_commentary": "2-3 sentences that explicitly reference their ARR and ACV. Ground projections in their scale and category. Conservative; label assumptions.",
  "cost_of_delay_narrative": "2-3 sentences specific to their product category and competitive score. Reference category dynamics.",
  "roadmap_narrative": "3-4 sentences. Which gaps to close first, in what order, realistic timeline. Reference named dimensions. Recommend the complimentary 90-minute deep-dive with an expert as the first step (no cost, no obligation)."
}

Include one object in section_interpretations for each of sections 1 through 6, and section 7 only if Section 7 Skipped is false. Use the exact section_name values: "MSP-Ready Product Architecture", "Pricing & Partner Economics", "Organizational & GTM Readiness", "Partner Ecosystem & Recruitment", "Enablement & Partner Experience", "Competitive & Distribution Landscape", "Existing MSP Channel Health". Every interpretation must name specific questions/scores; every recommendation must be concrete and actionable. Do not repeat the same point across sections.`;
}

function sectionTier(total: number): "high" | "mid" | "low" {
  if (total >= 20) return "high";
  if (total >= 13) return "mid";
  return "low";
}

/** Templated narrative when Claude API fails. Tier-based language per doc. */
export function generateFallbackNarrative(payload: {
  contact: { companyName: string; productCategory?: string };
  computed: {
    overallScore: number;
    readinessTier: string;
    sectionTotals: {
      section1: number;
      section2: number;
      section3: number;
      section4: number;
      section5: number;
      section6: number;
      section7: number | null;
    };
    redFlags: string[];
    section7Skipped: boolean;
  };
  financials: { arr: number | null; acv: number | null; productCategory?: string };
}): NarrativeOutput {
  const t = payload.computed.sectionTotals;
  const tier = payload.computed.readinessTier;
  const sections: SectionInterpretation[] = [];
  const sectionNums: number[] = [1, 2, 3, 4, 5, 6];
  if (!payload.computed.section7Skipped) sectionNums.push(7);
  const totals = [t.section1, t.section2, t.section3, t.section4, t.section5, t.section6, t.section7];
  for (const num of sectionNums) {
    const total = totals[num - 1] ?? 0;
    const st = sectionTier(total);
    let interpretation: string;
    let recommendation: string;
    if (st === "high") {
      interpretation = `Your ${SECTION_NAMES[num]} is a competitive advantage. MSPs will notice.`;
      recommendation = "Leverage this strength in partner recruitment and positioning.";
    } else if (st === "mid") {
      interpretation = `Solid foundation in ${SECTION_NAMES[num]}, but MSPs will compare you to vendors who have nailed this.`;
      recommendation = "Identify the top two gaps and address them before launch.";
    } else {
      interpretation = `This is a blocker. No amount of partner recruitment will overcome a gap here. Fix this first.`;
      recommendation = "Prioritize product, pricing, or operational changes in this area before scaling the channel.";
    }
    sections.push({
      section_number: num,
      section_name: SECTION_NAMES[num],
      interpretation,
      recommendation,
    });
  }
  const tierLabel =
    tier === "ready"
      ? "MSP Program Ready"
      : tier === "capable"
        ? "MSP Capable"
        : tier === "emerging"
          ? "MSP Emerging"
          : "MSP Premature";
  const executive_summary = `Your overall score of ${payload.computed.overallScore}/100 places you in the ${tierLabel} tier. ${
    payload.computed.redFlags.length > 0
      ? "Critical gaps were identified that should be addressed before investing in partner recruitment. "
      : ""
  }Focus on closing the highest-impact gaps first, then build your program design and recruitment plan. We recommend a phased approach based on your timeline. Regardless of where you landed, the logical next step is a complimentary 90-minute deep-dive assessment with an expert who can uncover the nuances a self-assessment cannot. No cost, no obligation.`;
  const financial_commentary = `Based on your ARR of $${payload.financials.arr ?? "N/A"} and ACV of $${payload.financials.acv ?? "N/A"}, the 3-year MSP revenue projections in this report use conservative assumptions. Your product category and readiness level influence how quickly you can ramp.`;
  const cost_of_delay_narrative = `Every quarter without an MSP channel has a real cost in higher acquisition spend and unrealized partner-sourced revenue. In ${payload.contact.productCategory ?? payload.financials.productCategory ?? "your category"}, competitors and distributors are moving now.`;
  const roadmap_narrative =
    tier === "ready"
      ? "We recommend starting with a complimentary 90-minute deep-dive with an expert as your first step. After that, you are roughly 3 to 4 months from a launch-ready program with the right playbook and recruitment plan."
      : tier === "capable"
        ? "We recommend starting with a complimentary 90-minute deep-dive with an expert as your first step. Then plan for 4 to 6 months to close targeted gaps and stand up program design and recruitment."
        : tier === "emerging"
          ? "We recommend starting with a complimentary 90-minute deep-dive with an expert as your first step. Expect 6 to 9 months of foundational work after that before scaling the channel."
          : "We recommend starting with a complimentary 90-minute deep-dive with an expert as your first step. Allow 12 or more months after that to address significant gaps before investing in partner recruitment.";
  return {
    executive_summary,
    section_interpretations: sections,
    financial_commentary,
    cost_of_delay_narrative,
    roadmap_narrative,
  };
}

const NARRATIVE_TIMEOUT_MS = 15_000;

/**
 * Generate narrative via Claude API with 15s timeout; on failure returns fallback.
 * Used by /api/generate-narrative and by submit flow.
 */
export async function getNarrative(payload: Parameters<typeof payloadToNarrativeInput>[0]): Promise<NarrativeOutput> {
  const data = payloadToNarrativeInput(payload);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not set, using fallback narrative");
    return generateFallbackNarrative(payload);
  }
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({ apiKey });
    const prompt = buildNarrativePrompt(data);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NARRATIVE_TIMEOUT_MS);
    const response = await Promise.race([
      anthropic.messages.create(
        {
          model: "claude-sonnet-4-20250514",
          max_tokens: 4500,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        },
        { signal: controller.signal, timeout: NARRATIVE_TIMEOUT_MS }
      ),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Narrative generation timed out")), NARRATIVE_TIMEOUT_MS)
      ),
    ]);
    clearTimeout(timeoutId);
    const block = response.content[0];
    const text = block?.type === "text" ? block.text : "";
    if (!text.trim()) throw new Error("Empty Claude response");
    const parsed = JSON.parse(text) as NarrativeOutput;
    if (!parsed.executive_summary || !Array.isArray(parsed.section_interpretations)) {
      throw new Error("Invalid narrative structure");
    }
    return parsed;
  } catch (err) {
    console.error("AI narrative failed, using fallback:", err);
    return generateFallbackNarrative(payload);
  }
}
