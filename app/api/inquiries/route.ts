import { createHash, randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  getClientIp,
  isValidEmail,
  sanitizeEmail,
  sanitizeInput,
  validateCsrf,
  writeAuditLog,
} from '@/lib/security';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const VALID_PRODUCTION_TYPES = ['Film', 'TV', 'Commercial', 'Music Video', 'Photo Shoot', 'Event', 'Other'];
const VALID_DURATIONS = ['Half Day', 'Full Day', 'Multi-Day', 'Weekly', 'Monthly'];
const VALID_BUDGETS = ['Under 1K', '1K-5K', '5K-10K', '10K-25K', '25K-50K', '50K+'];
const VALID_HEAR_ABOUT = ['Google', 'Instagram', 'Referral', 'Industry Directory', 'Other'];

function hashIp(ip: string) {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'redacted';
  return `${local.slice(0, 2)}***@${domain}`;
}

function row(label: string, value: string) {
  if (!value) return '';
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:#71717a;width:160px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:13px;color:#e4e4e7;vertical-align:top;">${value}</td>
  </tr>`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (!validateCsrf(request)) {
      writeAuditLog('inquiry.csrf_failed', { ip });
      return NextResponse.json(
        { error: 'Security validation failed. Refresh the page and try again.' },
        { status: 403 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const propertyId = sanitizeInput(String(body.propertyId || '')).slice(0, 100);
    const propertyName = sanitizeInput(String(body.propertyName || '')).slice(0, 200);
    const name = sanitizeInput(String(body.name || '')).slice(0, 120);
    const email = sanitizeEmail(String(body.email || ''));
    const phone = sanitizeInput(String(body.phone || '')).replace(/[^\d+()\-\s]/g, '').slice(0, 32);
    const companyName = sanitizeInput(String(body.companyName || '')).slice(0, 120);
    const productionType = sanitizeInput(String(body.productionType || '')).slice(0, 60);
    const startDate = sanitizeInput(String(body.startDate || '')).slice(0, 30);
    const endDate = sanitizeInput(String(body.endDate || '')).slice(0, 30);
    const duration = sanitizeInput(String(body.duration || '')).slice(0, 60);
    const crewSize = sanitizeInput(String(body.crewSize || '')).slice(0, 20);
    const budgetRange = sanitizeInput(String(body.budgetRange || '')).slice(0, 40);
    const message = sanitizeInput(String(body.message || '')).replace(/[{}$`]/g, '').slice(0, 2000);
    const hearAboutUs = sanitizeInput(String(body.hearAboutUs || '')).slice(0, 60);

    if (!name) return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    if (!email || !isValidEmail(email)) return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    if (!phone) return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    if (!productionType || !VALID_PRODUCTION_TYPES.includes(productionType)) {
      return NextResponse.json({ error: 'Please select a valid production type.' }, { status: 400 });
    }
    if (!startDate) return NextResponse.json({ error: 'Start date is required.' }, { status: 400 });
    if (!endDate) return NextResponse.json({ error: 'End date is required.' }, { status: 400 });
    if (!duration || !VALID_DURATIONS.includes(duration)) {
      return NextResponse.json({ error: 'Please select a duration.' }, { status: 400 });
    }
    if (budgetRange && !VALID_BUDGETS.includes(budgetRange)) {
      return NextResponse.json({ error: 'Invalid budget range.' }, { status: 400 });
    }
    if (hearAboutUs && !VALID_HEAR_ABOUT.includes(hearAboutUs)) {
      return NextResponse.json({ error: 'Invalid source.' }, { status: 400 });
    }

    const inquiryId = `inq_${randomUUID().slice(0, 8)}`;
    const datesNeeded = startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate;

    const supabase = createAdminClient();
    const { error: dbError } = await supabase.from('inquiries').insert({
      property_id: propertyId || null,
      name,
      email,
      phone,
      company: companyName,
      company_name: companyName,
      production_type: productionType,
      dates_needed: datesNeeded,
      duration,
      crew_size: crewSize || null,
      budget_range: budgetRange || null,
      description: message,
      message,
      hear_about_us: hearAboutUs || null,
      status: 'new',
      source: 'property-page',
    });

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      writeAuditLog('inquiry.db_error', { ipHash: hashIp(ip), error: dbError.message });
      return NextResponse.json({ error: 'Failed to save inquiry. Please try again.' }, { status: 500 });
    }

    if (resend) {
      const year = new Date().getFullYear();
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Booking Inquiry — SetVenue</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#111111;border-radius:16px;border:1px solid #1e1e1e;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #1e1e1e;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#2563eb;width:32px;height:32px;border-radius:8px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:16px;font-weight:700;line-height:32px;display:block;">S</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:-0.3px;">SetVenue</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;">New booking inquiry</p>
              <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;line-height:1.25;">${propertyName || 'Property Inquiry'}</h1>
              <p style="margin:0;font-size:13px;color:#52525b;">ID: ${inquiryId}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 28px;">
              <p style="margin:0 0 14px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#3f3f46;">Contact</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row('Name', name)}
                ${row('Email', `<a href="mailto:${email}" style="color:#3b82f6;text-decoration:none;">${email}</a>`)}
                ${row('Phone', phone)}
                ${row('Company', companyName)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 28px;border-top:1px solid #1e1e1e;">
              <p style="margin:14px 0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#3f3f46;">Booking Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row('Type', productionType)}
                ${row('Property', propertyName)}
                ${row('Dates', datesNeeded)}
                ${row('Duration', duration)}
                ${row('Crew size', crewSize)}
                ${row('Budget', budgetRange)}
                ${row('Source', hearAboutUs)}
              </table>
            </td>
          </tr>
          ${message ? `
          <tr>
            <td style="padding:0 40px 28px;border-top:1px solid #1e1e1e;">
              <p style="margin:14px 0 10px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#3f3f46;">Message</p>
              <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.7;white-space:pre-wrap;">${message}</p>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e1e1e;">
              <p style="margin:0;font-size:12px;color:#3f3f46;">&copy; ${year} SetVenue. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const text = [
        `New Booking Inquiry — SetVenue`,
        `ID: ${inquiryId}`,
        '',
        '--- Contact ---',
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        companyName ? `Company: ${companyName}` : '',
        '',
        '--- Booking Details ---',
        propertyName ? `Property: ${propertyName}` : '',
        `Type: ${productionType}`,
        `Dates: ${datesNeeded}`,
        `Duration: ${duration}`,
        crewSize ? `Crew size: ${crewSize}` : '',
        budgetRange ? `Budget: ${budgetRange}` : '',
        hearAboutUs ? `Source: ${hearAboutUs}` : '',
        message ? `\n--- Message ---\n${message}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      await resend.emails.send({
        from: 'SetVenue <noreply@setvenue.com>',
        to: 'noreply@setvenue.com',
        replyTo: email,
        subject: `New Booking Inquiry: ${name} — ${productionType}${propertyName ? ` @ ${propertyName}` : ''}`,
        html,
        text,
      });
    } else {
      console.warn('RESEND_API_KEY not set — skipping notification email');
    }

    writeAuditLog('inquiry.created', {
      inquiryId,
      ipHash: hashIp(ip),
      contact: maskEmail(email),
      productionType,
      propertyId,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    writeAuditLog('inquiry.error', {
      ipHash: hashIp(ip),
      error: error instanceof Error ? error.message : 'unknown_error',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
