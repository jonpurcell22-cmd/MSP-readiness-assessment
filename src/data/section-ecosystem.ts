import type { AssessmentSectionConfig } from "@/types/assessment";

export const sectionEcosystemConfig: AssessmentSectionConfig = {
  sectionKey: "section4",
  sectionNumber: 4,
  title: "Partner Ecosystem & Recruitment",
  description: "Do you have a defined ICP? Do you know what markets you want to address?",
  questions: [
    {
      name: "Category Demand from MSPs",
      context: "Some categories are already in every MSP's stack. Others are emerging. Where you sit determines how hard recruitment will be.",
      questionKey: "q1",
      options: [
        { score: 1, shortLabel: "MSPs don't deliver managed services in your category, you'd be creating a new market", fullDescription: "MSPs don't deliver managed services in your category, you'd be creating a new market. Hardest recruitment." },
        { score: 2, shortLabel: "A few forward-thinking MSPs exploring your category, not standard MSP stack yet", fullDescription: "A few forward-thinking MSPs exploring your category, not standard MSP stack yet. Early market." },
        { score: 3, shortLabel: "Growing demand, MSPs adding your category but not yet must-have", fullDescription: "Growing demand, MSPs adding your category but not yet must-have. Momentum building." },
        { score: 4, shortLabel: "Strong demand, most mid-size and large MSPs actively looking or would consider switching", fullDescription: "Strong demand, most mid-size and large MSPs actively looking or would consider switching. Active market." },
        { score: 5, shortLabel: "Core MSP stack category, every MSP needs a solution here, high switching intent", fullDescription: "Core MSP stack category, every MSP needs a solution here, high switching intent. Must-have category." },
      ],
    },
    {
      name: "Distributor Relationship Status",
      context: "Distribution can be a growth multiplier, but speed, structure and being prepared are necessary for success.",
      questionKey: "q2",
      options: [
        { score: 1, shortLabel: "No distributor relationships, haven't explored it", fullDescription: "No distributor relationships, haven't explored it. Off the highway." },
        { score: 2, shortLabel: "Aware of MSP distributors but no conversations, don't meet listing requirements", fullDescription: "Aware of MSP distributors but no conversations, don't meet listing requirements. Not ready." },
        { score: 3, shortLabel: "In discussions with one or more distributors, application in progress", fullDescription: "In discussions with one or more distributors, application in progress. On the path." },
        { score: 4, shortLabel: "Listed with one MSP distributor, some MSPs transacting through marketplace", fullDescription: "Listed with one MSP distributor, some MSPs transacting through marketplace. One lane open." },
        { score: 5, shortLabel: "Listed with 2+ distributors, active transaction volume, distributor team promotes your product", fullDescription: "Listed with 2+ distributors, active transaction volume, distributor team promotes your product. Full distribution." },
      ],
    },
    {
      name: "MSP Community Visibility",
      context: "Do you have a presence in the MSP community yet? If not, there will be some legwork to do.",
      questionKey: "q3",
      options: [
        { score: 1, shortLabel: "No presence in MSP communities, never attended or exhibited at MSP event", fullDescription: "No presence in MSP communities, never attended or exhibited at MSP event. Unknown." },
        { score: 2, shortLabel: "Aware of MSP communities but haven't participated, no brand recognition", fullDescription: "Aware of MSP communities but haven't participated, no brand recognition. Invisible." },
        { score: 3, shortLabel: "Some presence: 1-2 events, a few MSP-focused blog posts or webinars", fullDescription: "Some presence: 1-2 events, a few MSP-focused blog posts or webinars. Getting noticed." },
        { score: 4, shortLabel: "Active in MSP communities, regular event presence and content, some influencers know your name", fullDescription: "Active in MSP communities, regular event presence and content, some influencers know your name. Recognized." },
        { score: 5, shortLabel: "Well-known: recognized at IT Nation, Pax8 Beyond, DattoCon, MSP influencers advocate for your product", fullDescription: "Well-known: recognized at IT Nation, Pax8 Beyond, DattoCon, MSP influencers advocate for your product. Category presence." },
      ],
    },
    {
      name: "Existing MSP Relationships",
      context: "Many vendors already have MSPs using their product as direct customers without realizing it. Those hidden relationships are your fastest path to an initial partner base.",
      questionKey: "q4",
      options: [
        { score: 1, shortLabel: "No known MSP customers or relationships, no inbound partner interest", fullDescription: "No known MSP customers or relationships, no inbound partner interest. Greenfield only." },
        { score: 2, shortLabel: "Suspect some customers may be MSPs but haven't identified them", fullDescription: "Suspect some customers may be MSPs but haven't identified them. Hidden base." },
        { score: 3, shortLabel: "A handful of MSPs use product as direct customers, one or two asked about partner pricing", fullDescription: "A handful of MSPs use product as direct customers, one or two asked about partner pricing. Early signals." },
        { score: 4, shortLabel: "10-20+ MSPs actively using product, several requested formal partner relationship", fullDescription: "10-20+ MSPs actively using product, several requested formal partner relationship. Ready to formalize." },
        { score: 5, shortLabel: "Significant MSP customer base actively requesting partner program, better pricing, and multi-tenant capabilities", fullDescription: "Significant MSP customer base actively requesting partner program, better pricing, and multi-tenant capabilities. Demand is there." },
      ],
    },
    {
      name: "Competitive Recruitment Advantage",
      context: "MSPs already have a vendor in your category. To win them, you need a clear use case and differentiator.",
      questionKey: "q5",
      options: [
        { score: 1, shortLabel: "No clear differentiation for MSPs vs. incumbent, we're a good product isn't enough", fullDescription: "No clear differentiation for MSPs vs. incumbent, we're a good product isn't enough. No switch story." },
        { score: 2, shortLabel: "Minor product differences, high MSP switching cost, unclear benefit", fullDescription: "Minor product differences, high MSP switching cost, unclear benefit. Hard to justify switch." },
        { score: 3, shortLabel: "Some differentiation (better UX, unique feature), haven't tested why switch message with MSPs", fullDescription: "Some differentiation (better UX, unique feature), haven't tested why switch message with MSPs. Unvalidated." },
        { score: 4, shortLabel: "Clear differentiation that matters: better margins, multi-tenancy, less conflict. Validated with a few MSPs.", fullDescription: "Clear differentiation that matters: better margins, multi-tenancy, less conflict. Validated with a few MSPs. Compelling story." },
        { score: 5, shortLabel: "Compelling why switch backed by real MSP feedback, MSPs frustrated with incumbent and actively looking", fullDescription: "Compelling why switch backed by real MSP feedback, MSPs frustrated with incumbent and actively looking. Market ready to move." },
      ],
    },
  ],
};
