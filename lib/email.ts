import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailLayout(content: string, footerNote?: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:28px 40px;border-bottom:1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#2563eb;width:36px;height:36px;border-radius:8px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:18px;font-weight:700;line-height:36px;display:block;">S</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:#111827;font-size:18px;font-weight:700;letter-spacing:-0.3px;">SetVenue</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${content}

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e5e7eb;background-color:#f9fafb;">
              ${footerNote ? `<p style="margin:0 0 10px;font-size:12px;color:#6b7280;line-height:1.5;">${footerNote}</p>` : ""}
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">SetVenue &middot; Los Angeles, CA</p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${year} SetVenue. All rights reserved. &nbsp;&middot;&nbsp; <a href="https://setvenue.com/unsubscribe" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function cta(href: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin-top:28px;">
  <tr>
    <td style="background-color:#2563eb;border-radius:8px;">
      <a href="${href}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${label}</a>
    </td>
  </tr>
</table>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;width:160px;vertical-align:top;">${label}</td>
  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;vertical-align:top;">${value}</td>
</tr>`;
}

// ── 1. Verification Email (existing — dark theme, unchanged) ─────────────────

export async function sendVerificationEmail(
  to: string,
  firstName: string,
  verificationLink: string
) {
  const fullLink = `https://setvenue.com${verificationLink}`;
  const year = new Date().getFullYear();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your SetVenue account</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#111111;border-radius:16px;border:1px solid #1e1e1e;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:36px 40px;border-bottom:1px solid #1e1e1e;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#2563eb;width:36px;height:36px;border-radius:8px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:18px;font-weight:700;line-height:36px;display:block;">S</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">SetVenue</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;">Email verification</p>
              <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.25;">Verify your email address</h1>
              <p style="margin:0 0 16px;font-size:16px;color:#a1a1aa;line-height:1.6;">Hi ${firstName},</p>
              <p style="margin:0 0 32px;font-size:15px;color:#71717a;line-height:1.7;">
                Thanks for signing up for SetVenue. Click the button below to verify your email address and activate your account.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background-color:#2563eb;border-radius:8px;">
                    <a href="${fullLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Verify email address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#52525b;line-height:1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0;font-size:12px;color:#3b82f6;word-break:break-all;line-height:1.6;">
                <a href="${fullLink}" style="color:#3b82f6;text-decoration:none;">${fullLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #1e1e1e;">
              <p style="margin:0 0 6px;font-size:12px;color:#52525b;line-height:1.6;">
                This link expires in 24 hours. If you didn&rsquo;t create a SetVenue account, you can safely ignore this email.
              </p>
              <p style="margin:0;font-size:12px;color:#3f3f46;">
                &copy; ${year} SetVenue. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }

  await resend.emails.send({
    from: "SetVenue <noreply@setvenue.com>",
    to,
    subject: "Verify your SetVenue account",
    html,
    text: `Hi ${firstName},\n\nVerify your SetVenue email address:\n${fullLink}\n\nThis link expires in 24 hours. If you didn't create a SetVenue account, ignore this email.\n\n\u00A9 ${year} SetVenue`,
  });
}

// ── 2. Welcome Email ──────────────────────────────────────────────────────────

