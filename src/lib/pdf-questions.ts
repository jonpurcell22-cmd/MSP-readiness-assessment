/**
 * Section and question labels for PDF section breakdown (strengths/gaps).
 */

export const SECTION_PDF_LABELS: Record<number, string> = {
  1: "Product Architecture",
  2: "Pricing & Economics",
  3: "Organization & GTM",
  4: "Partner Ecosystem",
  5: "Enablement",
  6: "Competitive Landscape",
  7: "Channel Health",
};

export const SECTION_QUESTION_NAMES: Record<number, [string, string, string, string, string]> = {
  1: [
    "Multi-Tenant Management",
    "API & Integration Depth",
    "Automated Provisioning",
    "White-Label / Co-Brand",
    "Client Reporting & Value Demo",
  ],
  2: [
    "MSP-Friendly Pricing",
    "Partner Margin Viability",
    "Billing & Invoicing Flexibility",
    "Recurring Revenue Alignment",
    "MSP Cost to Deliver",
  ],
  3: [
    "Executive Commitment",
    "Channel Conflict Readiness",
    "Dedicated Channel Resources",
    "Product Roadmap Responsiveness",
    "Go-to-Market Clarity",
  ],
  4: [
    "Category Demand from MSPs",
    "Distributor Relationship",
    "MSP Community Visibility",
    "Existing MSP Relationships",
    "Competitive Recruitment Advantage",
  ],
  5: [
    "Partner Onboarding",
    "MSP Sales Enablement",
    "Technical Training & Certification",
    "Partner Support Experience",
    "NFR & Demo Environment",
  ],
  6: [
    "Competitor MSP Program Maturity",
    "Distributor Coverage Gaps",
    "MSP Platform Ecosystem Fit",
    "MSP-Specific Differentiation",
    "Market Timing & Window",
  ],
  7: [
    "Partner Activation Rate",
    "Revenue Concentration",
    "Partner Retention",
    "Time to First Client Deployment",
    "Partner Satisfaction & Advocacy",
  ],
};

export function getStrengthsAndGaps(
  sectionNum: number,
  scores: { q1: number; q2: number; q3: number; q4: number; q5: number } | null
): { strengths: string[]; gaps: string[] } {
  const names = SECTION_QUESTION_NAMES[sectionNum];
  if (!names || !scores) return { strengths: [], gaps: [] };
  const strengths: string[] = [];
  const gaps: string[] = [];
  const qs = [scores.q1, scores.q2, scores.q3, scores.q4, scores.q5];
  qs.forEach((s, i) => {
    if (s >= 4) strengths.push(names[i]);
    else if (s <= 2) gaps.push(names[i]);
  });
  return { strengths, gaps };
}
