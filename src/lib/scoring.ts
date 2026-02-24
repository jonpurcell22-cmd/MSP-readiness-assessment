/**
 * MSP Channel Readiness Assessment - Pure scoring logic
 * Section totals, overall score normalization, tier calculation, red flag detection.
 */

import type {
  SectionScores,
  SectionTotals,
  ComputedResults,
  ReadinessTier,
  AssessmentState,
} from "@/types/assessment";

const QUESTIONS_PER_SECTION = 5;
const MIN_QUESTION_SCORE = 1;
const MAX_QUESTION_SCORE = 5;
const MAX_SECTION_RAW = QUESTIONS_PER_SECTION * MAX_QUESTION_SCORE; // 25
const SECTIONS_GREENFIELD = 6;
const SECTIONS_FULL = 7;
const MAX_RAW_GREENFIELD = SECTIONS_GREENFIELD * MAX_SECTION_RAW; // 150
const MAX_RAW_FULL = SECTIONS_FULL * MAX_SECTION_RAW; // 175

// --- Section total ---

export function sumSectionScores(scores: SectionScores | null): number | null {
  if (!scores) return null;
  const sum =
    scores.q1 + scores.q2 + scores.q3 + scores.q4 + scores.q5;
  return Math.min(
    Math.max(sum, QUESTIONS_PER_SECTION * MIN_QUESTION_SCORE),
    MAX_SECTION_RAW
  );
}

// --- All section totals ---

export function computeSectionTotals(state: {
  section1: SectionScores | null;
  section2: SectionScores | null;
  section3: SectionScores | null;
  section4: SectionScores | null;
  section5: SectionScores | null;
  section6: SectionScores | null;
  section7: SectionScores | null;
  section7Skipped: boolean | null;
}): SectionTotals {
  const s1 = sumSectionScores(state.section1) ?? 0;
  const s2 = sumSectionScores(state.section2) ?? 0;
  const s3 = sumSectionScores(state.section3) ?? 0;
  const s4 = sumSectionScores(state.section4) ?? 0;
  const s5 = sumSectionScores(state.section5) ?? 0;
  const s6 = sumSectionScores(state.section6) ?? 0;
  const skipped = state.section7Skipped === true;
  const s7 = skipped ? null : (sumSectionScores(state.section7) ?? 0);

  return {
    section1: s1,
    section2: s2,
    section3: s3,
    section4: s4,
    section5: s5,
    section6: s6,
    section7: s7,
  };
}

// --- Overall score (normalized 0-100) ---

export function computeOverallScore(totals: SectionTotals): number {
  const raw =
    totals.section1 +
    totals.section2 +
    totals.section3 +
    totals.section4 +
    totals.section5 +
    totals.section6 +
    (totals.section7 ?? 0);
  const max = totals.section7 === null ? MAX_RAW_GREENFIELD : MAX_RAW_FULL;
  const normalized = (raw / max) * 100;
  return Math.round(normalized);
}

// --- Readiness tier from overall score ---

export function getReadinessTier(overallScore: number): ReadinessTier {
  if (overallScore >= 85) return "ready";
  if (overallScore >= 65) return "capable";
  if (overallScore >= 45) return "emerging";
  return "premature";
}

// --- Red flag detection (spec rules) ---