export function buildWelcomeEmailHtml(firstName: string): string {
  const name = esc(firstName);
  const content = `
  <tr>
    <td style="padding:40px 40px 36px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;">Welcome</p>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">Welcome to SetVenue, ${name}!</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
        You're now part of the SetVenue community — the premier marketplace for filming locations, event venues, and production spaces.
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">Here's what you can do next:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 4px;">
        <tr>
          <td style="padding:14px 16px;background-color:#eff6ff;border-radius:8px;border-left:3px solid #2563eb;margin-bottom:8px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#1e40af;">Browse locations</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Find the perfect space for your next production or event.</p>
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td style="padding:14px 16px;background-color:#eff6ff;border-radius:8px;border-left:3px solid #2563eb;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#1e40af;">List your property</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Earn revenue by opening your space to filmmakers and event planners.</p>
          </td>
        </tr>
      </table>
      ${cta("https://setvenue.com/dashboard", "Go to your dashboard")}
    </td>
  </tr>`;
  return emailLayout(content);
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }
  await resend.emails.send({
    from: "SetVenue <noreply@setvenue.com>",
    to,
    subject: `Welcome to SetVenue, ${firstName}!`,
    html: buildWelcomeEmailHtml(firstName),
    text: `Hi ${firstName},\n\nWelcome to SetVenue — the premier marketplace for filming locations, event venues, and production spaces.\n\nGet started: https://setvenue.com/dashboard\n\n© ${new Date().getFullYear()} SetVenue`,
  });
}

// ── 3. New Inquiry Notification (to admin) ────────────────────────────────────

export interface InquiryDetails {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  productionType?: string;
  preferredCity?: string;
  datesNeeded?: string;
  budget?: string;
  description?: string;
  inquiryId?: string;
}

export function buildNewInquiryNotificationHtml(
  propertyTitle: string,
  details: InquiryDetails
): string {
  const title = esc(propertyTitle);
  const rows = [
    details.inquiryId ? infoRow("Inquiry ID", esc(details.inquiryId)) : "",
    infoRow("From", esc(details.name)),
    infoRow(
      "Email",
      `<a href="mailto:${esc(details.email)}" style="color:#2563eb;text-decoration:none;">${esc(details.email)}</a>`
    ),
    details.phone ? infoRow("Phone", esc(details.phone)) : "",
    details.company ? infoRow("Company", esc(details.company)) : "",
    details.productionType
      ? infoRow("Production type", esc(details.productionType))
      : "",
    details.preferredCity
      ? infoRow("City", esc(details.preferredCity))
      : "",
    details.datesNeeded ? infoRow("Dates needed", esc(details.datesNeeded)) : "",
    details.budget ? infoRow("Budget", esc(details.budget)) : "",
  ]
    .filter(Boolean)
    .join("\n");

  const content = `
  <tr>
    <td style="padding:36px 40px 28px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;">New inquiry</p>
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;line-height:1.25;">Booking Inquiry Received</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;">For: <span style="color:#111827;font-weight:500;">${title}</span></p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 40px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:16px 20px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Inquiry details</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 20px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${rows}
            </table>
          </td>
        </tr>
      </table>
      ${
        details.description
          ? `<div style="margin-top:16px;padding:16px 20px;background-color:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Message</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${esc(details.description)}</p>
      </div>`
          : ""
      }
    </td>
  </tr>`;
  return emailLayout(
    content,
    "You received this notification because a new inquiry was submitted on SetVenue."
  );
}

export async function sendNewInquiryNotification(
  to: string,
  propertyTitle: string,
  inquiryDetails: InquiryDetails
) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }
  await resend.emails.send({
    from: "SetVenue <noreply@setvenue.com>",
    to,
    replyTo: inquiryDetails.email,
    subject: `New inquiry: ${propertyTitle} — from ${inquiryDetails.name}`,
    html: buildNewInquiryNotificationHtml(propertyTitle, inquiryDetails),
    text: `New booking inquiry\n\nProperty: ${propertyTitle}\nFrom: ${inquiryDetails.name}\nEmail: ${inquiryDetails.email}\n${inquiryDetails.phone ? `Phone: ${inquiryDetails.phone}\n` : ""}${inquiryDetails.description ? `\nMessage:\n${inquiryDetails.description}` : ""}\n\n© ${new Date().getFullYear()} SetVenue`,
  });
}

// ── 4. Inquiry Confirmation (to submitter) ────────────────────────────────────

