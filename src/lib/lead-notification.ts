import sgMail from "@sendgrid/mail";

const FROM = "Jon Purcell <jon@untappedchannelstrategy.com>";
const ADMIN_EMAIL = "jon@untappedchannelstrategy.com";

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://assessment.untappedchannelstrategy.com";
}

export interface LeadNotificationData {
  assessmentId: string;
  fullName: string;
  email: string;
  companyName: string;
  title?: string;
}

export async function sendLeadNotificationEmail(lead: LeadNotificationData): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn("[lead-notification] SENDGRID_API_KEY not set, skipping notification");
    return;
  }
  sgMail.setApiKey(apiKey);

  const base = getBaseUrl();
  const adminUrl = `${base}/admin`;
  const resultsUrl = `${base}/assessment/results/${lead.assessmentId}`;

  const subject = `New MSP Assessment Lead: ${lead.fullName} at ${lead.companyName}`;

  const capturedAt = new Date().toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #fff; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; margin: 40px auto; padding: 0 20px;">
    <tr><td>
      <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin: 0 0 16px;">MSP Channel Assessment</p>
      <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 24px; color: #111;">New Lead: ${lead.fullName}</h1>

      <table cellpadding="0" cellspacing="0" style="width: 100%; border-top: 1px solid #e5e5e5;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-size: 13px; color: #888; width: 90px;">Name</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-size: 13px; font-weight: 500; color: #111;">${lead.fullName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-size: 13px; color: #888;">Company</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-size: 13px; font-weight: 500; color: #111;">${lead.companyName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-size: 13px; color: #888;">Title</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-size: 13px; font-weight: 500; color: #111;">${lead.title || "—"}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-size: 13px; color: #888;">Email</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-size: 13px; font-weight: 500; color: #111;"><a href="mailto:${lead.email}" style="color: #111;">${lead.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 12px 0; font-size: 13px; color: #888;">Captured</td>
          <td style="padding: 12px 0; font-size: 13px; color: #555;">${capturedAt}</td>
        </tr>
      </table>

      <table cellpadding="0" cellspacing="0" style="margin-top: 28px;">
        <tr>
          <td style="padding-right: 12px;">
            <a href="${adminUrl}" style="display: inline-block; background: #111; color: #fff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 18px; border-radius: 6px;">View in Admin Dashboard</a>
          </td>
          <td>
            <a href="${resultsUrl}" style="display: inline-block; background: #fff; color: #111; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 18px; border-radius: 6px; border: 1px solid #ddd;">View Results Page</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `New MSP Assessment Lead: ${lead.fullName} at ${lead.companyName}`,
    ``,
    `Name:     ${lead.fullName}`,
    `Company:  ${lead.companyName}`,
    `Title:    ${lead.title || "N/A"}`,
    `Email:    ${lead.email}`,
    `Captured: ${capturedAt}`,
    ``,
    `View in Admin Dashboard: ${adminUrl}`,
    `View Results Page: ${resultsUrl}`,
  ].join("\n");

  try {
    await sgMail.send({ to: ADMIN_EMAIL, from: FROM, subject, text, html });
    console.log("[lead-notification] Admin notification sent");
  } catch (err) {
    // Non-blocking — don't throw, just log
    console.error("[lead-notification] Failed:", err);
  }
}
