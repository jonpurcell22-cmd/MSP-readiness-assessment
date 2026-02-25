/**
 * Send assessment emails via SendGrid: user (with PDF) and admin (with contact/scores + PDF).
 * Matches EMAIL TEMPLATES in the spec.
 */

import sgMail from "@sendgrid/mail";
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
const REPLY_TO = "jon@untappedchannelstrategy.com";
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
  /** Optional; when missing (e.g. PDF generation failed), emails are sent without attachment */
  pdfBuffer?: Buffer | null;
  bookingUrl?: string;
}

/**
 * Send both user and admin emails with the PDF attached.
 * Requires SENDGRID_API_KEY. If missing or send fails, throws.
 */
export async function sendAssessmentEmails({
  payload,
  narrative,
  pdfBuffer,
  bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || process.env.BOOKING_URL || "https://calendly.com/jon-untappedchannelstrategy",
}: SendAssessmentEmailsParams): Promise<{ userId?: string; adminId?: string }> {
  console.log("[send-emails] Starting... to:", payload.contact.email);
  const hasPdf = pdfBuffer && pdfBuffer.length > 0;
  if (!hasPdf) {
    console.warn("[send-emails] No PDF buffer; sending emails without attachment.");
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not set. Add it to .env.local.");
  }

  sgMail.setApiKey(apiKey);

  const tier = payload.computed.readinessTier as ReadinessTier;
  const tierLabel = TIER_LABELS[tier];
  const tierSummary = TIER_INTERPRETATIONS[tier];
  const subjectUser = `Your MSP Channel Readiness Assessment Results: ${payload.computed.overallScore}/100 - ${tierLabel}`;
  const subjectAdmin = `New Assessment: ${payload.contact.companyName} - ${payload.computed.overallScore}/100 (${tierLabel})`;
  const pdfFilename = `MSP-Readiness-${payload.contact.companyName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

  const attachment = hasPdf
    ? [
        {
          content: pdfBuffer.toString("base64"),
          filename: pdfFilename,
          type: "application/pdf" as const,
          disposition: "attachment" as const,
        },
      ]
    : undefined;

  const userMsg = {
    to: payload.contact.email,
    from: FROM,
    replyTo: REPLY_TO,
    subject: subjectUser,
    text: buildUserEmailBody(payload, tierLabel, tierSummary, bookingUrl),
    ...(attachment && { attachments: attachment }),
  };

  const adminMsg = {
    to: ADMIN_EMAIL,
    from: FROM,
    replyTo: REPLY_TO,
    subject: subjectAdmin,
    text: buildAdminEmailBody(payload, new Date().toISOString()),
    ...(attachment && { attachments: attachment }),
  };

  try {
    const [userResult, adminResult] = await Promise.all([
      sgMail.send(userMsg),
      sgMail.send(adminMsg),
    ]);
    const [userResponse, adminResponse] = [userResult[0], adminResult[0]];

    const userStatus = userResponse?.statusCode ?? "?";
    const adminStatus = adminResponse?.statusCode ?? "?";
    console.log("[send-emails] SendGrid user status:", userStatus, "admin status:", adminStatus);

    if (userStatus !== 202 || adminStatus !== 202) {
      console.error("[send-emails] Unexpected status. User:", userResponse, "Admin:", adminResponse);
      throw new Error(`SendGrid returned user=${userStatus} admin=${adminStatus}`);
    }

    const userId = (userResponse?.headers as Record<string, string>)?.["x-message-id"];
    const adminId = (adminResponse?.headers as Record<string, string>)?.["x-message-id"];
    return { userId, adminId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[send-emails] Send failed:", message);
    if (err && typeof err === "object" && "response" in err) {
      const res = (err as { response?: { body?: unknown; statusCode?: number } }).response;
      if (res) console.error("[send-emails] SendGrid response:", res.statusCode, res.body);
    }
    throw new Error(`Email send failed: ${message}`);
  }
}
