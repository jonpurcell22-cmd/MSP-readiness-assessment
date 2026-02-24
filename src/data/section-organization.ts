import type { AssessmentSectionConfig } from "@/types/assessment";

export const sectionOrganizationConfig: AssessmentSectionConfig = {
  sectionKey: "section3",
  sectionNumber: 3,
  title: "Organizational & GTM Readiness",
  description: "Programs fail internally before they fail externally. This is where most vendors get it wrong.",
  questions: [
    {
      name: "Executive Commitment",
      context: "MSP programs take 12-18 months to produce meaningful revenue. If leadership expects ROI in one quarter, the program will be killed before it has a chance.",
      questionKey: "q1",
      options: [
        { score: 1, shortLabel: "No executive awareness or interest, not on the roadmap", fullDescription: "No executive awareness or interest, not on the roadmap. Program would be a side project." },
        { score: 2, shortLabel: "Executive interest but viewed as experiment, no budget or timeline committed", fullDescription: "Executive interest but viewed as experiment, no budget or timeline committed. Easy to kill." },
        { score: 3, shortLabel: "Leadership supports exploring, willing to allocate some resources, but expects results in under 6 months", fullDescription: "Leadership supports exploring, willing to allocate some resources, but expects results in under 6 months. Timeline mismatch." },
        { score: 4, shortLabel: "Executive sponsor committed with 12+ month horizon, budget allocated for program development", fullDescription: "Executive sponsor committed with 12+ month horizon, budget allocated for program development. Real commitment." },
        { score: 5, shortLabel: "Board-level strategic priority with dedicated budget, headcount plan, and executive sponsor with cross-functional authority", fullDescription: "Board-level strategic priority with dedicated budget, headcount plan, and executive sponsor with cross-functional authority. Program has staying power." },
      ],
    },
    {
      name: "Channel Conflict Readiness",
      context: "When a direct rep works a prospect and an MSP registers the same deal, someone has to lose. If you haven't designed for this, your direct team will kill your MSP program from the inside.",
      questionKey: "q2",
      options: [
        { score: 1, shortLabel: "No conflict rules, direct reps compensated on all revenue including partner-sourced, no deal registration", fullDescription: "No conflict rules, direct reps compensated on all revenue including partner-sourced, no deal registration. Partners will lose every time." },
        { score: 2, shortLabel: "Topic discussed but no formal policy, direct reps would resist losing deals to partners", fullDescription: "Topic discussed but no formal policy, direct reps would resist losing deals to partners. Conflict inevitable." },
        { score: 3, shortLabel: "Basic deal registration or territory rules on paper, inconsistent enforcement, comp not adjusted", fullDescription: "Basic deal registration or territory rules on paper, inconsistent enforcement, comp not adjusted. Paper only." },
        { score: 4, shortLabel: "Formal policy with deal registration, territory boundaries, and comp adjustments that incentivize supporting partners", fullDescription: "Formal policy with deal registration, territory boundaries, and comp adjustments that incentivize supporting partners. Designed for co-existence." },
        { score: 5, shortLabel: "Fully designed: deal registration with teeth, comp multipliers for partner-sourced revenue, clear escalation, executive-backed enforcement", fullDescription: "Fully designed: deal registration with teeth, comp multipliers for partner-sourced revenue, clear escalation, executive-backed enforcement. Direct and channel aligned." },
      ],
    },
    {
      name: "Dedicated Channel Resources",
      context: "A partner program run as a side project by someone who also manages direct sales will fail. Full stop.",
      questionKey: "q3",
      options: [
        { score: 1, shortLabel: "No one owns the partner channel, would be added to existing role", fullDescription: "No one owns the partner channel, would be added to existing role. No ownership." },
        { score: 2, shortLabel: "One person has partial responsibility, also owns other functions, no dedicated budget", fullDescription: "One person has partial responsibility, also owns other functions, no dedicated budget. Side of desk." },
        { score: 3, shortLabel: "Dedicated channel role exists (or budgeted to hire), single individual with limited budget", fullDescription: "Dedicated channel role exists (or budgeted to hire), single individual with limited budget. A start." },
        { score: 4, shortLabel: "Dedicated channel lead plus budget for MDF, events, and partner marketing, plan to scale", fullDescription: "Dedicated channel lead plus budget for MDF, events, and partner marketing, plan to scale. Real program." },
        { score: 5, shortLabel: "Channel team in place (or fully budgeted) with dedicated recruitment, enablement, and success roles, meaningful budget", fullDescription: "Channel team in place (or fully budgeted) with dedicated recruitment, enablement, and success roles, meaningful budget. Built to scale." },
      ],
    },
    {
      name: "Product Roadmap Responsiveness",
      context: "MSPs will surface product needs you've never heard from direct customers. If your product team ignores partner feedback, MSPs leave.",
      questionKey: "q4",
      options: [
        { score: 1, shortLabel: "Roadmap driven entirely by direct customer and internal priorities, no partner input mechanism", fullDescription: "Roadmap driven entirely by direct customer and internal priorities, no partner input mechanism. Partners invisible to product." },
        { score: 2, shortLabel: "Partners can submit requests but same backlog as everything else, no special priority", fullDescription: "Partners can submit requests but same backlog as everything else, no special priority. Black hole." },
        { score: 3, shortLabel: "Product team aware of MSP needs, addressed some, no formal feedback loop", fullDescription: "Product team aware of MSP needs, addressed some, no formal feedback loop. Ad hoc." },
        { score: 4, shortLabel: "MSP requirements are defined roadmap input, partner advisory board or structured feedback loop exists", fullDescription: "MSP requirements are defined roadmap input, partner advisory board or structured feedback loop exists. Partners have a voice." },
        { score: 5, shortLabel: "Product team actively prioritizes MSP features, partner advisory board meets regularly, roadmap has visible partner category", fullDescription: "Product team actively prioritizes MSP features, partner advisory board meets regularly, roadmap has visible partner category. MSP needs are first-class." },
      ],
    },
    {
      name: "Go-to-Market Clarity",
      context: "'We'll sell through MSPs' is not a strategy. You need a defined ideal partner profile, a distinct MSP value proposition, and a clear understanding of how MSP distribution differs from direct.",
      questionKey: "q5",
      options: [
        { score: 1, shortLabel: "No MSP-specific GTM thinking, we'll figure it out", fullDescription: "No MSP-specific GTM thinking, we'll figure it out. No strategy." },
        { score: 2, shortLabel: "General awareness MSPs are different from resellers, no defined ideal partner profile", fullDescription: "General awareness MSPs are different from resellers, no defined ideal partner profile. Vague." },
        { score: 3, shortLabel: "Some ideal MSP partner definition (size, geography, vertical), value prop partially differentiated", fullDescription: "Some ideal MSP partner definition (size, geography, vertical), value prop partially differentiated. Getting there." },
        { score: 4, shortLabel: "Clear ideal MSP partner profile documented, distinct value prop speaking to MSP business model", fullDescription: "Clear ideal MSP partner profile documented, distinct value prop speaking to MSP business model. Can recruit with focus." },
        { score: 5, shortLabel: "Fully developed MSP GTM: ideal partner profile, distinct value prop, defined partner journey, clear partner success metrics", fullDescription: "Fully developed MSP GTM: ideal partner profile, distinct value prop, defined partner journey, clear partner success metrics. Ready to scale." },
      ],
    },
  ],
};
