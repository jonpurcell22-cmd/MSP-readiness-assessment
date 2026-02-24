/**
 * AI-generated narrative for MSP Channel Readiness Assessment PDF.
 * Produced by Claude API or generateFallbackNarrative().
 */

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

const SYSTEM_PROMPT = `You are a senior MSP channel strategy consultant who has built 50+ MSP programs from zero. You are writing personalized assessment report narratives for B2B software vendors. Your output must sound like an experienced channel consultant giving a real assessment, not a chatbot summary.

Voice and tone:
- Direct, confident, and specific. You speak from deep experience. Not academic, not salesy, not generic.
- Never use em dashes. Use commas, periods, colons, or separate sentences.
- Never use filler like "in today's competitive landscape," "it's important to note," or "overall."
- Write in second person ("your product," "your organization"). Be honest; credibility over hype.

Required specificity:
- Reference specific question scores by name and number. Example: "Your multi-tenancy scored a 2, which is a dealbreaker for MSPs who manage dozens of clients from a single console." Do this for both strengths (4–5) and gaps (1–2). Never say "one area" or "certain dimensions" without naming them.
- Tie their product category to MSP demand. Explain how their category (e.g., Backup & DR, Cybersecurity, Compliance) maps to what MSPs are actually buying and bundling. Reference category-specific dynamics.
- Give concrete, actionable recommendations. No vague advice like "improve this area" or "consider strengthening." Name the exact dimension, what to do, and why it matters to an MSP. One specific recommendation per section minimum.
- Financial commentary must reference their actual ARR and ACV numbers. Use their real figures in the sentence. Ground projections in their scale; label assumptions. Conservative and credible.

Length requirements (minimums):
- Executive summary: 4 full sentences minimum. Cover what the score means, single biggest opportunity, single biggest blocker, and one clear recommendation.
- Each section interpretation: 3 sentences minimum, plus one specific recommendation. Reference named questions and scores; explain operational impact for MSPs.
- Financial commentary: Reference their ARR and ACV explicitly; 2–3 substantive sentences.

You will receive the full assessment data as structured text and must return ONLY valid JSON matching the specified output format (no markdown, no preamble).`;

