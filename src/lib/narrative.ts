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

/** Part 1: Executive summary + top gaps/strengths (show first on results page). */
export interface NarrativePart1 {
  executive_summary: string;
  top_3_critical_gaps: string[];
  top_2_strengths: string[];
}

/** Part 2: Section-by-section interpretations. */
export interface NarrativePart2 {
  section_interpretations: SectionInterpretation[];
}

/** Part 3: Financial, cost of delay, roadmap. */
export interface NarrativePart3 {
  financial_commentary: string;
  cost_of_delay_narrative: string;
  roadmap_narrative: string;
}

/** Type guard for DB/stored JSON that may be NarrativeOutput. */
export function isNarrativeOutput(value: unknown): value is NarrativeOutput {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.executive_summary === "string" &&
    Array.isArray(o.section_interpretations) &&
    typeof o.financial_commentary === "string" &&
    typeof o.cost_of_delay_narrative === "string" &&
    typeof o.roadmap_narrative === "string"
  );
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

const SYSTEM_PROMPT = `You are Jon Purcell, a senior MSP channel strategist who built Apple's MSP program from zero, spent 9 years in VMware's channel organization, and is currently rebuilding Workiva's MSP motion. You have just read this vendor's completed MSP Channel Readiness Assessment question by question. Your job is to write the narrative as if you are giving them your direct, expert take based only on what they actually answered.

CRITICAL: The reader must feel that a human expert read their specific answers and wrote this for them alone. If any sentence could honestly apply to a different company with different scores, it is forbidden. Every claim, strength, gap, and recommendation must be tied to a specific question name and score from the data. Name the actual questions (e.g. "Multi-Tenant Management," "Partner Margin Viability," "Executive Commitment") and the scores (1–5). Do not summarize vaguely; interpret their pattern.

Voice: Authoritative, specific, operational. You have seen dozens of vendors attempt MSP channel builds. You know which patterns lead to success and which to failure. You name the problem, explain why it matters to MSPs in concrete terms (margin, activation, conflict, distribution), and say exactly what to do next. Never arrogant; never generic.

RULES:
- Executive summary: Open with what their score and tier mean for them specifically. Name their single biggest blocker (one dimension/question where a low score will block success) and their single biggest opportunity (one strength or dimension to leverage). Tie each to a question name and score. One clear next step. End with exactly: "The next step is a complimentary 90-minute deep-dive assessment with an expert who can uncover the nuances a self-assessment cannot. No cost, no obligation."
- Section interpretations: For each section, cite at least one specific question name and its score. Explain what that pattern means for MSPs operationally (e.g. "A 2 on Multi-Tenant Management means MSPs cannot run one instance per end customer; that drives up their cost to deliver and kills margin"). One concrete, actionable recommendation per section. No section may sound like it could apply to another vendor; if it could, rewrite it to cite their actual scores and answers.
- Financial commentary: Reference their actual ARR and ACV. Tie the projection to their scale and category. Be conservative; note assumptions.
- Cost of delay: Tie to their product category and, if relevant, their competitive/distribution scores. Why waiting costs them specifically.
- Roadmap: Name which dimensions or gaps to address first and in what order, based on their section scores. Recommend the 90-minute deep-dive as the first step (no cost, no obligation).

BANNED (never use): "areas for improvement," "key areas to focus on," "several dimensions," "there are opportunities," "the assessment reveals," "consider focusing on," "room for growth," "strengths and gaps," "various aspects," "multiple areas," "we recommend addressing," "it would be beneficial," "important to consider," or any sentence that does not name a specific question or score. Never use em dashes. Use second person ("your product," "your organization"). Do not repeat the same point across sections; each section adds new, section-specific insight.

Reference real MSP ecosystem terms where relevant: Pax8, ConnectWise, IT Nation, PSA/RMM, multi-tenant architecture, partner activation, deal registration, NFR/demo environments. Map their product category to MSP demand when useful.

EXAMPLE of what NOT to do vs what TO do:
- BAD (generic): "Product Architecture shows areas for improvement. Consider focusing on key dimensions to strengthen your MSP readiness."
- GOOD (answer-specific): "You scored 2 on Multi-Tenant Management and 1 on Automated Provisioning. MSPs run one instance per end customer; without both, you are asking them to manage per-tenant setups, which increases their cost to deliver and erodes margin. Fix multi-tenant and provisioning before recruiting partners."

You will receive the full assessment data and must return ONLY valid JSON matching the specified output format (no markdown, no preamble).`;

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

  return `You are writing the executive assessment narrative for this vendor. You have their exact question-by-question scores below. Your output must read as if an expert read those answers and wrote recommendations that could only apply to this assessment. Every interpretation and recommendation must cite specific question names and scores from the data. If a sentence could apply to a different company, delete it and replace it with one that names their actual scores.

ASSESSMENT DATA:
- Company: ${data.companyName}
- Product Category: ${data.productCategory}
- Title of Person: ${data.title}
- Overall Score: ${data.overallScore}/100
- Readiness Tier: ${data.readinessTier}
- Section 7 Skipped: ${data.section7Skipped} (true = greenfield, no existing MSP program)

INDIVIDUAL QUESTION SCORES (you must name these in your narrative; e.g. "You scored 2 on Multi-Tenant Management and 4 on API & Integration Depth"):
${lines.map((line) => `- ${line}`).join("\n")}

RED FLAGS DETECTED: ${data.redFlags.length > 0 ? data.redFlags.join("; ") : "None"}

FINANCIAL DATA (reference ARR and ACV explicitly in financial_commentary):
- ARR: $${data.arr ?? "N/A"}
- ACV: $${data.acv ?? "N/A"}
- Customer Count: ${data.customerCount ?? "N/A"}
- Direct Sales %: ${data.directRevenuePct}%
- Sales Cycle: ${data.salesCycleDays ?? "N/A"} days
- CAC: $${data.cac ?? "N/A"}
- Existing MSP Relationships: ${data.existingMspRelationships ?? "N/A"}

Return ONLY valid JSON (no markdown, no backticks, no preamble). Every string must be answer-specific; no generic language.

{
  "executive_summary": "4+ sentences. What their score/tier means for them. Name their single biggest blocker (question + score) and single biggest opportunity (question + score). One clear recommendation. End with exactly: The next step is a complimentary 90-minute deep-dive assessment with an expert who can uncover the nuances a self-assessment cannot. No cost, no obligation.",
  "section_interpretations": [
    {
      "section_number": 1,
      "section_name": "MSP-Ready Product Architecture",
      "interpretation": "2-4 sentences. Must name at least one question and its score. Explain what that pattern means for MSPs in operational terms. No generic filler.",
      "recommendation": "One concrete action tied to their scores in this section."
    }
  ],
  "financial_commentary": "2-3 sentences. Must mention their ARR and ACV. Ground projections in their scale and category. Conservative; note assumptions.",
  "cost_of_delay_narrative": "2-3 sentences. Tie to their product category and, if relevant, competitive/distribution scores. Why waiting costs them specifically.",
  "roadmap_narrative": "3-4 sentences. Name which gaps or dimensions to address first and in what order based on their section scores. Recommend the 90-minute deep-dive as first step (no cost, no obligation)."
}

Include one object in section_interpretations for each of sections 1 through 6, and section 7 only if Section 7 Skipped is false. Use exact section_name values: "MSP-Ready Product Architecture", "Pricing & Partner Economics", "Organizational & GTM Readiness", "Partner Ecosystem & Recruitment", "Enablement & Partner Experience", "Competitive & Distribution Landscape", "Existing MSP Channel Health". Every interpretation must name at least one question and score; every recommendation must be concrete and tied to their data. Do not repeat the same point across sections.`;
}

