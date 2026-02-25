/**
 * Competitive MSP Landscape analysis (AI + web search).
 * Used by generate-competitive API, results page, and PDF.
 */

export type MspProgramStatus =
  | "Established MSP Program"
  | "General Partner Program"
  | "Early/Limited MSP Program"
  | "No Public MSP Program Found";

export interface CompetitiveCompetitor {
  name: string;
  website: string;
  mspProgramStatus: MspProgramStatus;
  distributorPresence: string[];
  programEvidence: string;
  mspRelevantWeakness: string;
}

export interface CompetitiveLandscapeOutput {
  competitors: CompetitiveCompetitor[];
  landscapeSummary: string;
  distributorOpportunity: string;
  strategicImplication: string;
}

export function isCompetitiveLandscapeOutput(value: unknown): value is CompetitiveLandscapeOutput {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    Array.isArray(o.competitors) &&
    typeof o.landscapeSummary === "string" &&
    typeof o.distributorOpportunity === "string" &&
    typeof o.strategicImplication === "string"
  );
}
