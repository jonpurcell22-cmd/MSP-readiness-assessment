const OUTPUT_TIMEOUT_MS = 60_000;

export type AssessmentPath = "scratch" | "not_producing" | "producing_broken";

export interface V2AssessmentData {
  path: AssessmentPath;
  routing_q1: "scratch" | "rebuild";
  routing_q2: "no_revenue" | "has_revenue" | null;
  answers: boolean[] | number[]; // boolean[] for yes/no paths; number[] (selected indices) for pain points
}

export interface V2Narrative {
  v: 2;
  path: AssessmentPath;
  routing_q1: "scratch" | "rebuild";
  routing_q2: "no_revenue" | "has_revenue" | null;
  answers: boolean[] | number[];
  output?: string;
}

export function isV2Assessment(val: unknown): val is V2Narrative {
  if (!val || typeof val !== "object") return false;
  return (val as Record<string, unknown>).v === 2;
}

const SCRATCH_QUESTIONS = [
  "Active interest from customers and/or partners about your product as part of a managed service offering today",
  "Multi-tenant capability — an MSP can manage multiple client environments from a single login in your product today",
  "Pricing and packaging structured in a way that works for how MSPs buy and sell",
  "Compensation plan accounts for revenue generated through indirect or partner-led sales",
  "Named executive sponsor for the MSP program with budget authority",
];

const NOT_PRODUCING_QUESTIONS = [
  "Clear understanding of why the program isn't generating revenue",
  "Multi-tenant capability — an MSP can manage multiple client environments from a single login in your product today",
  "Pricing and packaging structured in a way that works for how MSPs buy and sell",
  "Compensation plan accounts for revenue generated through indirect or partner-led sales",
  "Executive sponsor actively invested in turning this program around",
  "Partners in the program who believe in the opportunity but aren't transacting",
];

const PAIN_POINT_LABELS = [
  "Partners are dissatisfied with the program",
  "Internal channel conflict is undermining partner relationships",
  "Partners are signed but not producing",
  "Leadership confidence in the program is declining",
  "Partner churn is increasing",
  "Revenue is concentrated in too few partners",
  "Partners are asking for product capabilities you don't have",
  "Poor support and enablement are leading to negative partner and customer experiences",
];

const SYSTEM_PROMPTS: Record<AssessmentPath, string> = {
  scratch: `You are an expert MSP channel strategist with 15+ years of experience helping B2B SaaS vendors build MSP programs. A vendor has just completed a readiness assessment. Your job is to write a concise, specific output that makes them feel understood and slightly uncomfortable — in a good way.

Rules:
- No fluff, no encouragement, no praising the yeses
- Write like a peer who has seen this go wrong, not a salesperson
- Maximum 150 words total
- Plain text only — no markdown, no asterisks, no bullet points
- Format: write the label (VERDICT, INSIGHT, RISK) on its own line, then the content paragraph directly after with a blank line between sections`,

  not_producing: `You are an expert MSP channel strategist with 15+ years of experience helping B2B SaaS vendors fix underperforming MSP programs. A vendor has a program that exists but isn't generating meaningful revenue. Your job is to write a concise, specific output that makes them feel diagnosed, not judged.

Rules:
- No fluff, no encouragement
- Write like a peer who has fixed this before, not a consultant pitching
- Maximum 150 words total
- Plain text only — no markdown, no asterisks, no bullet points
- Format: write the label (DIAGNOSIS, INSIGHT, CONSEQUENCE) on its own line, then the content paragraph directly after with a blank line between sections`,

  producing_broken: `You are an expert MSP channel strategist with 15+ years of experience helping B2B SaaS vendors fix MSP programs that are generating revenue but creating serious problems. Your job is to write a concise, specific output that names the root cause behind their pain points and makes them feel like you've seen this exact situation before.

Rules:
- No fluff, no encouragement
- Write like a peer who has walked into this situation before and knows exactly what happened
- Maximum 150 words total
- Plain text only — no markdown, no asterisks, no bullet points
- Format: write the label (ROOT CAUSE, INSIGHT, COST) on its own line, then the content paragraph directly after with a blank line between sections`,
};