/** Shared context block for part-specific prompts. */
function narrativeContextBlock(data: NarrativeInput): string {
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
  return `ASSESSMENT DATA:
- Company: ${data.companyName}
- Product Category: ${data.productCategory}
- Title: ${data.title}
- Overall Score: ${data.overallScore}/100
- Readiness Tier: ${data.readinessTier}
- Section 7 Skipped: ${data.section7Skipped}

QUESTION SCORES:
${lines.map((line) => `- ${line}`).join("\n")}

RED FLAGS: ${data.redFlags.length > 0 ? data.redFlags.join("; ") : "None"}

FINANCIAL: ARR $${data.arr ?? "N/A"}, ACV $${data.acv ?? "N/A"}, Customers ${data.customerCount ?? "N/A"}, Direct % ${data.directRevenuePct}, Sales Cycle ${data.salesCycleDays ?? "N/A"} days, CAC $${data.cac ?? "N/A"}, Existing MSP: ${data.existingMspRelationships ?? "N/A"}`;
}

/** Part 1 prompt: executive summary + top 3 gaps + top 2 strengths. */
export function buildNarrativePromptPart1(data: NarrativeInput): string {
  const context = narrativeContextBlock(data);
  return `${context}

Return ONLY valid JSON (no markdown, no backticks, no preamble):
{
  "executive_summary": "4+ sentences. What their score/tier means. Name single biggest blocker (question + score) and single biggest opportunity (question + score). One clear recommendation. End with exactly: The next step is a complimentary 90-minute deep-dive assessment with an expert who can uncover the nuances a self-assessment cannot. No cost, no obligation.",
  "top_3_critical_gaps": ["First gap: question name and score, why it blocks MSP success.", "Second gap.", "Third gap."],
  "top_2_strengths": ["First strength: question/section and score, how to leverage.", "Second strength."]
}

Every item must cite specific questions and scores. No generic phrases.`;
}

