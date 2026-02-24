/**
 * Send assessment emails via Resend: user (with PDF) and admin (with contact/scores + PDF).
 * Matches EMAIL TEMPLATES in the spec.
 */

import { Resend } from "resend";
import { TIER_LABELS, TIER_INTERPRETATIONS } from "@/lib/scoring";
import type { ReadinessTier } from "@/types/assessment";
import type { NarrativeOutput } from "@/lib/narrative";

/** Minimal payload shape for email templates (matches submit payload). */
export interface AssessmentEmailPayload {
  contact: {
    fullName: string;
    email: string;
    companyName: string;
    title: string;
    companyWebsite?: string;
    phone: string;
    productCategory: string;
  };
  financials: {
    arr: number | null;
    acv: number | null;
    customerCount: number | null;
    directRevenuePct: number | null;
    salesCycleDays: number | null;
    cac: number | null;
    existingMspRelationships: string | null;
  };
  computed: {
    overallScore: number;
    readinessTier: string;
    sectionTotals: {
      section1: number;
      section2: number;
      section3: number;
      section4: number;
      section5: number;
      section6: number;
      section7: number | null;
    };
    redFlags: string[];
    section7Skipped: boolean;
  };
}

const FROM = "Jon Purcell <jon@untappedchannelstrategy.com>";
const ADMIN_EMAIL = "jon@untappedchannelstrategy.com";

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function buildUserEmailBody(
  payload: AssessmentEmailPayload,
  tierLabel: string,
  tierSummary: string,
  bookingUrl: string
): string {
  const firstName = getFirstName(payload.contact.fullName);
  const score = payload.computed.overallScore;
  return `Hi ${firstName},

Thank you for completing the MSP Channel Readiness Assessment. Your full report is attached.

Your Score: ${score}/100 - ${tierLabel}

${tierSummary}

The attached PDF includes your section-by-section breakdown, financial impact projections, and a recommended roadmap based on where you scored.

If you'd like to go deeper, I offer a complimentary 90-minute deep-dive assessment where we walk through each dimension in detail and build a customized action plan. No cost, no obligation.

Book your deep-dive: ${bookingUrl}

Jon Purcell
Untapped Channel Strategy
untappedchannelstrategy.com`;
}

function buildAdminEmailBody(payload: AssessmentEmailPayload, submittedAt: string): string {
  const c = payload.contact;
  const f = payload.financials;
  const t = payload.computed.sectionTotals;
  const s7 = payload.computed.section7Skipped ? "Skipped (Greenfield)" : `${t.section7 ?? 0}/25`;
  const redFlags = payload.computed.redFlags.length > 0 ? payload.computed.redFlags.join("\n- ") : "None";
  return `New MSP Channel Readiness Assessment Completed

Contact Info:
- Name: ${c.fullName}
- Title: ${c.title}
- Company: ${c.companyName}
- Website: ${c.companyWebsite || "N/A"}
- Email: ${c.email}
- Phone: ${c.phone}
- Product Category: ${c.productCategory}

Financial Data:
- ARR: $${f.arr ?? "N/A"}
- ACV: $${f.acv ?? "N/A"}
- Customers: ${f.customerCount ?? "N/A"}
- Direct Revenue %: ${f.directRevenuePct ?? "N/A"}%
- Sales Cycle: ${f.salesCycleDays ?? "N/A"} days
- CAC: $${f.cac ?? "N/A"}
- Existing MSP Relationships: ${f.existingMspRelationships ?? "N/A"}

Scores:
- Overall: ${payload.computed.overallScore}/100 (${TIER_LABELS[payload.computed.readinessTier]})
- Section 1 (Product): ${t.section1}/25
- Section 2 (Pricing): ${t.section2}/25
- Section 3 (Organization): ${t.section3}/25
- Section 4 (Ecosystem): ${t.section4}/25
- Section 5 (Enablement): ${t.section5}/25
- Section 6 (Competitive): ${t.section6}/25
- Section 7 (Channel Health): ${s7}

Red Flags: ${redFlags}

Submitted: ${submittedAt}`;
}

export interface SendAssessmentEmailsParams {
  payload: AssessmentEmailPayload;
  narrative: NarrativeOutput;
  pdfBuffer: Buffer;
  bookingUrl?: string;
}

/**
 * Send both user and admin emails with the PDF attached.
 * Requires RESEND_API_KEY. If missing or send fails, throws.
 */
export async function sendAssessmentEmails({
  payload,
  narrative,
  pdfBuffer,
  bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || process.env.BOOKING_URL || "",
}: SendAssessmentEmailsParams): Promise<{ userId?: string; adminId?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const resend = new Resend(apiKey);
  const tier = payload.computed.readinessTier as ReadinessTier;
  const tierLabel = TIER_LABELS[tier];
  const tierSummary = TIER_INTERPRETATIONS[tier];
  const subjectUser = `Your MSP Channel Readiness Assessment Results: ${payload.computed.overallScore}/100 - ${tierLabel}`;
  const subjectAdmin = `New Assessment: ${payload.contact.companyName} - ${payload.computed.overallScore}/100 (${tierLabel})`;
  const pdfFilename = `MSP-Readiness-${payload.contact.companyName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
  const attachment = { filename: pdfFilename, content: pdfBuffer };
  const submittedAt = new Date().toISOString();

  const [userResult, adminResult] = await Promise.all([
    resend.emails.send({
      from: FROM,
      to: payload.contact.email,
      subject: subjectUser,
      text: buildUserEmailBody(payload, tierLabel, tierSummary, bookingUrl),
      attachments: [attachment],
    }),
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: subjectAdmin,
      text: buildAdminEmailBody(payload, submittedAt),
      attachments: [attachment],
    }),
  ]);

  if (userResult.error) throw new Error(`User email failed: ${userResult.error.message}`);
  if (adminResult.error) throw new Error(`Admin email failed: ${adminResult.error.message}`);

  return {
    userId: userResult.data?.id,
    adminId: adminResult.data?.id,
  };
}
