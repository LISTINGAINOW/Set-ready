import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

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