/** Part 2 prompt: section interpretations — answer-specific, no generic template language. */
export function buildNarrativePromptPart2(data: NarrativeInput): string {
  const context = narrativeContextBlock(data);
  const sectionList = data.section7Skipped
    ? "1 through 6"
    : "1 through 7";
  return `${context}

Your job: For each section, write a 2-3 sentence interpretation and one concrete recommendation. Every sentence MUST be specific to this vendor's actual answers. No generic filler.

For EACH section you MUST:
1. Name the specific question(s) where they scored LOWEST (use the exact question names from the data, e.g. "Billing & Invoicing Flexibility", "Multi-Tenant Management") and state the score (e.g. "2/5"). Explain the operational impact of those gaps on MSP partner experience — what breaks for the MSP in practice (margin, billing, onboarding, conflict, etc.).
2. Name the specific question(s) where they scored HIGHEST in that section (by name) and acknowledge the strength in concrete terms.
3. Connect the section to their product category (${data.productCategory}) and company context where relevant.

EXAMPLE of what TO write (answer-specific, operational):
"Your margins at 35%+ are strong enough to attract MSP interest, but the lack of monthly per-unit billing and aggregate invoicing will stop most MSP conversations before they start. MSPs in cybersecurity expect to add seats mid-month and bill monthly. Until billing flexibility catches up to your margin story, partners will evaluate but won't commit."

BANNED — never use these or any similar generic phrases:
- "Solid foundation, but MSPs will compare you to vendors who have nailed this"
- "That is a blocker; no amount of partner recruitment will overcome it until it is fixed"
- "That is a competitive advantage; MSPs will notice"
- "Leverage this strength in partner recruitment and positioning"
- "Identify the top two gaps in this dimension and address them before launch"
- "Prioritize product, pricing, or operational changes in this area before scaling the channel"
- "Room to improve" / "areas for improvement" / "key areas to focus on"

Return ONLY valid JSON (no markdown, no backticks, no preamble). Include one object in section_interpretations for sections ${sectionList}. Use exact section_name: "MSP-Ready Product Architecture", "Pricing & Partner Economics", "Organizational & GTM Readiness", "Partner Ecosystem & Recruitment", "Enablement & Partner Experience", "Competitive & Distribution Landscape", "Existing MSP Channel Health" (only include section 7 if Section 7 Skipped is false).

{
  "section_interpretations": [
    {
      "section_number": 1,
      "section_name": "MSP-Ready Product Architecture",
      "interpretation": "2-3 sentences. Name their lowest-scored question(s) in this section by name and score; explain operational impact on MSPs. Name their highest-scored question(s) and the strength. Tie to their product category where relevant.",
      "recommendation": "One concrete action tied to the specific gaps you named, not a generic line."
    }
  ]
}`;
}