export function buildInquiryConfirmationHtml(
  firstName: string,
  propertyTitle: string
): string {
  const name = esc(firstName);
  const title = esc(propertyTitle);
  const content = `
  <tr>
    <td style="padding:40px 40px 36px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;">Inquiry received</p>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">We got your inquiry!</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
        Thanks for your interest in <strong>${title}</strong>. We've received your inquiry and will be in touch shortly.
      </p>
      <div style="padding:20px 24px;background-color:#eff6ff;border-radius:10px;border:1px solid #bfdbfe;margin:24px 0;">
        <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#1e40af;">What happens next?</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">Our team will review your request and reach out within 1–2 business days to confirm availability and next steps.</p>
      </div>
      <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
        Questions? Reply to this email and we'll be happy to help.
      </p>
      ${cta("https://setvenue.com", "Browse more venues")}
    </td>
  </tr>`;
  return emailLayout(
    content,
    "You received this because you submitted an inquiry on SetVenue."
  );
}

export async function sendInquiryConfirmation(
  to: string,
  firstName: string,
  propertyTitle: string
) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }
  await resend.emails.send({
    from: "SetVenue <noreply@setvenue.com>",
    to,
    subject: `Your inquiry for ${propertyTitle} — we're on it`,
    html: buildInquiryConfirmationHtml(firstName, propertyTitle),
    text: `Hi ${firstName},\n\nThanks for your interest in ${propertyTitle}. We've received your inquiry and will be in touch within 1–2 business days.\n\nQuestions? Reply to this email.\n\n© ${new Date().getFullYear()} SetVenue`,
  });
}

// ── 5. Submission Received (to property owner) ────────────────────────────────

export function buildSubmissionReceivedHtml(
  firstName: string,
  propertyTitle: string
): string {
  const name = esc(firstName);
  const title = esc(propertyTitle);
  const content = `
  <tr>
    <td style="padding:40px 40px 36px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;">Submission received</p>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">Your listing is under review</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
        We've received your listing submission for <strong>${title}</strong>. Our team will review it carefully and get back to you within 2–5 business days.
      </p>
      <div style="padding:20px 24px;background-color:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;margin:24px 0;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#6b7280;">What we review</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#374151;">&#10003; &nbsp;Property details and photos</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#374151;">&#10003; &nbsp;Legal documents and ownership proof</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#374151;">&#10003; &nbsp;Compliance with SetVenue listing standards</td>
          </tr>
        </table>
      </div>
      <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
        We'll notify you by email once the review is complete. In the meantime, feel free to reach out if you have any questions.
      </p>
      ${cta("https://setvenue.com/dashboard", "View your dashboard")}
    </td>
  </tr>`;
  return emailLayout(
    content,
    "You received this because you submitted a listing on SetVenue."
  );
}

export async function sendSubmissionReceived(
  to: string,
  firstName: string,
  propertyTitle: string
) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }
  await resend.emails.send({
    from: "SetVenue <noreply@setvenue.com>",
    to,
    subject: `We received your listing: ${propertyTitle}`,
    html: buildSubmissionReceivedHtml(firstName, propertyTitle),
    text: `Hi ${firstName},\n\nWe've received your listing submission for ${propertyTitle}. Our team will review it and get back to you within 2–5 business days.\n\n© ${new Date().getFullYear()} SetVenue`,
  });
}

// ── 6. Submission Approved ────────────────────────────────────────────────────

export function buildSubmissionApprovedHtml(
  firstName: string,
  propertyTitle: string
): string {
  const name = esc(firstName);
  const title = esc(propertyTitle);
  const content = `
  <tr>
    <td style="padding:40px 40px 36px;">
      <div style="display:inline-block;padding:6px 14px;background-color:#dcfce7;border-radius:20px;margin-bottom:20px;">
        <span style="font-size:13px;font-weight:600;color:#16a34a;">&#10003; &nbsp;Approved</span>
      </div>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">Your listing is live!</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
        Great news — <strong>${title}</strong> has been approved and is now live on SetVenue. Production companies and event planners can discover and book your space.
      </p>
      <div style="padding:20px 24px;background-color:#eff6ff;border-radius:10px;border:1px solid #bfdbfe;margin:24px 0;">
        <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#1e40af;">Tips for more bookings</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">Keep your calendar up to date, respond to inquiries promptly, and consider adding more photos to attract clients.</p>
      </div>
      ${cta("https://setvenue.com/dashboard", "Manage your listing")}
    </td>
  </tr>`;
  return emailLayout(content);
}

