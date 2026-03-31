import sgMail from "@sendgrid/mail";

const FROM = "Jon Purcell <jon@untappedchannelstrategy.com>";
const ADMIN_EMAIL = "jon@untappedchannelstrategy.com";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  // Never use VERCEL_URL for customer-facing links — it points to a
  // *.vercel.app domain that sits behind Vercel Authentication.
  return "https://assessment.untappedchannelstrategy.com";
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

export interface UserResultsEmailData {
  assessmentId: string;
  firstName: string;
  email: string;
  maturityLabel: string;
  overallScore: number;
  priorityFocus: string;
  recommendedServiceName: string;
  recommendedServiceRationale: string;
}

export async function sendUserResultsEmail(data: UserResultsEmailData): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn("[lead-notification] SENDGRID_API_KEY not set, skipping user email");
    return;
  }
  sgMail.setApiKey(apiKey);

  const base = getBaseUrl();
  const resultsUrl = `${base}/assessment/results/${data.assessmentId}`;
  const bookingUrl = process.env.BOOKING_URL || "https://calendly.com/jon-untappedchannelstrategy/30min";

  const subject = `Your MSP Channel Readiness Scorecard, ${data.firstName}`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#111111;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

        <!-- Logo / wordmark -->
        <tr><td style="padding-bottom:32px;">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#4cf37b;">Untapped Channel Strategy</p>
        </td></tr>

        <!-- Headline -->
        <tr><td style="padding-bottom:28px;">
          <h1 style="margin:0 0 10px;font-size:24px;font-weight:800;color:#ffffff;line-height:1.2;">Your scorecard is ready, ${data.firstName}.</h1>
          <p style="margin:0;font-size:14px;color:#888888;line-height:1.6;">Here is what your answers say about where your MSP program stands.</p>
        </td></tr>

        <!-- Score card -->
        <tr><td style="padding-bottom:16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:24px 28px;">
            <tr>
              <td style="padding-bottom:4px;">
                <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#4cf37b;">Overall Score</p>
              </td>
            </tr>
            <tr>
              <td>
                <p style="margin:0;font-size:40px;font-weight:800;color:#ffffff;line-height:1;">${data.overallScore}<span style="font-size:16px;color:#555566;font-weight:400;"> / 100</span></p>
              </td>
              <td align="right" valign="middle">
                <span style="display:inline-block;background:#1a3a25;color:#4cf37b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;padding:4px 14px;border-radius:999px;">${data.maturityLabel}</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Priority Focus -->
        <tr><td style="padding-bottom:16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #2a2a2a;border-left:3px solid #4cf37b;border-radius:12px;padding:24px 28px;">
            <tr><td style="padding-bottom:10px;">
              <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#4cf37b;">Priority Focus</p>
            </td></tr>
            <tr><td>
              <p style="margin:0;font-size:17px;font-weight:600;color:#ffffff;line-height:1.5;">${data.priorityFocus}</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Recommended Next Step -->
        <tr><td style="padding-bottom:32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(76,243,123,0.06);border:1px solid rgba(76,243,123,0.2);border-radius:12px;padding:24px 28px;">
            <tr><td style="padding-bottom:8px;">
              <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#4cf37b;">Recommended Next Step</p>
            </td></tr>
            <tr><td style="padding-bottom:6px;">
              <p style="margin:0;font-size:17px;font-weight:700;color:#ffffff;">${data.recommendedServiceName}</p>
            </td></tr>
            <tr><td>
              <p style="margin:0;font-size:13px;color:#888888;line-height:1.6;">${data.recommendedServiceRationale}</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- CTAs -->
        <tr><td style="padding-bottom:16px;" align="center">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:12px;">
                <a href="${resultsUrl}" style="display:inline-block;background:#4cf37b;color:#111111;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;text-decoration:none;padding:14px 24px;border-radius:12px;">View Full Scorecard</a>
              </td>
              <td>
                <a href="${bookingUrl}" style="display:inline-block;background:transparent;color:#4cf37b;font-size:13px;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:12px;border:1px solid rgba(76,243,123,0.4);">Book a Strategy Call</a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Share row -->
        <tr><td style="padding-bottom:32px;" align="center">
          <a href="mailto:?subject=Our MSP channel readiness results&body=I completed an MSP Channel Readiness Assessment through Untapped Channel Strategy. Here are our results: ${resultsUrl}" style="display:inline-block;background:transparent;color:#555566;font-size:12px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:12px;border:1px solid #2a2a2a;">Share these results with your team</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="border-top:1px solid #222222;padding-top:24px;">
          <p style="margin:0 0 4px;font-size:12px;color:#555566;">Jon Purcell</p>
          <p style="margin:0 0 4px;font-size:12px;color:#555566;">Untapped Channel Strategy</p>
          <p style="margin:0;font-size:12px;color:#555566;"><a href="https://untappedchannelstrategy.com" style="color:#555566;">untappedchannelstrategy.com</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `Your scorecard is ready, ${data.firstName}.`,
    ``,
    `Overall Score: ${data.overallScore} / 100`,
    `Maturity Tier: ${data.maturityLabel}`,
    ``,
    `Priority Focus:`,
    data.priorityFocus,
    ``,
    `Recommended Next Step: ${data.recommendedServiceName}`,
    data.recommendedServiceRationale,
    ``,
    `View your full scorecard: ${resultsUrl}`,
    `Book a strategy call: ${bookingUrl}`,
    `Share with your team: mailto:?subject=Our MSP channel readiness results&body=Results: ${resultsUrl}`,
    ``,
    `Jon Purcell`,
    `Untapped Channel Strategy`,
    `untappedchannelstrategy.com`,
  ].join("\n");

  try {
    await sgMail.send({ to: data.email, from: FROM, subject, text, html });
    console.log("[lead-notification] User results email sent to", data.email);
  } catch (err) {
    console.error("[lead-notification] Failed to send user email:", err);
  }
}
