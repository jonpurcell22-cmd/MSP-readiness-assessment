/**
 * Build PDFData for the assessment PDF. Shared by generate-pdf route and submit flow.
 */

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { AssessmentPDFDocument } from "@/lib/pdf-document";
import type { PDFData } from "@/lib/pdf-document";
import { getThreeYearProjection, getCostOfDelay } from "@/lib/pdf-financials";
import type { NarrativeOutput } from "@/lib/narrative";
import type { SectionTotals, ReadinessTier } from "@/types/assessment";
import type { SectionScores } from "@/types/assessment";

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
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || process.env.BOOKING_URL || "";

  return {
    companyName: contact.companyName,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    overallScore: computed.overallScore,
    readinessTier: computed.readinessTier,
    sectionTotals: computed.sectionTotals,
    section7Skipped: computed.section7Skipped,
    sectionScores: [section1, section2, section3, section4, section5, section6, section7],
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
  const pdfData = buildPDFData(payload);
  const doc = React.createElement(AssessmentPDFDocument, { data: pdfData });
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
