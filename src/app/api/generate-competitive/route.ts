import { NextResponse } from "next/server";
import type { CompetitiveLandscapeOutput } from "@/types/competitive";
import { isCompetitiveLandscapeOutput } from "@/types/competitive";
import { sectionCompetitiveConfig } from "@/data/section-competitive";

const COMPETITIVE_TIMEOUT_MS = 90_000; // Web search can take longer

const SYSTEM_PROMPT = `You are a senior MSP channel strategy consultant researching the competitive MSP landscape for a B2B software vendor. Your job is to identify their direct competitors and assess each competitor's MSP channel presence.

Research approach:
1. First, visit the company's website to understand exactly what their product does and which market category they compete in.
2. Search for '[product category] competitors' and '[company name] competitors' and '[product category] Gartner' and '[product category] G2 competitors' to identify the top 4-6 direct competitors.
3. For each competitor found, search for:
   - '[competitor] MSP partner program'
   - '[competitor] Pax8' 
   - '[competitor] managed service provider'
   - '[competitor] ConnectWise marketplace OR Kaseya marketplace OR N-able integration'
4. Check for presence on key MSP distributors: Pax8, Ingram Micro Cloud, TD SYNNEX StreamOne, ConnectWise Marketplace, Sherweb, Datto Commerce

Rules:
- Only include competitors you can verify exist through search results. Never fabricate companies.
- If you cannot find MSP program information for a competitor, report 'No public MSP program found' rather than guessing.
- Focus on competitors that serve the same buyer persona, not adjacent categories.
- Be specific about what you found: link to partner program pages, mention specific distributor listings, cite specific evidence.
- Do not include the user's own company as a competitor.

Respond in this exact JSON structure:
{
  "competitors": [
    {
      "name": "Company Name",
      "website": "https://...",
      "mspProgramStatus": "Established MSP Program" | "General Partner Program" | "Early/Limited MSP Program" | "No Public MSP Program Found",
      "distributorPresence": ["Pax8", "Ingram Micro Cloud"] or [],
      "programEvidence": "One sentence describing what you found. E.g., 'Dedicated MSP partner page with tiered program, listed on Pax8 marketplace since 2023.'",
      "mspRelevantWeakness": "One sentence on a potential weakness MSPs might care about based on what you found. E.g., 'No multi-tenant console mentioned in partner materials.' or 'Unknown' if not enough info."
    }
  ],
  "landscapeSummary": "3-4 sentences contextualizing the competitive MSP landscape for this specific category. How crowded is the MSP channel here? Is there an opening or are incumbents entrenched? What does the vendor's window of opportunity look like based on the competitor analysis? Reference the user's self-reported competitive scores to either validate or challenge their perception.",
  "distributorOpportunity": "2-3 sentences on where distributor gaps exist based on what competitors are and aren't listed on. Specific recommendation on which distributor(s) to prioritize.",
  "strategicImplication": "2-3 sentences of blunt strategic advice. Given this competitive landscape, what should the vendor do differently in their MSP program to win? What positioning would work?"
}

Return ONLY valid JSON. No markdown, no backticks, no preamble.`;

export interface GenerateCompetitiveBody {
  companyName: string;
  companyWebsite?: string;
  productCategory: string;
  /** Section 6 total score (Competitive & Distribution Landscape) */
  section6Total: number;
  /** Section 6 individual question scores for context */
  section6Scores?: { q1: number; q2: number; q3: number; q4: number; q5: number };
}