/** Part 3 prompt: financial commentary, cost of delay, roadmap. */
export function buildNarrativePromptPart3(data: NarrativeInput): string {
  const context = narrativeContextBlock(data);
  return `${context}

Return ONLY valid JSON (no markdown, no backticks, no preamble):
{
  "financial_commentary": "2-3 sentences. Mention their ARR and ACV. Ground projections in their scale and category. Conservative; note assumptions.",
  "cost_of_delay_narrative": "2-3 sentences. Tie to their product category and competitive/distribution scores. Why waiting costs them specifically.",
  "roadmap_narrative": "3-4 sentences. Which gaps or dimensions to address first and in what order. Recommend the 90-minute deep-dive as first step (no cost, no obligation)."
}`;
}

function sectionTier(total: number): "high" | "mid" | "low" {
  if (total >= 20) return "high";
  if (total >= 13) return "mid";
  return "low";
}

/** Build section interpretations that name actual questions and scores (no generic template phrases). */
function buildFallbackSectionInterpretations(payload: PayloadForNarrative): SectionInterpretation[] {
  const pairs = getSectionNumsWithTotals(
    payload.computed.sectionTotals,
    payload.computed.section7Skipped
  );
  const sections: SectionInterpretation[] = [];
  const productCategory = payload.contact.productCategory || "your category";

  const sectionKeys = ["section1", "section2", "section3", "section4", "section5", "section6", "section7"] as const;
  for (const { num, total } of pairs) {
    const sectionScores = (
      payload as unknown as Record<string, { q1: number; q2: number; q3: number; q4: number; q5: number } | null>
    )[sectionKeys[num - 1]];
    const names = SECTION_QUESTION_NAMES[num as keyof typeof SECTION_QUESTION_NAMES];
    const sectionName = SECTION_NAMES[num];

    if (!sectionScores || !names) {
      sections.push({
        section_number: num,
        section_name: sectionName,
        interpretation: `You scored ${total}/25 in ${sectionName}. Review your individual question scores above to see where to focus.`,
        recommendation: "Address the lowest-scored dimensions in this section before scaling partner recruitment.",
      });
      continue;
    }

    const qScores = [
      { name: names[0], score: sectionScores.q1 },
      { name: names[1], score: sectionScores.q2 },
      { name: names[2], score: sectionScores.q3 },
      { name: names[3], score: sectionScores.q4 },
      { name: names[4], score: sectionScores.q5 },
    ];
    const byScoreAsc = [...qScores].sort((a, b) => a.score - b.score);
    const lowest = byScoreAsc.filter((q) => q.score <= 2);
    const highest = byScoreAsc.filter((q) => q.score >= 4).reverse();

    const lowestPhrase =
      lowest.length > 0
        ? lowest
            .map((q) => `${q.name} (${q.score}/5)`)
            .join(" and ")
        : null;
    const highestPhrase =
      highest.length > 0
        ? highest
            .map((q) => `${q.name} (${q.score}/5)`)
            .join(" and ")
        : null;

    let interpretation: string;
    if (lowestPhrase && highestPhrase) {
      interpretation = `Your lowest scores in ${sectionName} are ${lowestPhrase}. Those gaps directly affect MSP partner experience — without strength in these areas, partners will hesitate or churn. Your strongest dimensions here are ${highestPhrase}; use those in your positioning. In ${productCategory}, MSPs will weigh these factors when evaluating you.`;
    } else if (lowestPhrase) {
      interpretation = `In ${sectionName}, your lowest-scored areas are ${lowestPhrase}. These gaps impact how MSPs can deliver and margin they can make; address them before scaling recruitment. ${highestPhrase ? `Your strength in ${highestPhrase} gives you a starting point.` : ""}`.trim();
    } else if (highestPhrase) {
      interpretation = `You scored ${total}/25 in ${sectionName}, with strength in ${highestPhrase}. Leverage these in partner conversations and recruitment. Identify any remaining gaps in this section before launch.`;
    } else {
      interpretation = `You scored ${total}/25 in ${sectionName}. Review your individual question scores above; focus on moving any 3s to 4s where it matters most for MSPs in ${productCategory}.`;
    }

    const recommendation = lowest.length > 0
      ? `Fix or improve ${lowest.map((q) => q.name).join(" and ")} before investing in partner recruitment in this dimension.`
      : "Use your strengths in this section in your partner messaging; shore up any mid-range scores next.";

    sections.push({
      section_number: num,
      section_name: sectionName,
      interpretation,
      recommendation,
    });
  }

  return sections;
}

