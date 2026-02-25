import type { AssessmentSectionConfig } from "@/types/assessment";

export const sectionCompetitiveConfig: AssessmentSectionConfig = {
  sectionKey: "section6",
  sectionNumber: 6,
  title: "Competitive & Distribution Landscape",
  description: "You're not entering an empty market. You're competing for shelf space in a partner's stack.",
  questions: [
    {
      name: "Competitor MSP Program Maturity",
      context: "If competitors have polished MSP programs with large partner bases, you're entering with a speed disadvantage. If theirs are weak, you have a window.",
      questionKey: "q1",
      options: [
        { score: 1, shortLabel: "Top competitors have mature, well-funded programs with large partner bases, entering late", fullDescription: "Top competitors have mature, well-funded programs with large partner bases, entering late. Speed disadvantage." },
        { score: 2, shortLabel: "Two or three competitors have established programs, need clear why switch story", fullDescription: "Two or three competitors have established programs, need clear why switch story. Must differentiate." },
        { score: 3, shortLabel: "Competitors have mediocre programs, MSPs have complaints, room to win", fullDescription: "Competitors have mediocre programs, MSPs have complaints, room to win. Opportunity." },
        { score: 4, shortLabel: "Competitors have early or weak programs, market still forming, well-executed program would stand out", fullDescription: "Competitors have early or weak programs, market still forming, well-executed program would stand out. Open window." },
        { score: 5, shortLabel: "No competitor has a strong MSP program in your category, greenfield opportunity", fullDescription: "No competitor has a strong MSP program in your category, greenfield opportunity. First-mover advantage." },
      ],
    },
    {
      name: "Distributor Coverage Gaps",
      context: "If competitors are leveraging distributors and you're not, MSPs may buy the competitor because it's easier.",
      questionKey: "q2",
      options: [
        { score: 1, shortLabel: "Competitors locked up key distributors, no obvious openings", fullDescription: "Competitors locked up key distributors, no obvious openings. Hard to get listed." },
        { score: 2, shortLabel: "Competitors on major distributors, you could list but compete head-to-head from weaker position", fullDescription: "Competitors on major distributors, you could list but compete head-to-head from weaker position. Uphill battle." },
        { score: 3, shortLabel: "Some distributor coverage gaps, one or two distributors lack a strong option in your category", fullDescription: "Some distributor coverage gaps, one or two distributors lack a strong option in your category. Opening exists." },
        { score: 4, shortLabel: "Clear gap: a major distributor actively looking for a vendor in your category or competitor relationship weakening", fullDescription: "Clear gap: a major distributor actively looking for a vendor in your category or competitor relationship weakening. Timing opportunity." },
        { score: 5, shortLabel: "Distributor white space, could be first/strongest in category, distributors have expressed interest", fullDescription: "Distributor white space, could be first/strongest in category, distributors have expressed interest. Greenfield distribution." },
      ],
    },
    {
      name: "MSP Platform Ecosystem Fit",
      context: "Does your product complement or enhance adjacent products or does your product have overlapping features that make it confusing?",
      questionKey: "q3",
      options: [
        { score: 1, shortLabel: "Directly competes with a module in a major MSP platform", fullDescription: "Directly competes with a module in a major MSP platform. Friction with platform vendors." },
        { score: 2, shortLabel: "Some overlap with platform capabilities, potential friction", fullDescription: "Some overlap with platform capabilities, potential friction. Need clear positioning." },
        { score: 3, shortLabel: "Neutral: doesn't compete or complement, standalone addition", fullDescription: "Neutral: doesn't compete or complement, standalone addition. Fits alongside." },
        { score: 4, shortLabel: "Complements and integrates with one or more major MSP platforms", fullDescription: "Complements and integrates with one or more major MSP platforms. Better together." },
        { score: 5, shortLabel: "Deep ecosystem fit: native integrations, marketplace listings, better together positioning", fullDescription: "Deep ecosystem fit: native integrations, marketplace listings, better together positioning. Native to MSP stack." },
      ],
    },
    {
      name: "MSP-Specific Differentiation",
      context: "Being better isn't enough. You need to be better in ways MSPs care about: margins, multi-tenancy, conflict policies, onboarding speed.",
      questionKey: "q4",
      options: [
        { score: 1, shortLabel: "No MSP-specific differentiation, advantages relevant to end customers only", fullDescription: "No MSP-specific differentiation, advantages relevant to end customers only. Wrong value prop." },
        { score: 2, shortLabel: "Some MSP-relevant advantages but incremental, not decisive", fullDescription: "Some MSP-relevant advantages but incremental, not decisive. Nice to have." },
        { score: 3, shortLabel: "Clear differentiators on 1-2 MSP-relevant dimensions, not yet validated with MSPs", fullDescription: "Clear differentiators on 1-2 MSP-relevant dimensions, not yet validated with MSPs. Potential." },
        { score: 4, shortLabel: "Strong differentiation on multiple dimensions, validated by MSP feedback", fullDescription: "Strong differentiation on multiple dimensions, validated by MSP feedback. Compelling." },
        { score: 5, shortLabel: "Decisive advantage: product, pricing, support, and partner experience clearly superior on MSP priorities", fullDescription: "Decisive advantage: product, pricing, support, and partner experience clearly superior on MSP priorities. No-brainer for MSPs." },
      ],
    },
    {
      name: "Market Timing & Window",
      context: "Timing matters as much as product quality. Competitor acquisitions, pricing changes, and compliance mandates create windows that open and close.",
      questionKey: "q5",
      options: [
        { score: 1, shortLabel: "No timing advantage, market stable, competitors entrenched", fullDescription: "No timing advantage, market stable, competitors entrenched. No urgency." },
        { score: 2, shortLabel: "Minor market shifts, nothing creating urgency", fullDescription: "Minor market shifts, nothing creating urgency. Status quo." },
        { score: 3, shortLabel: "Some market movement (acquisition, new compliance requirements) creating moderate opportunity", fullDescription: "Some market movement (acquisition, new compliance requirements) creating moderate opportunity. Some movement." },
        { score: 4, shortLabel: "Clear timing window from competitor disruption or market shift creating partner movement", fullDescription: "Clear timing window from competitor disruption or market shift creating partner movement. Window open." },
        { score: 5, shortLabel: "Urgent window forcing MSPs to reevaluate vendors now", fullDescription: "Urgent window forcing MSPs to reevaluate vendors now." },
      ],
    },
  ],
};
