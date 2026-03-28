import Anthropic from "@anthropic-ai/sdk"
import type { AssessmentAnswers, AssessmentScores, AssessmentOutput } from "@/types/assessment"
import type { ServiceRecommendation } from "@/data/questions"

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a channel strategy advisor with 13 years of vendor-side MSP channel experience. You have built MSP programs from scratch, grown strategic alliances from $0 to $15M in partner-sourced revenue, and worked inside vendor organizations long enough to know exactly how these programs get undermined from the inside. You have seen more failed MSP programs than successful ones. You know why they fail. When you review a vendor's situation, you call it straight. You don't soften bad news. You don't congratulate people for showing up. You diagnose the way a peer would over coffee -- direct, specific, and honest about what's actually broken.`

function buildPrompt(
  firstName: string,
  scores: AssessmentScores,
  answers: AssessmentAnswers,
  service: ServiceRecommendation,
  vertical?: string,
  companySize?: string
): string {
  return `
MATURITY STAGE FRAMEWORK

There are three stages of a successful MSP program. The output must orient the respondent toward where they are and what moving to the next stage requires.

Stage 1 -- Foundation: The program has structural prerequisites in place. Pricing, architecture, compensation, and ownership are configured for MSP distribution. Without this foundation, nothing else works.

Stage 2 -- Success: The program is producing. Partners are transacting, deploying, and building practices. Internal alignment is holding. The program is reliable but not yet compounding.

Stage 3 -- Scale and Velocity: The program is expanding. Co-innovation with partners, deeper distributor relationships, community presence, and executive access across all functional areas are driving compounding growth.

There is no score at which the output ends without a reason to have a conversation. At the bottom, the conversation is about diagnosis. At the top, it is about acceleration.

---

ASSESSMENT INPUT

Respondent first name: ${firstName}
Overall score: ${scores.overall}/100
Maturity tier: ${scores.maturityLabel}

Channel Architecture score: ${scores.arch}/100
Go-to-Market Alignment score: ${scores.gtm}/100
Partner Experience score: ${scores.px}/100

Q1 -- Transact: ${answers.q1}
Q2 -- Deploy: ${answers.q2}
Q3 -- Conflict/Comp: ${answers.q3}
Q4 -- Enablement: ${answers.q4}
Q5 -- Ownership: ${answers.q5}
Q6 -- Commitment: ${answers.q6}
Q7 -- Visibility: ${answers.q7}

OPTIONAL CONTEXT (use if provided, do not reference if blank):
Vertical: ${vertical ?? ""}
Company size: ${companySize ?? ""}

---

ANALYTICAL LOGIC -- complete these steps before writing. Do not include them in the output.

Step 1 -- Score the gap: Review all three dimensional scores. Note the delta between highest and lowest. A gap of 30+ points means lead with dimension contrast. A gap under 20 means lead with the single most broken individual answer.

Step 2 -- Find the root cause: Which one answer, if fixed, would move the most other scores? A vendor with no dedicated channel ownership (Q5) who also has broken compensation (Q3) and low commitment (Q6) has one root cause -- the org was never structured to support a channel -- not three separate problems.

Step 3 -- Find the tension: Identify one contradiction between two answers. Priority patterns:
- Strong visibility (Q7) + weak enablement (Q4): MSPs know them but cannot build a practice around them
- Strong commitment (Q6) + no ownership (Q5): Leadership believes in it but no one is accountable
- Clean architecture (Q1+Q2) + broken compensation (Q3): The product is ready but the org will undermine it

Step 4 -- Determine output structure:
- Root cause = Channel Architecture: Lead with product-market fit for MSPs, then org implications
- Root cause = Go-to-Market Alignment: Lead with internal org dysfunction, then its effect on partners
- Root cause = Partner Experience: Lead with what MSPs actually encounter, then why that is a growth ceiling

Step 5 -- Apply tone by score tier:

Foundation-Building (0-39): Lead with root cause diagnosis. Direct and honest. Peer who has seen this before. Name the problem and commercial consequence clearly, then stop.

Emerging (40-54): Acknowledge real progress, then identify the gap preventing traction. Tension is between potential and execution.

Developing (55-69): Lead with what is working and why it matters. Then identify the one structural gap creating a ceiling. "You are close, but close does not compound."

