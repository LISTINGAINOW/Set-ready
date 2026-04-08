import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/admin";

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

/** @deprecated Use sendPaymentSuccessful(booking) for post-payment confirmation */
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

// ── Booking Email Automation ───────────────────────────────────────────────────
// Functions that accept a BookingRecord object and handle all send/log/retry logic.
// These should be called fire-and-forget from API routes — they never throw.

export interface BookingRecord {
  id: string;
  property_id: string;
  contact_name: string;
  contact_email: string;
  company_name: string;
  production_type: string;
  booking_start?: string | null;
  booking_end?: string | null;
  damage_deposit_amount?: number;
  total_amount?: number;
  status?: string;
  property_name?: string; // optionally pre-fetched from properties table
}

function formatBookingDates(start?: string | null, end?: string | null): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return fmt(start);
  return "Dates TBD";
}

async function logEmailAttempt(
  bookingId: string,
  emailType: string,
  recipient: string,
  status: "sent" | "failed",
  errorMessage?: string,
  resendId?: string
): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("email_logs").insert({
      booking_id: bookingId,
      email_type: emailType,
      recipient,
      status,
      error_message: errorMessage ?? null,
      resend_id: resendId ?? null,
    });
  } catch (err) {
    console.error("[email] Failed to write email_log:", err);
  }
}

type ResendPayload = {
  from: string;
  to: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text: string;
};

async function sendEmailWithRetry(
  payload: ResendPayload,
  bookingId: string,
  emailType: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping send");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const recipient = Array.isArray(payload.to) ? payload.to[0] : payload.to;

  try {
    const { data, error } = await resend.emails.send(payload);
    if (error) throw new Error(error.message);
    await logEmailAttempt(bookingId, emailType, recipient, "sent", undefined, data?.id);
    return { success: true };
  } catch (firstErr: unknown) {
    const msg = firstErr instanceof Error ? firstErr.message : String(firstErr);
    console.warn(`[email] ${emailType} failed (will retry): ${msg}`);

    // Retry once after 30s — fire-and-forget so main flow is not blocked
    void (async () => {
      await new Promise((resolve) => setTimeout(resolve, 30_000));
      try {
        const { data, error } = await resend!.emails.send(payload);
        if (error) throw new Error(error.message);
        await logEmailAttempt(bookingId, emailType, recipient, "sent", undefined, data?.id);
        console.log(`[email] ${emailType} retry succeeded`);
      } catch (retryErr: unknown) {
        const retryMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
        console.error(`[email] ${emailType} retry failed: ${retryMsg}`);
        await logEmailAttempt(bookingId, emailType, recipient, "failed", retryMsg);
      }
    })();

    return { success: false, error: msg };
  }
}

// ── B1. Booking Request Submitted (to renter) ─────────────────────────────────

function buildBookingRequestReceivedHtml(
  firstName: string,
  propertyName: string,
  dates: string,
  bookingId: string
): string {
  const name = esc(firstName);
  const venue = esc(propertyName);
  const datesText = esc(dates);
  const content = `
  <tr>
    <td style="padding:40px 40px 36px;">
      <div style="display:inline-block;padding:6px 14px;background-color:#dbeafe;border-radius:20px;margin-bottom:20px;">
        <span style="font-size:13px;font-weight:600;color:#1d4ed8;">&#128338; &nbsp;Under review</span>
      </div>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">We received your booking request!</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
        Your booking request for <strong>${venue}</strong> has been submitted and is now under review. Our team will reach out within 1–2 business days.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
        <tr>
          <td style="padding:16px 20px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Request summary</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 20px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${infoRow("Venue", venue)}
              ${infoRow("Dates", datesText)}
              ${infoRow("Reference", `<span style="font-family:monospace;font-size:12px;">${esc(bookingId)}</span>`)}
            </table>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 4px;font-size:14px;color:#6b7280;line-height:1.7;">
        Questions? Reply to this email or contact us at <a href="mailto:support@setvenue.com" style="color:#2563eb;text-decoration:none;">support@setvenue.com</a>.
      </p>
      ${cta("https://setvenue.com/dashboard/bookings", "View booking status")}
    </td>
  </tr>`;
  return emailLayout(
    content,
    "You received this because you submitted a booking request on SetVenue."
  );
}