export async function sendSubmissionApproved(
  to: string,
  firstName: string,
  propertyTitle: string
) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }
  await resend.emails.send({
    from: "SetVenue <noreply@setvenue.com>",
    to,
    subject: `Your listing is approved: ${propertyTitle}`,
    html: buildSubmissionApprovedHtml(firstName, propertyTitle),
    text: `Hi ${firstName},\n\nGreat news — ${propertyTitle} has been approved and is now live on SetVenue.\n\nManage your listing: https://setvenue.com/dashboard\n\n© ${new Date().getFullYear()} SetVenue`,
  });
}

// ── 7. Submission Rejected ────────────────────────────────────────────────────

export function buildSubmissionRejectedHtml(
  firstName: string,
  propertyTitle: string,
  reason: string
): string {
  const name = esc(firstName);
  const title = esc(propertyTitle);
  const reasonText = esc(reason);
  const content = `
  <tr>
    <td style="padding:40px 40px 36px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#dc2626;">Review update</p>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">Listing not approved</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
        After reviewing your submission for <strong>${title}</strong>, we're unable to approve it at this time.
      </p>
      <div style="padding:20px 24px;background-color:#fef2f2;border-radius:10px;border:1px solid #fecaca;margin:24px 0;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#b91c1c;">Reason</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${reasonText}</p>
      </div>
      <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.7;">
        You're welcome to address the issues above and resubmit. If you have questions about this decision, please contact our support team.
      </p>
      ${cta("https://setvenue.com/list-property", "Resubmit your listing")}
    </td>
  </tr>`;
  return emailLayout(content);
}

export async function sendSubmissionRejected(
  to: string,
  firstName: string,
  propertyTitle: string,
  reason: string
) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }
  await resend.emails.send({
    from: "SetVenue <noreply@setvenue.com>",
    to,
    subject: `Update on your listing: ${propertyTitle}`,
    html: buildSubmissionRejectedHtml(firstName, propertyTitle, reason),
    text: `Hi ${firstName},\n\nWe were unable to approve your listing for ${propertyTitle} at this time.\n\nReason: ${reason}\n\nYou may address the issues and resubmit at https://setvenue.com/list-property\n\n© ${new Date().getFullYear()} SetVenue`,
  });
}

// ── 8. Changes Requested ──────────────────────────────────────────────────────

export function buildChangesRequestedHtml(
  firstName: string,
  propertyTitle: string,
  notes: string
): string {
  const name = esc(firstName);
  const title = esc(propertyTitle);
  const notesText = esc(notes);
  const content = `
  <tr>
    <td style="padding:40px 40px 36px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#d97706;">Action needed</p>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">Changes requested for your listing</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
        We've reviewed your submission for <strong>${title}</strong> and have a few items that need attention before we can approve it.
      </p>
      <div style="padding:20px 24px;background-color:#fffbeb;border-radius:10px;border:1px solid #fde68a;margin:24px 0;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#92400e;">Requested changes</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${notesText}</p>
      </div>
      <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.7;">
        Please make the requested updates and resubmit your listing. Once we receive the updated version, we'll complete the review promptly.
      </p>
      ${cta("https://setvenue.com/dashboard", "Update your listing")}
    </td>
  </tr>`;
  return emailLayout(
    content,
    "You received this because your listing submission requires changes before it can be approved."
  );
}