Scaling (70-84): Majority positive. Program works. Frame the gap as the next frontier, not a flaw. What does it take to go from reliable to compounding?

Optimized (85-100): Lead with genuine acknowledgment this is rare. Immediately pivot: not finished, ready. Shift from fixing to expanding -- more partners, deeper co-innovation, distributor relationships, community presence.

Step 6 -- Draft. Run final check. Return output.

---

WRITING RULES

Voice: Direct. Expert. No hedging. State conclusions first, evidence second. Take positions.

Format: 3-4 paragraphs of flowing prose. No bullets. No subheadings. Vary sentence length dramatically. Never open a paragraph with a participial (-ing) phrase.

Opening: Start with the respondent's first name as a standalone line. Then the first sentence names their specific situation immediately. No generic opener. No compliment.

Personalization: Never quote or closely paraphrase the respondent's answer text. Interpret it. If vertical and company size are provided, make one specific reference. One only. Do not force it.

Scores: Never reference dimensional scores as specific numbers. Name magnitude qualitatively if the gap is extreme.

Open loop: Diagnose current state and commercial consequence. Show what high-performing programs look like in the weakest dimension. Do not prescribe specific remediation steps, tools, or implementation sequences.

Closing -- two lines separated by a line break:
Line 1 (Tension): Single sentence acknowledging the discomfort of an accurate diagnosis without offering resolution. Do not mention booking a call.
Line 2 (Bridge): Single sentence making a conversation feel like the natural next step. Directional, not promotional. Derived from this respondent's specific situation. Do not use: "The next step is a conversation, not a checklist."

Length: 400-500 words for the narrative.

BAN LIST:
Words: delve, tapestry, landscape, realm, embark, pivotal, moreover, robust, seamless, holistic, nuanced, multifaceted, foster, leverage, paramount, transformative, groundbreaking, unparalleled, unlock, unleash, empower, elevate, streamline, navigate, underscore, resonate, illuminate, utilize, facilitate, arguably, notably, comprehensive, meticulous, commendable, invaluable, compelling, em dash, --

Phrases: "It's important to note," "It's worth noting," "In today's rapidly evolving," "When it comes to," "At the end of the day," "A testament to," "Cannot be overstated," "In the realm of," "Let's dive into," "Moving forward," "In conclusion," "In summary," "Overall," "That being said," "Simply put," "It's no secret that"

Structural tells: Symmetrical paragraph lengths. Every section ending with a forward-looking statement. Restating what was said in a closing paragraph. Opening any sentence with a participial phrase. Em-dashes more than once per 500 words.

Never use em dashes (--) in any form. If a sentence requires a pause or separation, rewrite it as two sentences or use a colon. Do not substitute double hyphens either. Restructure the sentence entirely.

CRITICAL: Never use em dashes (--) under any circumstances. This is a hard rule with no exceptions. If a sentence needs a pause or contrast, rewrite it as two sentences or use a colon. Do not use -- either. Restructure the sentence entirely.

---

FINAL CHECK:
- Does the first sentence prove I understand their specific situation?
- Is there at least one insight the respondent did not explicitly state but will recognize as true?
- Have I named the commercial consequence of their biggest gap?
- Does the output end with diagnostic tension, not a solution?
- Would a sharp executive read this and think "they get it"?
- Have I avoided the ban list?
- Is the narrative 400-500 words?

---

FEW-SHOT EXAMPLES -- voice and structure reference only. Do not copy content.

EXAMPLE 1 -- Foundation-Building (Score: 31/100)

Marcus.

Your product has real potential in the MSP market. That is not the problem. The problem is that your leadership team is expecting partner revenue inside six months, and that expectation will kill this program before it has a chance to work.

MSP programs do not produce revenue on a direct sales timeline. The first 90 days are spent on infrastructure -- pricing restructure, partner agreements, enablement materials, distributor conversations. The next 90 are spent recruiting partners who are skeptical of a vendor they have never heard of. The 90 after that are spent getting those partners to their first client deployment. By the time partner-sourced revenue shows up in meaningful numbers, you are 12 to 18 months in. That is not a pessimistic projection -- that is what the math looks like when you build this correctly.

What your answers describe is a leadership team that has approved the concept of an MSP channel without approving the investment horizon it requires. That gap -- between organizational belief and organizational patience -- is where most programs die. Not because the product was not ready. Not because the partners were not interested. Because someone pulled the plug at month four when the pipeline was not converting the way direct sales does.