export function buildNarrativePrompt(data: NarrativeInput): string {
  const s7Block = data.section7Skipped
    ? ""
    : `- Section 7 (Existing Channel Health): ${data.section7Total}/25
  Individual: Activation Rate=${data.s7!.q1}, Revenue Concentration=${data.s7!.q2}, Retention=${data.s7!.q3}, Time to First Client=${data.s7!.q4}, Satisfaction=${data.s7!.q5}`;

  return `Generate personalized PDF report narratives for this MSP Channel Readiness Assessment. Write like an experienced channel consultant who has built 50 MSP programs, not a generic chatbot. Be specific and actionable.

ASSESSMENT DATA:
- Company: ${data.companyName}
- Product Category: ${data.productCategory} (tie this category to MSP demand: what MSPs buy, bundle, and care about in this space)
- Title of Person: ${data.title}
- Overall Score: ${data.overallScore}/100
- Readiness Tier: ${data.readinessTier}
- Section 7 Skipped: ${data.section7Skipped} (true = greenfield, no existing MSP program)

SECTION SCORES (each out of 25). Reference these by question name and score in your narrative (e.g., "Multi-Tenant Management scored 2," "Partner Margin Viability scored 4"):
- Section 1 (MSP-Ready Product Architecture): ${data.section1Total}/25
  Multi-Tenant Management=${data.s1.q1}, API & Integration Depth=${data.s1.q2}, Automated Provisioning=${data.s1.q3}, White-Label/Co-Brand=${data.s1.q4}, Client Reporting & Value Demonstration=${data.s1.q5}
- Section 2 (Pricing & Partner Economics): ${data.section2Total}/25
  MSP-Friendly Pricing Structure=${data.s2.q1}, Partner Margin Viability=${data.s2.q2}, Billing & Invoicing Flexibility=${data.s2.q3}, Recurring Revenue Alignment=${data.s2.q4}, Cost to Deliver=${data.s2.q5}
- Section 3 (Organizational & GTM Readiness): ${data.section3Total}/25
  Executive Commitment=${data.s3.q1}, Channel Conflict=${data.s3.q2}, Dedicated Resources=${data.s3.q3}, Roadmap Responsiveness=${data.s3.q4}, GTM Clarity=${data.s3.q5}
- Section 4 (Partner Ecosystem & Recruitment): ${data.section4Total}/25
  Category Demand=${data.s4.q1}, Distributors=${data.s4.q2}, Community Visibility=${data.s4.q3}, Existing Relationships=${data.s4.q4}, Competitive Advantage=${data.s4.q5}
- Section 5 (Enablement & Partner Experience): ${data.section5Total}/25
  Onboarding=${data.s5.q1}, Sales Enablement=${data.s5.q2}, Training/Cert=${data.s5.q3}, Partner Support=${data.s5.q4}, NFR/Demo=${data.s5.q5}
- Section 6 (Competitive & Distribution Landscape): ${data.section6Total}/25
  Competitor Programs=${data.s6.q1}, Distributor Gaps=${data.s6.q2}, Ecosystem Fit=${data.s6.q3}, MSP Differentiation=${data.s6.q4}, Market Timing=${data.s6.q5}
${s7Block}

RED FLAGS DETECTED: ${data.redFlags.length > 0 ? data.redFlags.join("; ") : "None"}

FINANCIAL DATA (you must reference their actual ARR and ACV in financial_commentary):
- ARR: $${data.arr ?? "N/A"}
- ACV: $${data.acv ?? "N/A"}
- Customer Count: ${data.customerCount ?? "N/A"}
- Direct Sales %: ${data.directRevenuePct}%
- Sales Cycle: ${data.salesCycleDays ?? "N/A"} days
- CAC: $${data.cac ?? "N/A"}
- Existing MSP Relationships: ${data.existingMspRelationships ?? "N/A"}

Respond with ONLY valid JSON (no markdown, no backticks, no preamble) in this exact structure:

{
  "executive_summary": "At least 4 full sentences. What the overall score means, single biggest opportunity, single biggest blocker, one clear recommendation. Reference specific question names and product category.",
  "section_interpretations": [
    {
      "section_number": 1,
      "section_name": "MSP-Ready Product Architecture",
      "interpretation": "At least 3 sentences. Name specific questions and their scores (e.g., Multi-Tenant scored 2). Explain what that means for MSPs in operational terms.",
      "recommendation": "One concrete, actionable recommendation (what to do, not vague advice)."
    }
  ],
  "financial_commentary": "2-3 sentences that explicitly reference their ARR and ACV numbers. Ground the 3-year projections in their scale and category. Be conservative; label assumptions.",
  "cost_of_delay_narrative": "2-3 sentences specific to their product category and competitive score. Why waiting has a real cost; reference category dynamics.",
  "roadmap_narrative": "3-4 sentences. Which gaps to close first, in what order, realistic timeline. Reference named dimensions, not generic areas."
}

Include one object in section_interpretations for each of sections 1 through 6, and section 7 only if Section 7 Skipped is false. Use the exact section_name values: "MSP-Ready Product Architecture", "Pricing & Partner Economics", "Organizational & GTM Readiness", "Partner Ecosystem & Recruitment", "Enablement & Partner Experience", "Competitive & Distribution Landscape", "Existing MSP Channel Health". Every interpretation must be at least 3 sentences and name specific questions/scores; every recommendation must be concrete and actionable.`;
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
  }Focus on closing the highest-impact gaps first, then build your program design and recruitment plan. We recommend a phased approach based on your timeline.`;
  const financial_commentary = `Based on your ARR of $${payload.financials.arr ?? "N/A"} and ACV of $${payload.financials.acv ?? "N/A"}, the 3-year MSP revenue projections in this report use conservative assumptions. Your product category and readiness level influence how quickly you can ramp.`;
  const cost_of_delay_narrative = `Every quarter without an MSP channel has a real cost in higher acquisition spend and unrealized partner-sourced revenue. In ${payload.contact.productCategory ?? payload.financials.productCategory ?? "your category"}, competitors and distributors are moving now.`;
  const roadmap_narrative =
    tier === "ready"
      ? "You are 3 to 4 months from a launch-ready program with the right playbook and recruitment plan."
      : tier === "capable"
        ? "Plan for 4 to 6 months to close targeted gaps and stand up program design and recruitment."
        : tier === "emerging"
          ? "Expect 6 to 9 months of foundational work before scaling the channel."
          : "Allow 12 or more months to address significant gaps before investing in partner recruitment.";
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
          max_tokens: 4000,
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
