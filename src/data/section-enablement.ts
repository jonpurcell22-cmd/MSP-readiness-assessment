import type { AssessmentSectionConfig } from "@/types/assessment";

export const sectionEnablementConfig: AssessmentSectionConfig = {
  sectionKey: "section5",
  sectionNumber: 5,
  title: "Enablement & Partner Experience",
  description: "MSPs need clear, consistent enablement with a predictable experience.",
  questions: [
    {
      name: "Partner Onboarding Experience",
      context: "If a new partner doesn't deploy a client within 30 days, the probability of them ever activating drops to under 20%.",
      questionKey: "q1",
      options: [
        { score: 1, shortLabel: "No onboarding process, partners get a login and are on their own", fullDescription: "No onboarding process, partners get a login and are on their own. Sink or swim." },
        { score: 2, shortLabel: "Basic welcome email and documentation, no structured path or live training", fullDescription: "Basic welcome email and documentation, no structured path or live training. Minimal support." },
        { score: 3, shortLabel: "Onboarding with some training (videos, docs), not MSP-specific, doesn't target first client in 30 days", fullDescription: "Onboarding with some training (videos, docs), not MSP-specific, doesn't target first client in 30 days. Generic." },
        { score: 4, shortLabel: "Structured MSP onboarding with live/guided training, clear milestones, path to first client in 30 days", fullDescription: "Structured MSP onboarding with live/guided training, clear milestones, path to first client in 30 days. Built for activation." },
        { score: 5, shortLabel: "White-glove: dedicated onboarding manager, technical and sales training, first-client deployment assistance, 30/60/90-day checkpoints", fullDescription: "White-glove: dedicated onboarding manager, technical and sales training, first-client deployment assistance, 30/60/90-day checkpoints. Best-in-class activation." },
      ],
    },
    {
      name: "MSP Sales Enablement",
      context: "MSPs sell your product to their clients. If you haven't given them the tools, they'll default to selling the product they already know.",
      questionKey: "q2",
      options: [
        { score: 1, shortLabel: "No sales materials designed for MSP partners", fullDescription: "No sales materials designed for MSP partners. MSPs wing it." },
        { score: 2, shortLabel: "Generic sales materials targeting end customers, not MSPs selling to their clients", fullDescription: "Generic sales materials targeting end customers, not MSPs selling to their clients. Wrong audience." },
        { score: 3, shortLabel: "Some MSP-usable materials (datasheets, basic pitch deck), no battlecards or ROI tools", fullDescription: "Some MSP-usable materials (datasheets, basic pitch deck), no battlecards or ROI tools. Partial toolkit." },
        { score: 4, shortLabel: "Solid MSP toolkit: co-branded pitch deck, battlecards, client-facing datasheets, basic ROI tools", fullDescription: "Solid MSP toolkit: co-branded pitch deck, battlecards, client-facing datasheets, basic ROI tools. MSPs can sell." },
        { score: 5, shortLabel: "Comprehensive: pitch decks, battlecards, ROI calculators, email templates, proposal templates, objection handling, MSP-to-client selling playbook", fullDescription: "Comprehensive: pitch decks, battlecards, ROI calculators, email templates, proposal templates, objection handling, MSP-to-client selling playbook. Full sales engine." },
      ],
    },
    {
      name: "Technical Training & Certification",
      context: "MSP technicians need to be self-sufficient. They should become Super-Users of your product.",
      questionKey: "q3",
      options: [
        { score: 1, shortLabel: "No training program, MSPs learn by trial and error", fullDescription: "No training program, MSPs learn by trial and error. High support cost, slow adoption." },
        { score: 2, shortLabel: "Basic product training (videos/docs), not MSP-designed, covers features not practice building", fullDescription: "Basic product training (videos/docs), not MSP-designed, covers features not practice building. Feature training only." },
        { score: 3, shortLabel: "MSP-relevant training covering product and deployment, no certification or practice-building guidance", fullDescription: "MSP-relevant training covering product and deployment, no certification or practice-building guidance. Good start." },
        { score: 4, shortLabel: "Structured certification for MSP technicians covering product, deployment, troubleshooting, basic practice building", fullDescription: "Structured certification for MSP technicians covering product, deployment, troubleshooting, basic practice building. Credible certification." },
        { score: 5, shortLabel: "Comprehensive certification: product mastery, service delivery, client onboarding, practice economics, multiple levels, used as MSP recruiting differentiator", fullDescription: "Comprehensive certification: product mastery, service delivery, client onboarding, practice economics, multiple levels, used as MSP recruiting differentiator. Market differentiator." },
      ],
    },
    {
      name: "Partner Support Experience",
      context: "Are you prepared to build a dedicated Partner support structure?",
      questionKey: "q4",
      options: [
        { score: 1, shortLabel: "Same support queue as end users, no differentiation", fullDescription: "Same support queue as end users, no differentiation. Partners treated like everyone else." },
        { score: 2, shortLabel: "Separate email alias or form, same response times and quality as end users", fullDescription: "Separate email alias or form, same response times and quality as end users. Same SLA, different inbox." },
        { score: 3, shortLabel: "Dedicated partner channel with somewhat faster response, no named partner manager", fullDescription: "Dedicated partner channel with somewhat faster response, no named partner manager. Better but not dedicated." },
        { score: 4, shortLabel: "Priority SLAs, named partner manager or success team, escalation paths for MSP urgency", fullDescription: "Priority SLAs, named partner manager or success team, escalation paths for MSP urgency. Partner-first support." },
        { score: 5, shortLabel: "Best-in-class: dedicated partner success manager, priority SLAs, proactive health checks, dedicated Slack/Teams channel, technical advisory resources", fullDescription: "Best-in-class: dedicated partner success manager, priority SLAs, proactive health checks, dedicated Slack/Teams channel, technical advisory resources. Partners never blocked." },
      ],
    },
    {
      name: "NFR & Demo Environment",
      context: "NFR and demo environments are necessary tools for MSPs to learn and show how your product enhances customer outcomes.",
      questionKey: "q5",
      options: [
        { score: 1, shortLabel: "No NFR licenses or demo environment", fullDescription: "No NFR licenses or demo environment. MSPs sell blind." },
        { score: 2, shortLabel: "NFR on request but limited (short duration or restricted features), no demo environment", fullDescription: "NFR on request but limited (short duration or restricted features), no demo environment. Token gesture." },
        { score: 3, shortLabel: "NFR with reasonable terms, basic demo capability but not a dedicated sandbox", fullDescription: "NFR with reasonable terms, basic demo capability but not a dedicated sandbox. Partial enablement." },
        { score: 4, shortLabel: "Generous NFR (full-featured, ongoing), dedicated demo/sandbox for partner sales", fullDescription: "Generous NFR (full-featured, ongoing), dedicated demo/sandbox for partner sales. MSPs can sell confidently." },
        { score: 5, shortLabel: "Comprehensive: full-featured internal-use licenses, dedicated sandbox with pre-loaded demo data, tools for live demos and POCs", fullDescription: "Comprehensive: full-featured internal-use licenses, dedicated sandbox with pre-loaded demo data, tools for live demos and POCs. Full sales enablement." },
      ],
    },
  ],
};
