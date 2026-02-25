import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { renderAssessmentPDF } from "@/lib/pdf-build";
import type { BuildPDFPayload } from "@/lib/pdf-build";
import { getNarrative } from "@/lib/narrative";
import {
  computeSectionTotals,
  computeOverallScore,
  getReadinessTier,
  detectRedFlags,
} from "@/lib/scoring";
import type { SectionScores } from "@/types/assessment";

/** Random int in [min, max] inclusive. */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random 1–5 for a single question. */
function randScore(): number {
  return randInt(1, 5);
}

function randomSectionScores(): SectionScores {
  return {
    q1: randScore(),
    q2: randScore(),
    q3: randScore(),
    q4: randScore(),
    q5: randScore(),
  };
}

const SAMPLE_COMPANIES = [
  "Acme Security Inc",
  "CloudGuard Solutions",
  "DataVault Partners",
  "Test MSP Readiness Co",
  "Demo Channel Corp",
  "Sample SaaS Company",
];

async function buildRandomPayload(): Promise<BuildPDFPayload> {
  const section7Skipped = Math.random() > 0.5;
  const section1 = randomSectionScores();
  const section2 = randomSectionScores();
  const section3 = randomSectionScores();
  const section4 = randomSectionScores();
  const section5 = randomSectionScores();
  const section6 = randomSectionScores();
  const section7 = section7Skipped ? null : randomSectionScores();

  const sectionTotals = computeSectionTotals({
    section1,
    section2,
    section3,
    section4,
    section5,
    section6,
    section7,
    section7Skipped,
  });
  const overallScore = computeOverallScore(sectionTotals);
  const readinessTier = getReadinessTier(overallScore);
  const redFlags = detectRedFlags({
    section1,
    section2,
    section3,
    section7Skipped,
  });

  const companyName =
    SAMPLE_COMPANIES[randInt(0, SAMPLE_COMPANIES.length - 1)];
  const arr = randInt(200_000, 3_000_000);
  const acv = randInt(5_000, 75_000);
  const customerCount = randInt(30, 400);
  const salesCycleDays = randInt(30, 120);
  const cac = randInt(400, 4_000);

  const narrativePayload = {
    contact: { companyName, productCategory: "Cybersecurity", title: "VP Sales" },
    computed: {
      overallScore,
      readinessTier,
      sectionTotals,
      redFlags,
      section7Skipped,
    },
    section1,
    section2,
    section3,
    section4,
    section5,
    section6,
    section7,
    financials: {
      arr,
      acv,
      customerCount,
      cac,
      salesCycleDays,
      directRevenuePct: 70,
      existingMspRelationships: "None",
    },
  };
  const narrative = await getNarrative(narrativePayload);

  return {
    contact: { companyName },
    financials: {
      arr,
      acv,
      customerCount,
      cac,
      salesCycleDays,
    },
    computed: {
      overallScore,
      readinessTier,
      sectionTotals,
      section7Skipped,
      redFlags,
    },
    narrative,
    section1,
    section2,
    section3,
    section4,
    section5,
    section6,
    section7,
  };
}

export async function GET() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await buildRandomPayload();
    const buffer = await renderAssessmentPDF(payload);
    const filename = `MSP-Readiness-TEST-${payload.contact.companyName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("Test PDF generation error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate test PDF" },
      { status: 500 }
    );
  }
}