export async function sendBookingRequestConfirmation(
  booking: BookingRecord
): Promise<{ success: boolean; error?: string }> {
  const firstName = booking.contact_name.split(" ")[0] ?? booking.contact_name;
  const propertyName = booking.property_name ?? `Property ${booking.property_id}`;
  const dates = formatBookingDates(booking.booking_start, booking.booking_end);

  const payload: ResendPayload = {
    from: "SetVenue <noreply@setvenue.com>",
    to: booking.contact_email,
    bcc: "admin@setvenue.com",
    subject: `Booking request received: ${propertyName}`,
    html: buildBookingRequestReceivedHtml(firstName, propertyName, dates, booking.id),
    text: `Hi ${firstName},\n\nWe received your booking request for ${propertyName}.\n\nDates: ${dates}\nReference: ${booking.id}\n\nOur team will review and contact you within 1–2 business days.\n\nQuestions? Email support@setvenue.com\n\n© ${new Date().getFullYear()} SetVenue`,
  };

  return sendEmailWithRetry(payload, booking.id, "booking_request_received");
}

// ── B2. Booking Approved (to renter) ──────────────────────────────────────────

function buildBookingApprovedHtml(
  firstName: string,
  propertyName: string,
  dates: string,
  bookingUrl: string
): string {
  const name = esc(firstName);
  const venue = esc(propertyName);
  const datesText = esc(dates);
  const content = `
  <tr>
    <td style="padding:40px 40px 36px;">
      <div style="display:inline-block;padding:6px 14px;background-color:#dcfce7;border-radius:20px;margin-bottom:20px;">
        <span style="font-size:13px;font-weight:600;color:#16a34a;">&#10003; &nbsp;Approved</span>
      </div>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">Your booking has been approved!</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
        Great news — your booking request for <strong>${venue}</strong> has been approved. Please complete your payment to secure the booking.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
        <tr>
          <td style="padding:16px 20px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Booking details</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 20px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${infoRow("Venue", venue)}
              ${infoRow("Dates", datesText)}
              ${infoRow("Next step", "Complete payment to confirm")}
            </table>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 4px;font-size:14px;color:#6b7280;line-height:1.7;">
        Your booking will be held for 48 hours. If payment is not received, the booking may be released. Questions? Contact <a href="mailto:support@setvenue.com" style="color:#2563eb;text-decoration:none;">support@setvenue.com</a>.
      </p>
      ${cta(bookingUrl, "Complete payment")}
    </td>
  </tr>`;
  return emailLayout(
    content,
    "You received this because your booking request was reviewed by the SetVenue team."
  );
}

export async function sendBookingApproved(
  booking: BookingRecord,
  bookingUrl: string
): Promise<{ success: boolean; error?: string }> {
  const firstName = booking.contact_name.split(" ")[0] ?? booking.contact_name;
  const propertyName = booking.property_name ?? `Property ${booking.property_id}`;
  const dates = formatBookingDates(booking.booking_start, booking.booking_end);

  const payload: ResendPayload = {
    from: "SetVenue <noreply@setvenue.com>",
    to: booking.contact_email,
    bcc: "admin@setvenue.com",
    subject: `Your booking is approved: ${propertyName}`,
    html: buildBookingApprovedHtml(firstName, propertyName, dates, bookingUrl),
    text: `Hi ${firstName},\n\nYour booking for ${propertyName} has been approved!\n\nDates: ${dates}\nNext step: Complete payment at ${bookingUrl}\n\nYour booking will be held for 48 hours. Questions? Email support@setvenue.com\n\n© ${new Date().getFullYear()} SetVenue`,
  };

  return sendEmailWithRetry(payload, booking.id, "booking_approved");
}

// ── B3. Booking Rejected (to renter) ──────────────────────────────────────────

function buildBookingRejectedHtml(
  firstName: string,
  propertyName: string,
  reason: string
): string {
  const name = esc(firstName);
  const venue = esc(propertyName);
  const reasonText = esc(reason);
  const content = `
  <tr>
    <td style="padding:40px 40px 36px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#dc2626;">Booking update</p>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">Booking request not approved</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
        After reviewing your request for <strong>${venue}</strong>, we're unable to approve it at this time.
      </p>
      <div style="padding:20px 24px;background-color:#fef2f2;border-radius:10px;border:1px solid #fecaca;margin:24px 0;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#b91c1c;">Reason</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${reasonText}</p>
      </div>
      <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.7;">
        You're welcome to browse our other available venues or contact our team if you have questions about this decision.
      </p>
      ${cta("https://setvenue.com/locations", "Browse other venues")}
      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
        Questions? <a href="mailto:support@setvenue.com" style="color:#6b7280;">support@setvenue.com</a>
      </p>
    </td>
  </tr>`;
  return emailLayout(
    content,
    "You received this because your booking request was reviewed by the SetVenue team."
  );
}

