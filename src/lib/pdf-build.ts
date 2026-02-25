/**
 * Build PDFData for the assessment PDF. Shared by generate-pdf route and submit flow.
 */

import path from "path";
import React from "react";
import { ensureLogosLoaded, getLogoMain, getLogoSymbol } from "@/lib/pdf/logo-data";
import { renderToBuffer } from "@react-pdf/renderer";
import { AssessmentPDFDocument } from "@/lib/pdf-document";
import type { PDFData } from "@/lib/pdf-document";
import { getThreeYearProjection, getCostOfDelay } from "@/lib/pdf-financials";
import type { NarrativeOutput } from "@/lib/narrative";
import type { SectionTotals, ReadinessTier, SectionScores } from "@/types/assessment";
import { sectionProductConfig } from "@/data/section-product";
import { sectionPricingConfig } from "@/data/section-pricing";
import { sectionOrganizationConfig } from "@/data/section-organization";
import { sectionEcosystemConfig } from "@/data/section-ecosystem";
import { sectionEnablementConfig } from "@/data/section-enablement";
import { sectionCompetitiveConfig } from "@/data/section-competitive";
import { sectionChannelHealthConfig } from "@/data/section-channel-health";

const SECTION_CONFIGS = [
  sectionProductConfig,
  sectionPricingConfig,
  sectionOrganizationConfig,
  sectionEcosystemConfig,
  sectionEnablementConfig,
  sectionCompetitiveConfig,
  sectionChannelHealthConfig,
] as const;

export interface SectionQuestionDetail {
  questionName: string;
  score: number;
  shortLabel: string;
}

function buildSectionQuestionDetails(
  sectionScores: (SectionScores | null)[],
  section7Skipped: boolean
): { sectionNum: number; questions: SectionQuestionDetail[] }[] {
  const out: { sectionNum: number; questions: SectionQuestionDetail[] }[] = [];
  const maxSection = section7Skipped ? 6 : 7;
  for (let i = 0; i < maxSection; i++) {
    const config = SECTION_CONFIGS[i];
    const scores = sectionScores[i];
    if (!config || !scores) {
      out.push({ sectionNum: i + 1, questions: [] });
      continue;
    }
    const questions: SectionQuestionDetail[] = config.questions.map((q, qi) => {
      const key = q.questionKey as keyof SectionScores;
      const score = scores[key] ?? 0;
      const option = q.options.find((o) => o.score === score);
      return {
        questionName: q.name,
        score,
        shortLabel: option?.shortLabel ?? `Score ${score}/5`,
      };
    });
    out.push({ sectionNum: i + 1, questions });
  }
  return out;
}

export interface BuildPDFPayload {
  contact: { companyName: string };
  financials: {
    arr: number | null;
    acv: number | null;
    customerCount: number | null;
    cac: number | null;
    salesCycleDays: number | null;
  };
  computed: {
    overallScore: number;
    readinessTier: ReadinessTier;
    sectionTotals: SectionTotals;
    section7Skipped: boolean;
    redFlags: string[];
  };
  narrative: NarrativeOutput;
  section1: SectionScores | null;
  section2: SectionScores | null;
  section3: SectionScores | null;
  section4: SectionScores | null;
  section5: SectionScores | null;
  section6: SectionScores | null;
  section7: SectionScores | null;
  /** Optional; overrides env. If not provided, uses BOOKING_URL or NEXT_PUBLIC_BOOKING_URL. */
  bookingUrl?: string;
}

export function buildPDFData(payload: BuildPDFPayload): PDFData {
  const { contact, financials, computed, narrative, section1, section2, section3, section4, section5, section6, section7 } = payload;
  const inputs = {
    arr: financials.arr,
    acv: financials.acv,
    customerCount: financials.customerCount,
    cac: financials.cac,
    salesCycleDays: financials.salesCycleDays,
  };
  const projection = getThreeYearProjection(inputs);
  const costOfDelay = getCostOfDelay(inputs);
  const arr = financials.arr ?? 0;
  const acv = financials.acv ?? 0;
  const defaultCalendlyUrl = "https://calendly.com/jon-untappedchannelstrategy";
  const bookingUrl =
    payload.bookingUrl ??
    process.env.BOOKING_URL ??
    process.env.NEXT_PUBLIC_BOOKING_URL ??
    defaultCalendlyUrl;
  const assetsBasePath = path.join(process.cwd(), "public");

  const sectionScoresList = [section1, section2, section3, section4, section5, section6, section7];
  const sectionQuestionDetails = buildSectionQuestionDetails(
    sectionScoresList,
    computed.section7Skipped
  );

  return {
    companyName: contact.companyName,
    assetsBasePath,
    logoMainPath: getLogoMain(),
    logoSymbolPath: getLogoSymbol(),
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    overallScore: computed.overallScore,
    readinessTier: computed.readinessTier,
    sectionTotals: computed.sectionTotals,
    section7Skipped: computed.section7Skipped,
    sectionScores: sectionScoresList as PDFData["sectionScores"],
    sectionQuestionDetails,
    redFlags: computed.redFlags,
    narrative,
    projection,
    costOfDelay,
    arr,
    acv,
    bookingUrl,
  };
}

/** Render assessment PDF to a Buffer. */
export async function renderAssessmentPDF(payload: BuildPDFPayload): Promise<Buffer> {
  await ensureLogosLoaded();
  const pdfData = buildPDFData(payload);
  const doc = React.createElement(AssessmentPDFDocument, { data: pdfData });
  type DocumentProps = import("@react-pdf/renderer").DocumentProps;
  const buffer = await renderToBuffer(doc as unknown as React.ReactElement<DocumentProps>);
  return Buffer.from(buffer);
}