export async function sendChangesRequested(
  to: string,
  firstName: string,
  propertyTitle: string,
  notes: string
) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }
  await resend.emails.send({
    from: "SetVenue <noreply@setvenue.com>",
    to,
    subject: `Changes needed: ${propertyTitle}`,
    html: buildChangesRequestedHtml(firstName, propertyTitle, notes),
    text: `Hi ${firstName},\n\nWe've reviewed your listing for ${propertyTitle} and need a few changes before approving.\n\nRequested changes:\n${notes}\n\nUpdate your listing: https://setvenue.com/dashboard\n\n© ${new Date().getFullYear()} SetVenue`,
  });
}

// ── 9. Booking Confirmation ───────────────────────────────────────────────────

export function buildBookingConfirmationHtml(
  firstName: string,
  propertyTitle: string,
  dates: string,
  amount: string
): string {
  const name = esc(firstName);
  const title = esc(propertyTitle);
  const datesText = esc(dates);
  const amountText = esc(amount);
  const content = `
  <tr>
    <td style="padding:40px 40px 36px;">
      <div style="display:inline-block;padding:6px 14px;background-color:#dcfce7;border-radius:20px;margin-bottom:20px;">
        <span style="font-size:13px;font-weight:600;color:#16a34a;">&#10003; &nbsp;Booking confirmed</span>
      </div>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">Your booking is confirmed!</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
        Your booking for <strong>${title}</strong> has been confirmed. Here's a summary:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
        <tr>
          <td style="padding:16px 20px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Booking summary</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 20px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${infoRow("Venue", title)}
              ${infoRow("Dates", datesText)}
              ${infoRow("Total amount", `<strong style="color:#111827;">${amountText}</strong>`)}
            </table>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 4px;font-size:14px;color:#6b7280;line-height:1.7;">
        Full details and access instructions will be sent closer to your booking date. If you need to make changes or have questions, please contact us as soon as possible.
      </p>
      ${cta("https://setvenue.com/dashboard/bookings", "View booking details")}
    </td>
  </tr>`;
  return emailLayout(
    content,
    "You received this because you made a booking on SetVenue."
  );
}

export async function sendBookingConfirmation(
  to: string,
  firstName: string,
  propertyTitle: string,
  dates: string,
  amount: string
) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }
  await resend.emails.send({
    from: "SetVenue <noreply@setvenue.com>",
    to,
    subject: `Booking confirmed: ${propertyTitle}`,
    html: buildBookingConfirmationHtml(firstName, propertyTitle, dates, amount),
    text: `Hi ${firstName},\n\nYour booking for ${propertyTitle} is confirmed.\n\nDates: ${dates}\nTotal: ${amount}\n\nView details: https://setvenue.com/dashboard/bookings\n\n© ${new Date().getFullYear()} SetVenue`,
  });
}

// ── 10. Newsletter ─────────────────────────────────────────────────────────────

export function buildNewsletterHtml(
  firstName: string,
  subject: string,
  content: string
): string {
  const name = esc(firstName);
  const subjectText = esc(subject);
  // content is trusted HTML passed by internal callers
  const body = `
  <tr>
    <td style="padding:36px 40px 16px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;">SetVenue Newsletter</p>
      <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#111827;line-height:1.3;">${subjectText}</h1>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">Hi ${name},</p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 40px 36px;">
      <div style="font-size:15px;color:#374151;line-height:1.8;">${content}</div>
      ${cta("https://setvenue.com", "Browse SetVenue")}
    </td>
  </tr>`;
  return emailLayout(
    body,
    "You're receiving this because you're subscribed to the SetVenue newsletter."
  );
}

export async function sendNewsletter(
  to: string,
  firstName: string,
  subject: string,
  content: string
) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }
  await resend.emails.send({
    from: "SetVenue <noreply@setvenue.com>",
    to,
    subject,
    html: buildNewsletterHtml(firstName, subject, content),
    text: `Hi ${firstName},\n\n${subject}\n\nVisit SetVenue: https://setvenue.com\n\n© ${new Date().getFullYear()} SetVenue`,
  });
}
