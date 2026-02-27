/**
 * Mock AI content for the results-by-id page when real narrative is not stored.
 * Uses tier and scores to produce deterministic copy. Replace with real AI when needed.
 */

import type { Tier } from "@/lib/scoring";
import { TIER_DEFINITIONS } from "@/lib/scoring";
import { sections } from "@/lib/assessment-data";

/** Section totals keyed by section id (e.g. section1, section2). */
export type SectionScoresMap = Record<string, number>;

/** Generic answers shape for interpretation (section scores, product_category, etc.). */
export type AnswersMap = Record<string, unknown>;

export function generateExecutiveSummary(
  companyName: string,
  totalScore: number,
  tier: Tier,
  sectionScores: SectionScoresMap
): string {
  const definition = TIER_DEFINITIONS[tier];
  const maxPerSection = 25;
  const sectionIds = sections.map((s) => s.id);
  const lowest = sectionIds.reduce<{ id: string; total: number } | null>((acc, id) => {
    const t = sectionScores[id] ?? 0;
    if (acc === null || t < acc.total) return { id, total: t };
    return acc;
  }, null);
  const highest = sectionIds.reduce<{ id: string; total: number } | null>((acc, id) => {
    const t = sectionScores[id] ?? 0;
    if (acc === null || t > acc.total) return { id, total: t };
    return acc;
  }, null);
  const lowName = lowest ? sections.find((s) => s.id === lowest.id)?.title ?? "one dimension" : "one dimension";
  const highName = highest ? sections.find((s) => s.id === highest.id)?.title ?? "another dimension" : "another dimension";
  return `${companyName} scored ${totalScore} out of 100, placing you in the ${tier} tier. ${definition} Your strongest area in this assessment is ${highName}; the biggest opportunity is ${lowName}.`;
}

export function generateSectionInterpretation(
  sectionId: string,
  sectionTotal: number,
  _answers: AnswersMap
): string {
  const section = sections.find((s) => s.id === sectionId);
  const name = section?.title ?? sectionId;
  const max = 25;
  const pct = max > 0 ? Math.round((sectionTotal / max) * 100) : 0;
  if (pct >= 80) return `${name} is a strength (${sectionTotal}/${max}). Build on this in your positioning and partner conversations.`;
  if (pct >= 50) return `${name} shows room to improve (${sectionTotal}/${max}). Focus on the lowest-scoring questions in this section before launch.`;
  return `${name} needs attention (${sectionTotal}/${max}). Address these gaps before scaling your MSP program.`;
}

export interface CompetitorInsight {
  company: string;
  strength: string;
  channelApproach: string;
  opportunity: string;
}

/** Sample competitors by category for results page table when no AI landscape is stored. */
const MOCK_COMPETITORS_BY_CATEGORY: Record<string, CompetitorInsight[]> = {
  "Backup & DR": [
    { company: "Veeam", strength: "Strong MSP program, NFR, partner portal", channelApproach: "Established MSP Program", opportunity: "Differentiate on simplicity and pricing" },
    { company: "Druva", strength: "SaaS-native, cloud backup", channelApproach: "General Partner Program", opportunity: "MSP-specific incentives and co-sell" },
    { company: "Acronis", strength: "Cyber Protect, broad SMB focus", channelApproach: "Established MSP Program", opportunity: "Position on integration and margin" },
  ],
  "Cybersecurity": [
    { company: "Palo Alto", strength: "Enterprise brand, MSSP motion", channelApproach: "Established MSP Program", opportunity: "SMB MSP segment and ease of use" },
    { company: "CrowdStrike", strength: "Cloud-native, strong channel", channelApproach: "Established MSP Program", opportunity: "Pricing and multi-tenant management" },
    { company: "SentinelOne", strength: "MSP-friendly licensing", channelApproach: "Early/Limited MSP Program", opportunity: "Expand program and enablement" },
  ],
  default: [
    { company: "Category leader", strength: "Brand and scale", channelApproach: "Established MSP Program", opportunity: "Clarify your MSP value proposition" },
    { company: "Mid-market player", strength: "Partner focus", channelApproach: "General Partner Program", opportunity: "Differentiate on pricing and enablement" },
    { company: "Emerging vendor", strength: "Product innovation", channelApproach: "Early/Limited MSP Program", opportunity: "Build proof points that matter to MSPs" },
  ],
};

export function generateCompetitiveLandscape(
  productCategory: string,
  companyName: string
): string {
  const category = productCategory || "Technology";
  return `The competitive landscape for ${category} is evolving. ${companyName} can differentiate by clarifying your MSP value proposition, pricing, and enablement so partners choose you over alternatives. Focus on a clear "why switch" and proof points that matter to MSPs.`;
}

export function getMockCompetitors(productCategory: string): CompetitorInsight[] {
  const category = productCategory?.trim() || "Technology";
  const key = Object.keys(MOCK_COMPETITORS_BY_CATEGORY).find((k) => k !== "default" && category.toLowerCase().includes(k.toLowerCase()));
  return MOCK_COMPETITORS_BY_CATEGORY[key ?? "default"] ?? MOCK_COMPETITORS_BY_CATEGORY.default;
}
