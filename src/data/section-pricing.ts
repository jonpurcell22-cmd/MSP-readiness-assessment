import type { AssessmentSectionConfig } from "@/types/assessment";

export const sectionPricingConfig: AssessmentSectionConfig = {
  sectionKey: "section2",
  sectionNumber: 2,
  title: "Pricing & Partner Economics",
  description:
    "Pricing and packaging for MSPs is materially different than for direct sales. This often is a make or break for large scale success.",
  questions: [
    {
      name: "MSP-Friendly Pricing Structure",
      context:
        "Enterprise pricing (annual contracts, flat fees, minimum commitments) kills MSP economics. MSPs need per-unit pricing that flexes with their client base.",
      questionKey: "q1",
      options: [
        { score: 1, shortLabel: "Enterprise pricing only: annual contracts, flat fees, minimums that don't flex", fullDescription: "Enterprise pricing only: annual contracts, flat fees, minimums that don't flex. MSPs cannot scale with their client base." },
        { score: 2, shortLabel: "Some per-unit element but not MSP-designed, no volume tiers or aggregate billing", fullDescription: "Some per-unit element but not MSP-designed, no volume tiers or aggregate billing. Partial fit." },
        { score: 3, shortLabel: "Per-seat/per-device pricing with some volume tiers, not optimized for MSP buying patterns", fullDescription: "Per-seat/per-device pricing with some volume tiers, not optimized for MSP buying patterns. Workable but not ideal." },
        { score: 4, shortLabel: "MSP-friendly per-unit pricing with volume tiers and aggregate pricing across MSP client base", fullDescription: "MSP-friendly per-unit pricing with volume tiers and aggregate pricing across MSP client base. MSPs can build a practice." },
        { score: 5, shortLabel: "Purpose-built MSP pricing: consumption-based, aggressive volume tiers, aggregate billing, gets cheaper as MSP scales", fullDescription: "Purpose-built MSP pricing: consumption-based, aggressive volume tiers, aggregate billing, gets cheaper as MSP scales. Economics improve with scale." },
      ],
    },
    {
      name: "Partner Margin Viability",
      context: "MSPs don't always need to make a significant margin on your software, but they can't lose money.",
      questionKey: "q2",
      options: [
        { score: 1, shortLabel: "No partner margin structure, MSPs buy at or near retail", fullDescription: "No partner margin structure, MSPs buy at or near retail. No room for MSP profit." },
        { score: 2, shortLabel: "Under 15% discount, thin margins after MSP delivery costs", fullDescription: "Under 15% discount, thin margins after MSP delivery costs. Hard to justify." },
        { score: 3, shortLabel: "15-25% margins, workable but not compelling for aggressive recruitment", fullDescription: "15-25% margins, workable but not compelling for aggressive recruitment. MSPs can make some money." },
        { score: 4, shortLabel: "25-35% margins with volume tiers, MSP can build a profitable practice", fullDescription: "25-35% margins with volume tiers, MSP can build a profitable practice. Solid economics." },
        { score: 5, shortLabel: "35%+ margins with transparent economics, validated with real MSP partners", fullDescription: "35%+ margins with transparent economics, validated with real MSP partners. MSPs actively recruit around your product." },
      ],
    },
    {
      name: "Billing & Invoicing Flexibility",
      context: "Aggregate billing, monthly true-up, and flexible payment terms are a necessity.",
      questionKey: "q3",
      options: [
        { score: 1, shortLabel: "Per-client billing only, no aggregate invoicing, manual adds/changes", fullDescription: "Per-client billing only, no aggregate invoicing, manual adds/changes. Operational nightmare for MSPs." },
        { score: 2, shortLabel: "Aggregate billing technically possible but clunky, mid-month changes need support tickets", fullDescription: "Aggregate billing technically possible but clunky, mid-month changes need support tickets. Painful to use." },
        { score: 3, shortLabel: "Aggregate billing available, monthly invoicing works, proration/true-up require manual steps", fullDescription: "Aggregate billing available, monthly invoicing works, proration/true-up require manual steps. Gets the job done." },
        { score: 4, shortLabel: "Clean aggregate billing with automated proration and monthly true-up, single invoice with per-client line items", fullDescription: "Clean aggregate billing with automated proration and monthly true-up, single invoice with per-client line items. MSP-friendly." },
        { score: 5, shortLabel: "Fully flexible: aggregate or per-client, monthly true-up, automated proration, API-accessible billing for MSP accounting integration", fullDescription: "Fully flexible: aggregate or per-client, monthly true-up, automated proration, API-accessible billing for MSP accounting integration. Best-in-class." },
      ],
    },
    {
      name: "Recurring Revenue Alignment",
      context: "MSPs build monthly recurring revenue businesses. Your pricing should make it easy to wrap your product into a predictable monthly managed service.",
      questionKey: "q4",
      options: [
        { score: 1, shortLabel: "One-time or annual pricing, doesn't map to monthly recurring", fullDescription: "One-time or annual pricing, doesn't map to monthly recurring. MSPs cannot bundle into MRR." },
        { score: 2, shortLabel: "Monthly billing exists but structured as monthly payment on annual contract, not true month-to-month", fullDescription: "Monthly billing exists but structured as monthly payment on annual contract, not true month-to-month. Not true MRR." },
        { score: 3, shortLabel: "True monthly recurring pricing, MSPs can mark up and resell, limited service layering opportunity", fullDescription: "True monthly recurring pricing, MSPs can mark up and resell, limited service layering opportunity. Fits MSP model." },
        { score: 4, shortLabel: "Monthly recurring designed for MSP bundling, MSPs can wrap into managed service and add value on top", fullDescription: "Monthly recurring designed for MSP bundling, MSPs can wrap into managed service and add value on top. Built for MSPs." },
        { score: 5, shortLabel: "Strong MSP recurring revenue with expansion paths: upsell tiers, add modules, layer services. Product is a platform for the MSP's practice.", fullDescription: "Strong MSP recurring revenue with expansion paths: upsell tiers, add modules, layer services. Product is a platform for the MSP's practice. Revenue grows with the MSP." },
      ],
    },
    {
      name: "MSP Cost to Deliver",
      context: "The easier it is to deliver your product, the easier it is to adopt by the MSP and the faster success you'll see.",
      questionKey: "q5",
      options: [
        { score: 1, shortLabel: "High labor per client, significant ongoing management and vendor-assisted support", fullDescription: "High labor per client, significant ongoing management and vendor-assisted support. Economics collapse at scale." },
        { score: 2, shortLabel: "Moderate labor, dedicated time per client, not scalable past 20-30 clients", fullDescription: "Moderate labor, dedicated time per client, not scalable past 20-30 clients. Ceiling on MSP growth." },
        { score: 3, shortLabel: "Manageable effort, no dedicated per-client resources needed, some manual intervention", fullDescription: "Manageable effort, no dedicated per-client resources needed, some manual intervention. Scales with workarounds." },
        { score: 4, shortLabel: "Low effort, largely self-managing with automation/alerting, scales to 50+ clients without adding headcount", fullDescription: "Low effort, largely self-managing with automation/alerting, scales to 50+ clients without adding headcount. Strong unit economics." },
        { score: 5, shortLabel: "Minimal effort, product runs autonomously, MSP role is oversight and client communication, scales to 100+ clients per technician", fullDescription: "Minimal effort, product runs autonomously, MSP role is oversight and client communication, scales to 100+ clients per technician. Built for MSP scale." },
      ],
    },
  ],
};