export async function sendBookingRejected(
  booking: BookingRecord,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const firstName = booking.contact_name.split(" ")[0] ?? booking.contact_name;
  const propertyName = booking.property_name ?? `Property ${booking.property_id}`;

  const payload: ResendPayload = {
    from: "SetVenue <noreply@setvenue.com>",
    to: booking.contact_email,
    bcc: "admin@setvenue.com",
    subject: `Update on your booking request: ${propertyName}`,
    html: buildBookingRejectedHtml(firstName, propertyName, reason),
    text: `Hi ${firstName},\n\nWe were unable to approve your booking request for ${propertyName}.\n\nReason: ${reason}\n\nBrowse other venues: https://setvenue.com/locations\nQuestions? Email support@setvenue.com\n\n© ${new Date().getFullYear()} SetVenue`,
  };

  return sendEmailWithRetry(payload, booking.id, "booking_rejected");
}

// ── B4. Payment Successful (to renter) ────────────────────────────────────────

export async function sendPaymentSuccessful(
  booking: BookingRecord
): Promise<{ success: boolean; error?: string }> {
  const firstName = booking.contact_name.split(" ")[0] ?? booking.contact_name;
  const propertyName = booking.property_name ?? `Property ${booking.property_id}`;
  const dates = formatBookingDates(booking.booking_start, booking.booking_end);
  const amount = booking.damage_deposit_amount
    ? `$${booking.damage_deposit_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : "See booking details";

  const payload: ResendPayload = {
    from: "SetVenue <noreply@setvenue.com>",
    to: booking.contact_email,
    bcc: "admin@setvenue.com",
    subject: `Payment confirmed — ${propertyName}`,
    html: buildBookingConfirmationHtml(firstName, propertyName, dates, amount),
    text: `Hi ${firstName},\n\nPayment received! Your booking for ${propertyName} is confirmed.\n\nDates: ${dates}\nAmount: ${amount}\n\nAccess instructions will be sent closer to your booking date.\nView details: https://setvenue.com/dashboard/bookings\n\n© ${new Date().getFullYear()} SetVenue`,
  };

  return sendEmailWithRetry(payload, booking.id, "payment_successful");
}

// ── B4b. Booking Cancelled (to renter) ────────────────────────────────────────

function buildBookingCancelledHtml(
  firstName: string,
  propertyName: string
): string {
  const name = esc(firstName);
  const venue = esc(propertyName);
  const content = `
  <tr>
    <td style="padding:40px 40px 36px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">Booking update</p>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">Your booking has been cancelled</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
        Your booking for <strong>${venue}</strong> has been cancelled. If you believe this was in error or have questions, please reach out to our support team.
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.7;">
        You're welcome to explore other available venues and submit a new booking request at any time.
      </p>
      ${cta("https://setvenue.com/locations", "Browse other venues")}
      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
        Questions? <a href="mailto:support@setvenue.com" style="color:#6b7280;">support@setvenue.com</a>
      </p>
    </td>
  </tr>`;
  return emailLayout(
    content,
    "You received this because your SetVenue booking was cancelled."
  );
}

export async function sendBookingCancelled(
  booking: BookingRecord
): Promise<{ success: boolean; error?: string }> {
  const firstName = booking.contact_name.split(" ")[0] ?? booking.contact_name;
  const propertyName = booking.property_name ?? `Property ${booking.property_id}`;

  const payload: ResendPayload = {
    from: "SetVenue <noreply@setvenue.com>",
    to: booking.contact_email,
    bcc: "admin@setvenue.com",
    subject: `Booking cancelled — ${propertyName}`,
    html: buildBookingCancelledHtml(firstName, propertyName),
    text: `Hi ${firstName},\n\nYour booking for ${propertyName} has been cancelled.\n\nBrowse other venues: https://setvenue.com/locations\nQuestions? Email support@setvenue.com\n\n© ${new Date().getFullYear()} SetVenue`,
  };

  return sendEmailWithRetry(payload, booking.id, "booking_cancelled");
}

// ── B4c. Owner Booking Notification ───────────────────────────────────────────

export interface SimpleBookingNotice {
  bookingId: string;
  propertyName: string;
  renterName: string;
  renterEmail: string;
  renterPhone?: string;
  productionType: string;
  date: string;
  startTime?: string;
  endTime?: string;
  crewSize?: string;
  budget?: string;
  specialRequirements?: string;
  notes?: string;
}

