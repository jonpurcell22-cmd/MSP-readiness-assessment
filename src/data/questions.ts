export interface AnswerOption {
  text: string
  points: number
}

export interface Question {
  id: keyof QuestionAnswers
  dimension: "arch" | "gtm" | "px"
  weight: "standard" | "heavy"
  text: string
  options: [AnswerOption, AnswerOption, AnswerOption]
}

export interface QuestionAnswers {
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
}

// Point values by weight
// Standard: 3 / 9 / 15
// Heavy:    5 / 15 / 25

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    dimension: "arch",
    weight: "standard",
    text: "How do MSPs currently transact with your product?",
    options: [
      {
        text: "We require annual contracts per end customer -- MSPs have to commit on their clients' behalf before they've proven the service",
        points: 3,
      },
      {
        text: "MSPs can resell monthly, but the margin structure wasn't designed for them -- it works, but building a practice around it is difficult",
        points: 9,
      },
      {
        text: "We have MSP-specific pricing with per-seat or consumption-based billing and margins above 25% -- partners can actually model their business around it",
        points: 15,
      },
    ],
  },
  {
    id: "q2",
    dimension: "arch",
    weight: "standard",
    text: "When an MSP wins a new client, how do they deploy your product?",
    options: [
      {
        text: "They submit a ticket or contact our team -- we're involved in every new client deployment",
        points: 3,
      },
      {
        text: "There's a self-service path but most MSPs still lean on us for the first several deployments",
        points: 9,
      },
      {
        text: "MSPs spin up new client environments entirely on their own -- our product is designed for that workflow",
        points: 15,
      },
    ],
  },
  {
    id: "q3",
    dimension: "gtm",
    weight: "heavy",
    text: "When an MSP brings you a deal, what happens to your direct sales team?",
    options: [
      {
        text: "Direct reps aren't compensated on MSP deals -- so they route around partners or simply ignore them",
        points: 5,
      },
      {
        text: "Reps get partial credit informally -- outcomes depend on which rep the partner is working with",
        points: 15,
      },
      {
        text: "MSP-sourced deals are tracked through formal deal registration, reps are fully compensated, and the rules are documented and enforced",
        points: 25,
      },
    ],
  },
  {
    id: "q4",
    dimension: "px",
    weight: "standard",
    text: "What does a new MSP partner actually receive when they sign up?",
    options: [
      {
        text: "An NDA, a price list, and access to the same documentation our direct customers get",
        points: 3,
      },
      {
        text: "Some onboarding materials and a partner portal -- most partners figure out the rest on their own",
        points: 9,
      },
      {
        text: "A structured onboarding track built specifically for MSPs -- technical certification, sales playbooks, and a defined path to their first client deployment",
        points: 15,
      },
    ],
  },
  {
    id: "q5",
    dimension: "gtm",
    weight: "heavy",
    text: "Who owns the MSP partner relationship at your company?",
    options: [
      {
        text: "No one specifically -- it falls to whoever has bandwidth when a partner reaches out",
        points: 5,
      },
      {
        text: "An AE manages it alongside their direct quota -- partners are part of their territory, not a dedicated focus",
        points: 15,
      },
      {
        text: "A dedicated channel resource owns MSP relationships full-time -- that's their entire job",
        points: 25,
      },
    ],
  },
  {
    id: "q6",
    dimension: "gtm",
    weight: "heavy",
    text: "What does your leadership team expect from an MSP program in year one?",
    options: [
      {
        text: "Meaningful revenue contribution within the first two quarters",
        points: 5,
      },
      {
        text: "Some revenue in year one, with moderate expectations about timing",
        points: 15,
      },
      {
        text: "Leadership understands MSP programs take 12-18 months to produce material revenue -- the program has dedicated resources and defined milestones, not a quarterly P&L test",
        points: 25,
      },
    ],
  },
  {
    id: "q7",
    dimension: "px",
    weight: "standard",
    text: "How visible is your product in the MSP community today?",
    options: [
      {
        text: "MSPs don't know we exist -- we've never invested in community presence or distributor relationships",
        points: 3,
      },
      {
        text: "A handful of MSPs use us, but we're not known in the community and we're not in distributor catalogs",
        points: 9,
      },
      {
        text: "We have active presence in MSP communities, we're listed with at least one major distributor, and MSPs are actively asking about us",
        points: 15,
      },
    ],
  },
]

// Scoring helpers

export function calculateRawScore(answers: Record<string, number>): number {
  return Object.values(answers).reduce((sum, pts) => sum + pts, 0)
}

export function rescaleScore(raw: number): number {
  const MIN_RAW = 27
  const MAX_RAW = 135
  return Math.round(((raw - MIN_RAW) / (MAX_RAW - MIN_RAW)) * 100)
}

export function getMaturityLabel(index: number): string {
  if (index <= 39) return "Foundation-Building"
  if (index <= 54) return "Emerging"
  if (index <= 69) return "Developing"
  if (index <= 84) return "Scaling"
  return "Optimized"
}

export function calculateDimensionScore(
  answers: Record<string, number>,
  dimension: "arch" | "gtm" | "px"
): number {
  const dimQuestions = QUESTIONS.filter((q) => q.dimension === dimension)
  const raw = dimQuestions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0)
  const maxRaw = dimQuestions.reduce(
    (sum, q) => sum + q.options[q.options.length - 1].points,
    0
  )
  return Math.round((raw / maxRaw) * 100)
}

export interface ServiceRecommendation {
  name: string
  rationale: string
}

export function recommendService(
  answers: Record<string, number>,
  scores: { overall: number; arch: number; gtm: number; px: number }
): ServiceRecommendation {
  const { overall, arch, gtm, px } = scores
  const q1 = answers.q1 ?? 0
  const q3 = answers.q3 ?? 0
  const q7 = answers.q7 ?? 0

  if (overall <= 39) {
    return {
      name: "Strategic Advisory",
      rationale: "Your program needs foundational work before a build engagement will produce results. Strategic Advisory gives you expert guidance to close the right gaps first.",
    }
  }

  if (q1 === 3 && arch <= gtm && arch <= px) {
    return {
      name: "MSP Pricing & Packaging",
      rationale: "Your pricing model is the primary barrier. MSPs cannot build a practice around economics that were not designed for them. Fix the math before anything else.",
    }
  }

  if (overall >= 85) {
    return {
      name: "Strategic Advisory",
      rationale: "Your program is operating at a high level. Strategic Advisory keeps an expert in your corner as you scale without the overhead of a full fractional engagement.",
    }
  }

  if (q3 === 5) {
    return {
      name: "Channel Conflict Resolution",
      rationale: "Your direct sales team has no reason to support the channel and every reason to undermine it. Until compensation and deal registration are aligned, no partner program will hold.",
    }
  }

  if (q7 === 3 && overall >= 55) {
    return {
      name: "Distributor Readiness",
      rationale: "Your product and org are ready, but you have no distribution footprint. Getting listed with Pax8, Ingram Cloud, or TD SYNNEX is the fastest path to the partner base you need.",
    }
  }

  if (overall >= 70) {
    return {
      name: "MSP Program Audit & Fix",
      rationale: "You have a program running but specific gaps are limiting performance. An audit identifies exactly what is broken and rebuilds the components that are holding you back.",
    }
  }

  return {
    name: "Fractional MSP Channel Leader",
    rationale: "You have the foundation to build a real MSP program. A fractional channel leader designs, builds, and launches it without the cost or timeline of a full-time hire.",
  }
}