function buildUserPrompt(body: GenerateCompetitiveBody): string {
  const lines: string[] = [
    `Company: ${body.companyName}`,
    `Website: ${body.companyWebsite || "Not provided"}`,
    `Product Category: ${body.productCategory}`,
    `Section 6 (Competitive & Distribution Landscape) total: ${body.section6Total}/25`,
  ];
  if (body.section6Scores) {
    const labels = sectionCompetitiveConfig.questions.map((q) => q.name);
    const s = body.section6Scores;
    lines.push(
      "Self-reported scores (1-5 per question):",
      `- ${labels[0]}: ${s.q1}`,
      `- ${labels[1]}: ${s.q2}`,
      `- ${labels[2]}: ${s.q3}`,
      `- ${labels[3]}: ${s.q4}`,
      `- ${labels[4]}: ${s.q5}`
    );
  }
  return `Research the competitive MSP landscape for this vendor. Use web search to find their direct competitors and each competitor's MSP program status and distributor presence.\n\n${lines.join("\n")}\n\nReturn ONLY valid JSON matching the structure in the system prompt.`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateCompetitiveBody;
    if (!body.companyName?.trim() || !body.productCategory?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: companyName, productCategory" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not set" },
        { status: 500 }
      );
    }

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({ apiKey });
    const userPrompt = buildUserPrompt(body);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), COMPETITIVE_TIMEOUT_MS);

    const response = await Promise.race([
      anthropic.messages.create(
        {
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
          tools: [{ type: "web_search_20250305" as const, name: "web_search" }],
        },
        { signal: controller.signal, timeout: COMPETITIVE_TIMEOUT_MS }
      ),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Competitive research timed out")), COMPETITIVE_TIMEOUT_MS)
      ),
    ]);

    clearTimeout(timeoutId);

    // With web search, content may include tool_use blocks; use the last text block (final answer)
    const textBlock = [...(response.content || [])].reverse().find((b) => b.type === "text");
    const text = textBlock && "text" in textBlock ? textBlock.text : "";
    if (!text.trim()) {
      return NextResponse.json(
        { error: "Empty response from model" },
        { status: 500 }
      );
    }

    // Strip markdown code fence if present
    let raw = text.trim();
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) raw = jsonMatch[1].trim();

    const parsed = JSON.parse(raw) as CompetitiveLandscapeOutput;
    if (!isCompetitiveLandscapeOutput(parsed)) {
      return NextResponse.json(
        { error: "Invalid competitive landscape structure" },
        { status: 500 }
      );
    }

    return NextResponse.json(normalizeCompetitiveOutput(parsed));
  } catch (e) {
    console.error("Generate competitive API error:", e);
    // Fallback: try without web search so the section still appears with a basic summary
    try {
      const fallback = await generateCompetitiveFallback(body);
      return NextResponse.json(fallback);
    } catch (fallbackErr) {
      console.error("Competitive fallback also failed:", fallbackErr);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Competitive research failed" },
        { status: 500 }
      );
    }
  }
}

/** Generate a basic competitive summary without web search (no live research). */
async function generateCompetitiveFallback(
  body: GenerateCompetitiveBody
): Promise<CompetitiveLandscapeOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const anthropic = new Anthropic({ apiKey });
  const userPrompt = buildUserPrompt(body);
  const FALLBACK_SYSTEM = `${SYSTEM_PROMPT}

NOTE: You do NOT have web search available for this request. Base your response on your training knowledge of typical competitors and MSP channel dynamics in the vendor's product category. Be clear that this is a high-level view, not live research. Use "Based on typical market structure..." or similar framing. Still return valid JSON.`;
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    system: FALLBACK_SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
  });
  const textBlock = [...(response.content || [])].reverse().find((b) => b.type === "text");
  const text = textBlock && "text" in textBlock ? textBlock.text : "";
  if (!text.trim()) throw new Error("Empty fallback response");
  let raw = text.trim();
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) raw = jsonMatch[1].trim();
  const parsed = JSON.parse(raw) as CompetitiveLandscapeOutput;
  if (!isCompetitiveLandscapeOutput(parsed)) throw new Error("Invalid fallback structure");
  return normalizeCompetitiveOutput(parsed);
}

/** Ensure each competitor has required fields and consistent status strings. */
function normalizeCompetitiveOutput(raw: CompetitiveLandscapeOutput): CompetitiveLandscapeOutput {
  const statusOptions = [
    "Established MSP Program",
    "General Partner Program",
    "Early/Limited MSP Program",
    "No Public MSP Program Found",
  ] as const;
  const competitors = (raw.competitors || []).map((c) => {
    const status =
      typeof c.mspProgramStatus === "string" && statusOptions.includes(c.mspProgramStatus as (typeof statusOptions)[number])
        ? (c.mspProgramStatus as (typeof statusOptions)[number])
        : "No Public MSP Program Found";
    return {
      name: typeof c.name === "string" ? c.name : "Unknown",
      website: typeof c.website === "string" ? c.website : "",
      mspProgramStatus: status,
      distributorPresence: Array.isArray(c.distributorPresence) ? c.distributorPresence : [],
      programEvidence: typeof c.programEvidence === "string" ? c.programEvidence : "—",
      mspRelevantWeakness: typeof c.mspRelevantWeakness === "string" ? c.mspRelevantWeakness : "Unknown",
    };
  });
  return {
    competitors,
    landscapeSummary: String(raw.landscapeSummary ?? "").trim() || "Competitive landscape summary not available.",
    distributorOpportunity: String(raw.distributorOpportunity ?? "").trim() || "Distributor opportunity analysis not available.",
    strategicImplication: String(raw.strategicImplication ?? "").trim() || "Strategic implications not available.",
  };
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST with companyName, productCategory, section6Total, and optional companyWebsite, section6Scores.",
  });
}