/** Section order for fallback: by section number, only those present (1-6 or 1-7). */
function getSectionNumsWithTotals(
  sectionTotals: { section1: number; section2: number; section3: number; section4: number; section5: number; section6: number; section7: number | null },
  section7Skipped: boolean
): { num: number; total: number }[] {
  const pairs = [
    { num: 1, total: sectionTotals.section1 },
    { num: 2, total: sectionTotals.section2 },
    { num: 3, total: sectionTotals.section3 },
    { num: 4, total: sectionTotals.section4 },
    { num: 5, total: sectionTotals.section5 },
    { num: 6, total: sectionTotals.section6 },
    ...(section7Skipped ? [] : [{ num: 7, total: sectionTotals.section7 ?? 0 }]),
  ];
  return pairs;
}

/** Templated narrative when Claude API fails or is unavailable. Section interpretations use actual question names (no generic template phrases). */
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
} & Record<string, unknown>): NarrativeOutput {
  const t = payload.computed.sectionTotals;
  const tier = payload.computed.readinessTier;
  const section7Skipped = payload.computed.section7Skipped;
  const pairs = getSectionNumsWithTotals(t, section7Skipped);
  const byTotalAsc = [...pairs].sort((a, b) => a.total - b.total);
  const weakest = byTotalAsc.slice(0, 2);
  const strongest = byTotalAsc[byTotalAsc.length - 1];

  const sections = buildFallbackSectionInterpretations(payload as PayloadForNarrative);

  const tierLabel =
    tier === "ready"
      ? "MSP Program Ready"
      : tier === "capable"
        ? "MSP Capable"
        : tier === "emerging"
          ? "MSP Emerging"
          : "MSP Premature";

  const weakestPhrase =
    weakest.length === 2
      ? `Your lowest scores are ${SECTION_NAMES[weakest[0].num]} (${weakest[0].total}/25) and ${SECTION_NAMES[weakest[1].num]} (${weakest[1].total}/25).`
      : weakest.length === 1
        ? `Your lowest score is ${SECTION_NAMES[weakest[0].num]} (${weakest[0].total}/25).`
        : "";
  const strongestPhrase =
    strongest && sectionTier(strongest.total) === "high"
      ? ` Your strongest area is ${SECTION_NAMES[strongest.num]} (${strongest.total}/25).`
      : "";
  const redFlagsPhrase =
    payload.computed.redFlags.length > 0
      ? ` In particular: ${payload.computed.redFlags.join("; ")}. Address these before investing in partner recruitment.`
      : weakest.length > 0
        ? " Focus on these areas first, then build your program design and recruitment plan."
        : "";
  const executive_summary = `Your overall score of ${payload.computed.overallScore}/100 places you in the ${tierLabel} tier. ${weakestPhrase}${strongestPhrase}${redFlagsPhrase} The next step is a complimentary 90-minute deep-dive assessment with an expert who can uncover the nuances a self-assessment cannot. No cost, no obligation.`;

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

const NARRATIVE_TIMEOUT_MS = 90_000;

type PayloadForNarrative = Parameters<typeof payloadToNarrativeInput>[0];

/** Call Claude with prompt; throws on failure. */
async function callClaudeForNarrative(
  prompt: string,
  maxTokens: number
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const anthropic = new Anthropic({ apiKey });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NARRATIVE_TIMEOUT_MS);
  const response = await Promise.race([
    anthropic.messages.create(
      {
        model: "claude-sonnet-4-6",
        max_tokens: maxTokens,
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
  return text;
}

/** Part 1: Executive summary + top 3 critical gaps + top 2 strengths. */
export async function getNarrativePart1(payload: PayloadForNarrative): Promise<NarrativePart1> {
  const data = payloadToNarrativeInput(payload);
  try {
    const text = await callClaudeForNarrative(buildNarrativePromptPart1(data), 1200);
    const parsed = JSON.parse(text) as NarrativePart1;
    if (
      typeof parsed.executive_summary !== "string" ||
      !Array.isArray(parsed.top_3_critical_gaps) ||
      !Array.isArray(parsed.top_2_strengths)
    ) {
      throw new Error("Invalid part 1 structure");
    }
    return parsed;
  } catch (err) {
    console.error("AI narrative part 1 failed, using fallback:", err);
    const full = generateFallbackNarrative(payload);
    const pairs = getSectionNumsWithTotals(
      payload.computed.sectionTotals,
      payload.computed.section7Skipped
    );
    const byTotalAsc = [...pairs].sort((a, b) => a.total - b.total);
    const weakest = byTotalAsc.slice(0, 3).map((p) => `${SECTION_NAMES[p.num]} (${p.total}/25): address before scaling.`);
    const strongest = byTotalAsc.slice(-2).reverse().map((p) => `${SECTION_NAMES[p.num]} (${p.total}/25): leverage in recruitment.`);
    return {
      executive_summary: full.executive_summary,
      top_3_critical_gaps: weakest,
      top_2_strengths: strongest,
    };
  }
}

/** Part 2: Section interpretations for all sections. */
export async function getNarrativePart2(payload: PayloadForNarrative): Promise<NarrativePart2> {
  const data = payloadToNarrativeInput(payload);
  try {
    const text = await callClaudeForNarrative(buildNarrativePromptPart2(data), 2800);
    const parsed = JSON.parse(text) as NarrativePart2;
    if (!Array.isArray(parsed.section_interpretations)) throw new Error("Invalid part 2 structure");
    return parsed;
  } catch (err) {
    console.error("AI narrative part 2 failed, using answer-specific fallback:", err);
    return { section_interpretations: buildFallbackSectionInterpretations(payload) };
  }
}

/** Part 3: Financial commentary, cost of delay, roadmap. */
export async function getNarrativePart3(payload: PayloadForNarrative): Promise<NarrativePart3> {
  const data = payloadToNarrativeInput(payload);
  try {
    const text = await callClaudeForNarrative(buildNarrativePromptPart3(data), 800);
    const parsed = JSON.parse(text) as NarrativePart3;
    if (
      typeof parsed.financial_commentary !== "string" ||
      typeof parsed.cost_of_delay_narrative !== "string" ||
      typeof parsed.roadmap_narrative !== "string"
    ) {
      throw new Error("Invalid part 3 structure");
    }
    return parsed;
  } catch (err) {
    console.error("AI narrative part 3 failed, using fallback:", err);
    const full = generateFallbackNarrative(payload);
    return {
      financial_commentary: full.financial_commentary,
      cost_of_delay_narrative: full.cost_of_delay_narrative,
      roadmap_narrative: full.roadmap_narrative,
    };
  }
}

/**
 * Generate narrative via Claude API with 15s timeout; on failure returns fallback.
 * Used by /api/generate-narrative (full) and submit flow.
 */
export async function getNarrative(payload: PayloadForNarrative): Promise<NarrativeOutput> {
  const data = payloadToNarrativeInput(payload);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set, using fallback narrative");
    return generateFallbackNarrative(payload);
  }
  try {
    const prompt = buildNarrativePrompt(data);
    const text = await callClaudeForNarrative(prompt, 4500);
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

/**
 * Generate narrative by running parts 1–3 in parallel (~3x faster than single getNarrative).
 * Used by results-page background generation.
 */
export async function getNarrativeParallel(payload: PayloadForNarrative): Promise<NarrativeOutput> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateFallbackNarrative(payload);
  }
  const [part1, part2, part3] = await Promise.all([
    getNarrativePart1(payload),
    getNarrativePart2(payload),
    getNarrativePart3(payload),
  ]);
  return {
    executive_summary: part1.executive_summary,
    section_interpretations: part2.section_interpretations,
    financial_commentary: part3.financial_commentary,
    cost_of_delay_narrative: part3.cost_of_delay_narrative,
    roadmap_narrative: part3.roadmap_narrative,
  };
}