function buildOwnerBookingNotificationHtml(notice: SimpleBookingNotice): string {
  const venue = esc(notice.propertyName);
  const renter = esc(notice.renterName);
  const email = esc(notice.renterEmail);
  const phone = notice.renterPhone ? esc(notice.renterPhone) : "";
  const prodType = esc(notice.productionType);
  const dateStr = esc(notice.date);
  const timeStr = notice.startTime && notice.endTime
    ? esc(`${notice.startTime} – ${notice.endTime}`)
    : "";

  const rows = [
    infoRow("Booking ID", `<span style="font-family:monospace;font-size:12px;">${esc(notice.bookingId)}</span>`),
    infoRow("Renter", renter),
    infoRow("Email", `<a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a>`),
    phone ? infoRow("Phone", phone) : "",
    infoRow("Production type", prodType),
    infoRow("Date", dateStr),
    timeStr ? infoRow("Time", timeStr) : "",
    notice.crewSize ? infoRow("Crew size", esc(notice.crewSize)) : "",
    notice.budget ? infoRow("Budget", esc(notice.budget)) : "",
  ].filter(Boolean).join("\n");

  const content = `
  <tr>
    <td style="padding:36px 40px 28px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;">New booking request</p>
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;line-height:1.25;">New Booking Request for ${venue}</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;">A renter has submitted a booking request for your property.</p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 40px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:16px 20px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Request details</p>
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
      ${(notice.specialRequirements || notice.notes) ? `<div style="margin-top:16px;padding:16px 20px;background-color:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">${notice.specialRequirements ? "Special requirements" : "Notes"}</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${esc(notice.specialRequirements || notice.notes || "")}</p>
      </div>` : ""}
      ${cta("https://setvenue.com/admin/bookings", "View in admin dashboard")}
    </td>
  </tr>`;

  return emailLayout(
    content,
    "You received this because a new booking was submitted for your SetVenue property."
  );
}

export async function sendOwnerBookingNotification(
  ownerEmail: string,
  notice: SimpleBookingNotice
): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping owner notification");
    return;
  }
  try {
    await resend.emails.send({
      from: "SetVenue <noreply@setvenue.com>",
      to: ownerEmail,
      replyTo: notice.renterEmail,
      subject: `New Booking Request for ${notice.propertyName} — from ${notice.renterName}`,
      html: buildOwnerBookingNotificationHtml(notice),
      text: `New booking request\n\nProperty: ${notice.propertyName}\nFrom: ${notice.renterName} (${notice.renterEmail})\nType: ${notice.productionType}\nDate: ${notice.date}${notice.startTime ? `\nTime: ${notice.startTime} – ${notice.endTime}` : ""}\nBooking ID: ${notice.bookingId}\n\nReview at: https://setvenue.com/admin/bookings\n\n© ${new Date().getFullYear()} SetVenue`,
    });
  } catch (err) {
    console.error("[email] Failed to send owner notification:", err);
  }
}

// ── B5. Payment Failed (to renter) ────────────────────────────────────────────

function buildPaymentFailedHtml(
  firstName: string,
  propertyName: string,
  reason: string
): string {
  const name = esc(firstName);
  const venue = esc(propertyName);
  const reasonText = esc(reason);
  const content = `
  <tr>
    <td style="padding:40px 40px 36px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#dc2626;">Payment failed</p>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#111827;line-height:1.25;">We couldn't process your payment</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
        Unfortunately, we were unable to process your payment for <strong>${venue}</strong>.
      </p>
      <div style="padding:20px 24px;background-color:#fef2f2;border-radius:10px;border:1px solid #fecaca;margin:24px 0;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#b91c1c;">Reason</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${reasonText}</p>
      </div>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
        Please try again with a different payment method, or contact your bank if the issue persists.
      </p>
      ${cta("https://setvenue.com/dashboard/bookings", "Retry payment")}
      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
        Need help? <a href="mailto:support@setvenue.com" style="color:#6b7280;">support@setvenue.com</a>
      </p>
    </td>
  </tr>`;
  return emailLayout(
    content,
    "You received this because a payment for your SetVenue booking was attempted."
  );
}

export async function sendPaymentFailed(
  booking: BookingRecord,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const firstName = booking.contact_name.split(" ")[0] ?? booking.contact_name;
  const propertyName = booking.property_name ?? `Property ${booking.property_id}`;

  const payload: ResendPayload = {
    from: "SetVenue <noreply@setvenue.com>",
    to: booking.contact_email,
    bcc: "admin@setvenue.com",
    subject: `Payment failed — ${propertyName}`,
    html: buildPaymentFailedHtml(firstName, propertyName, reason),
    text: `Hi ${firstName},\n\nWe couldn't process your payment for ${propertyName}.\n\nReason: ${reason}\n\nPlease retry: https://setvenue.com/dashboard/bookings\nNeed help? Email support@setvenue.com\n\n© ${new Date().getFullYear()} SetVenue`,
  };

  return sendEmailWithRetry(payload, booking.id, "payment_failed");
}