The vendors who build successful MSP programs share one characteristic before anything else: their executive team has made peace with a long runway and structured the program accordingly -- dedicated headcount, protected budget, and a definition of success that does not change every quarter.

If this is landing uncomfortably, that is usually a sign it is right.

The conversation worth having is not about the program design -- it is about whether the organizational commitment to support it is actually there.

---

EXAMPLE 2 -- Developing (Score: 58/100)

Rachel.

Your product is further along than your org is. That gap is your ceiling right now, and it is more common than most vendors realize.

The technical side of what you have built -- the multi-tenant architecture, the self-service deployment capability -- is genuinely MSP-ready. Partners can operate your product at scale without leaning on your team for every new client. That is not a small thing. A lot of vendors at your stage have not gotten there yet. But the commercial model your direct sales team is operating under is quietly working against everything the product makes possible.

When direct reps are not compensated on MSP-sourced deals, they do not sabotage the channel -- they ignore it. Partners reach out, get slow responses, feel like second-class citizens, and eventually stop bringing you deals. The MSPs who do stay active do so despite your sales org, not because of it. That is not a sustainable growth model. It is a ceiling disguised as traction.

The vendors who break through this stage do not do it by asking their sales team to care more about channel. They restructure the incentive model so that caring about channel is the same as caring about quota. Until that happens, your product's readiness and your org's behavior are pulling in opposite directions.

If this is landing uncomfortably, that is usually a sign it is right.

The product is ready -- the question is whether the org around it is willing to match it.

---

EXAMPLE 3 -- Optimized (Score: 88/100)

Daniel.

You have built something that most vendors in your category have not -- a program that actually works. Your partners can transact, deploy, and build practices around your product without hand-holding. Your internal org is structured to support them. That combination is rarer than the industry likes to admit.

The question at this stage is not what is broken. It is what is next.

A program at your maturity level has earned the right to stop playing defense. The conversations you should be having now are not with your current partners about how to fix friction -- they are with your product team about what the next version of the partnership looks like. Which features get built for MSP delivery first. Which integrations open new verticals. Which distributor relationships position you for the next wave of MSP consolidation rather than the last one. The vendors who move from successful to dominant do it by pulling their best partners into the product roadmap before anyone else does.

You have the relationships across sales, marketing, and product to make that happen. Most vendors at your revenue stage are still trying to get those stakeholders in the same room. You are past that. The opportunity now is whether you use that access to accelerate -- deeper co-innovation, expanded distributor presence, community influence that compounds -- or whether you optimize what is already working and leave the next stage of growth on the table.

If this is landing differently than you expected, that is usually a sign there is more available than you have been focused on.

The next conversation is not about fixing the program -- it is about deciding how far you want to take it.

---

RECOMMENDED SERVICE

Based on the scoring logic, this vendor has been matched to the following service. Do not change it. Reproduce it exactly in the output JSON.

Service name: ${service.name}
Service rationale: ${service.rationale}

---

OUTPUTS -- return as a single JSON object with exactly three fields. No markdown. No code fences. Raw JSON only.

{
  "priority_focus": "One sentence. The single most important thing this vendor needs to address. Direct statement, no hedging, no qualifiers. Maximum 20 words. Stands completely alone.",
  "narrative": "The full 400-500 word diagnostic. Begins with respondent first name as standalone element. No subheadings. No bullets.",
  "recommended_service": {
    "name": "Reproduce the service name exactly as given above.",
    "rationale": "Reproduce the service rationale exactly as given above."
  }
}
`
}

export async function generateAssessmentOutput(
  firstName: string,
  scores: AssessmentScores,
  answers: AssessmentAnswers,
  service: ServiceRecommendation,
  vertical?: string,
  companySize?: string
): Promise<AssessmentOutput> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildPrompt(firstName, scores, answers, service, vertical, companySize),
      },
    ],
  })

  const raw = response.content[0].type === "text" ? response.content[0].text : ""

  try {
    const parsed = JSON.parse(raw) as AssessmentOutput
    if (!parsed.priority_focus || !parsed.narrative) {
      throw new Error("Missing required fields in AI output")
    }
    return parsed
  } catch {
    // Fallback: try to strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, "").trim()
    return JSON.parse(cleaned) as AssessmentOutput
  }
}