export function detectRedFlags(
  state: Pick<
    AssessmentState,
    "section1" | "section2" | "section3" | "section7Skipped"
  >
): string[] {
  const flags: string[] = [];

  // Section 1, Q1 (Multi-Tenant) scored 1 or 2
  if (state.section1 && (state.section1.q1 === 1 || state.section1.q1 === 2)) {
    flags.push(
      "Critical: No multi-tenant management. MSPs will not adopt a product that requires separate logins per client."
    );
  }

  // Section 1, Q2 (API/Integration) scored 1 or 2
  if (state.section1 && (state.section1.q2 === 1 || state.section1.q2 === 2)) {
    flags.push(
      "Critical: No PSA/RMM integrations. MSPs can't connect your product to their operational backbone."
    );
  }

  // Section 2, Q1 (Pricing) scored 1 or 2
  if (state.section2 && (state.section2.q1 === 1 || state.section2.q1 === 2)) {
    flags.push(
      "Critical: Pricing model isn't built for MSP economics. Partners can't make the math work."
    );
  }

  // Section 3, Q2 (Channel Conflict) scored 1 or 2
  if (state.section3 && (state.section3.q2 === 1 || state.section3.q2 === 2)) {
    flags.push(
      "Critical: No channel conflict resolution. Your direct sales team will destroy partner trust."
    );
  }

  // Section 3, Q1 (Executive Commitment) scored 1 or 2
  if (state.section3 && (state.section3.q1 === 1 || state.section3.q1 === 2)) {
    flags.push(
      "Critical: No executive commitment to a 12+ month investment. The program will be killed before it can produce results."
    );
  }

  return flags;
}

// --- Single entry point: full computed results from assessment state ---

export function computeResults(state: AssessmentState): ComputedResults | null {
  const section7Skipped = state.section7Skipped === true;

  const sectionTotals = computeSectionTotals({
    section1: state.section1,
    section2: state.section2,
    section3: state.section3,
    section4: state.section4,
    section5: state.section5,
    section6: state.section6,
    section7: state.section7,
    section7Skipped,
  });

  const overallScore = computeOverallScore(sectionTotals);
  const readinessTier = getReadinessTier(overallScore);
  const redFlags = detectRedFlags(state);

  return {
    sectionTotals,
    overallScore,
    readinessTier,
    redFlags,
    section7Skipped,
  };
}

// --- Constants for UI (tier labels, colors, interpretations) ---

export const TIER_LABELS: Record<ReadinessTier, string> = {
  ready: "MSP Program Ready",
  capable: "MSP Capable",
  emerging: "MSP Emerging",
  premature: "MSP Premature",
};

/** Hex colors for tier badges and charts (spec brand palette). */
export const TIER_COLORS: Record<ReadinessTier, string> = {
  ready: "#2D8C46",
  capable: "#1A8A7D",
  emerging: "#D97706",
  premature: "#DC2626",
};

/** 2–3 sentence interpretation for results teaser (spec copy). */
export const TIER_INTERPRETATIONS: Record<ReadinessTier, string> = {
  ready:
    "Strong foundation. Focus on program design, recruitment, and distributor placement.",
  capable:
    "Good product-market fit with targeted gaps to close before launch.",
  emerging:
    "Product has potential but requires meaningful foundational work.",
  premature:
    "Significant gaps. Focus on product maturity before pursuing MSP distribution.",
};

/** Score range label per tier (for tier definition block). */
export const TIER_SCORE_RANGES: Record<ReadinessTier, string> = {
  ready: "85-100",
  capable: "65-84",
  emerging: "45-64",
  premature: "Below 45",
};

/** Tier definition text for results page and PDF executive summary. */
export const TIER_DEFINITIONS: Record<ReadinessTier, string> = {
  ready:
    "Strong foundation across all dimensions. Your product, pricing, and organization are positioned for MSP distribution. Focus shifts to program design, partner recruitment strategy, and distributor placement.",
  capable:
    "Good product-market fit for the MSP channel with targeted gaps to close before launch. The foundation is there, but specific areas need attention to avoid early program failures that damage your reputation in the MSP community.",
  emerging:
    "Your product has potential for MSP distribution but requires meaningful foundational work before a program launch would succeed. Launching prematurely in the MSP ecosystem is worse than waiting, because word travels fast and first impressions stick.",
  premature:
    "Significant gaps exist across multiple dimensions. Launching an MSP program today would waste investment and damage your credibility in a community where reputation is everything. Focus on product maturity and organizational readiness before pursuing MSP distribution.",
};

export const MAX_SECTION_SCORE = MAX_SECTION_RAW;