function buildScratchPrompt(answers: boolean[]): string {
  const lines = SCRATCH_QUESTIONS.map((q, i) => `${i + 1}. ${q}: ${answers[i] ? "YES" : "NO"}`);
  return `The vendor answered YES or NO to these 5 questions:
${lines.join("\n")}

Write the output in three parts:

VERDICT (one line): A direct, specific statement about their launch readiness based on their answer pattern. Not generic. If they have 3+ nos, they are not ready. If they have 4-5 yeses, they have a foundation.

INSIGHT (2-3 sentences): Reflect their specific answer pattern back at them. Name what their nos mean in practice — not as criticism, but as honest diagnosis. Reference the specific questions they answered no to.

RISK (1 sentence): What happens if they launch anyway, or do nothing. Make it specific to their answer pattern. This should create urgency without being alarmist.

End with exactly: Your competitors are capturing the MSP revenue you're not. Book a call.`;
}

function buildNotProducingPrompt(answers: boolean[]): string {
  const lines = NOT_PRODUCING_QUESTIONS.map((q, i) => `${i + 1}. ${q}: ${answers[i] ? "YES" : "NO"}`);
  return `The vendor answered YES or NO to these 6 questions:
${lines.join("\n")}

Write the output in three parts:

DIAGNOSIS (one line): A direct, specific statement about why the program isn't producing based on their answer pattern. Not generic. Focus on the nos — each no is a likely root cause.

INSIGHT (2-3 sentences): Connect their specific answer pattern to what is most likely killing the program. If they don't know why it isn't working (Q1 = NO), say that directly — it's the most important signal. Reference specific questions they answered no to.

CONSEQUENCE (1 sentence): What happens if the program continues as-is. Make it specific and real — partner attrition, wasted budget, internal credibility loss.

End with exactly: Your competitors are capturing the MSP revenue you're not. Book a call.`;
}

function buildProducingBrokenPrompt(selectedIndices: number[]): string {
  const lines = PAIN_POINT_LABELS.map(
    (label, i) => `- ${label}: ${selectedIndices.includes(i) ? "SELECTED" : "not selected"}`
  );
  return `The vendor selected these pain points (up to 3):
${lines.join("\n")}

Write the output in three parts:

ROOT CAUSE (one line): Based on their combination of pain points, name the most likely underlying cause. Pain points rarely exist in isolation — connect them.

INSIGHT (2-3 sentences): Explain what their specific combination of pain points tells you about where the program broke down. Be specific to their selections. This should feel like you've diagnosed their exact situation, not a generic MSP program problem.

COST (1 sentence): What this combination of pain points is costing them right now — in partner relationships, internal trust, or revenue ceiling. Make it tangible.

End with exactly: Frustrated partners leave. Confused sales teams lose. Both are happening right now. Book a call.`;
}

export async function generateAssessmentOutput(data: V2AssessmentData): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const anthropic = new Anthropic({ apiKey });

  let userPrompt: string;
  if (data.path === "scratch") {
    userPrompt = buildScratchPrompt(data.answers as boolean[]);
  } else if (data.path === "not_producing") {
    userPrompt = buildNotProducingPrompt(data.answers as boolean[]);
  } else {
    userPrompt = buildProducingBrokenPrompt(data.answers as number[]);
  }

  const response = await anthropic.messages.create(
    {
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: SYSTEM_PROMPTS[data.path],
      messages: [{ role: "user", content: userPrompt }],
    },
    { timeout: OUTPUT_TIMEOUT_MS }
  );

  const block = response.content[0];
  const text = block?.type === "text" ? block.text.trim() : "";
  if (!text) throw new Error("Empty response from Claude");
  return text;
}
