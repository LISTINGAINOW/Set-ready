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

const VALID_PRODUCTION_TYPES = ['Film', 'Photo Shoot', 'Music Video', 'Commercial', 'Corporate Event', 'Wedding/Party', 'Podcast/Interview', 'Other'];
const VALID_CITIES = ['Los Angeles', 'Atlanta', 'New York City', 'Austin', 'Miami', 'Nashville', 'New Orleans', 'Albuquerque', 'Santa Fe', 'Pittsburgh', 'Detroit', 'Savannah', 'Honolulu', 'Salt Lake City', 'Portland', 'Seattle', 'San Francisco', 'Chicago', 'Wilmington NC', 'Oklahoma City', 'Other US City'];
const VALID_DURATIONS = ['Half Day 4hrs', 'Full Day 8hrs', 'Multi-Day', 'Weekly', 'Monthly'];
const VALID_CREW_SIZES = ['1-5', '6-15', '16-30', '31-50', '50+'];
const VALID_BUDGETS = ['Under $500', '$500-$1000', '$1000-$2500', '$2500-$5000', '$5000-$10000', '$10000+', 'Flexible'];
const VALID_FEATURES = ['Pool', 'Ocean View', 'Mountain View', 'Modern Kitchen', 'Large Backyard', 'Rooftop', 'Parking 5+ Vehicles', 'Natural Light', 'Industrial/Warehouse', 'Privacy/Gated', 'Furnished', 'Historic/Character', 'Outdoor Space'];

function hashIp(ip: string) {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'redacted';
  return `${local.slice(0, 2)}***@${domain}`;
}

function buildNotificationEmail(data: {
  name: string;
  email: string;
  phone: string;
  company: string;
  productionType: string;
  preferredCity: string;
  datesNeeded: string;
  duration: string;
  crewSize: string;
  budgetRange: string;
  mustHaveFeatures: string[];
  description: string;
  id: string;
}) {
  const year = new Date().getFullYear();
  const row = (label: string, value: string) =>
    value
      ? `<tr>
          <td style="padding:8px 0;font-size:13px;color:#71717a;width:160px;vertical-align:top;">${label}</td>
          <td style="padding:8px 0;font-size:13px;color:#e4e4e7;vertical-align:top;">${value}</td>
        </tr>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Location Inquiry — SetVenue</title>
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
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;">New inquiry</p>
              <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;line-height:1.25;">Find Me a Location Request</h1>
              <p style="margin:0;font-size:13px;color:#52525b;">ID: ${data.id}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 28px;">
              <p style="margin:0 0 14px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#3f3f46;">Contact</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row('Name', data.name)}
                ${row('Email', `<a href="mailto:${data.email}" style="color:#3b82f6;text-decoration:none;">${data.email}</a>`)}
                ${row('Phone', data.phone)}
                ${row('Company', data.company)}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 28px;border-top:1px solid #1e1e1e;">
              <p style="margin:14px 0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#3f3f46;">Production Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row('Type', data.productionType)}
                ${row('City', data.preferredCity)}
                ${row('Dates', data.datesNeeded)}
                ${row('Duration', data.duration)}
                ${row('Crew size', data.crewSize)}
                ${row('Budget', data.budgetRange)}
                ${row('Must-haves', data.mustHaveFeatures.length ? data.mustHaveFeatures.join(', ') : '')}
              </table>
            </td>
          </tr>

          ${data.description ? `
          <tr>
            <td style="padding:0 40px 28px;border-top:1px solid #1e1e1e;">
              <p style="margin:14px 0 10px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#3f3f46;">Project Description</p>
              <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.7;white-space:pre-wrap;">${data.description}</p>
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
    'New Find Me a Location Request — SetVenue',
    `ID: ${data.id}`,
    '',
    '--- Contact ---',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : '',
    data.company ? `Company: ${data.company}` : '',
    '',
    '--- Production Details ---',
    data.productionType ? `Type: ${data.productionType}` : '',
    data.preferredCity ? `City: ${data.preferredCity}` : '',
    data.datesNeeded ? `Dates: ${data.datesNeeded}` : '',
    data.duration ? `Duration: ${data.duration}` : '',
    data.crewSize ? `Crew size: ${data.crewSize}` : '',
    data.budgetRange ? `Budget: ${data.budgetRange}` : '',
    data.mustHaveFeatures.length ? `Must-haves: ${data.mustHaveFeatures.join(', ')}` : '',
    '',
    '--- Description ---',
    data.description,
  ]
    .filter(Boolean)
    .join('\n');

  return { html, text };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (!validateCsrf(request)) {
      writeAuditLog('find_location.csrf_failed', { ip });
      return NextResponse.json(
        { error: 'Security validation failed. Refresh the page and try again.' },
        { status: 403 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const name = sanitizeInput(String(body.name || '')).slice(0, 120);
    const email = sanitizeEmail(String(body.email || ''));
    const phone = sanitizeInput(String(body.phone || '')).replace(/[^\d+()\-\s]/g, '').slice(0, 32);
    const company = sanitizeInput(String(body.company || '')).slice(0, 120);
    const productionType = sanitizeInput(String(body.productionType || '')).slice(0, 60);
    const preferredCity = sanitizeInput(String(body.preferredCity || '')).slice(0, 60);
    const datesNeeded = sanitizeInput(String(body.datesNeeded || '')).slice(0, 200);
    const duration = sanitizeInput(String(body.duration || '')).slice(0, 60);
    const crewSize = sanitizeInput(String(body.crewSize || '')).slice(0, 30);
    const budgetRange = sanitizeInput(String(body.budgetRange || '')).slice(0, 40);
    const mustHaveFeatures = Array.isArray(body.mustHaveFeatures)
      ? (body.mustHaveFeatures as unknown[])
          .map((f) => sanitizeInput(String(f)))
          .filter((f) => VALID_FEATURES.includes(f))
          .slice(0, 20)
      : [];
    const description = sanitizeInput(String(body.description || '')).replace(/[{}$`]/g, '').slice(0, 2000);

    if (!name) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: 'Project description is required.' }, { status: 400 });
    }
    if (productionType && !VALID_PRODUCTION_TYPES.includes(productionType)) {
      return NextResponse.json({ error: 'Invalid production type.' }, { status: 400 });
    }
    if (preferredCity && !VALID_CITIES.includes(preferredCity)) {
      return NextResponse.json({ error: 'Invalid city selection.' }, { status: 400 });
    }
    if (duration && !VALID_DURATIONS.includes(duration)) {
      return NextResponse.json({ error: 'Invalid duration.' }, { status: 400 });
    }
    if (crewSize && !VALID_CREW_SIZES.includes(crewSize)) {
      return NextResponse.json({ error: 'Invalid crew size.' }, { status: 400 });
    }
    if (budgetRange && !VALID_BUDGETS.includes(budgetRange)) {
      return NextResponse.json({ error: 'Invalid budget range.' }, { status: 400 });
    }

    const inquiryId = `inq_${randomUUID().slice(0, 8)}`;

    const supabase = createAdminClient();
    const { error: dbError } = await supabase.from('inquiries').insert({
      name,
      email,
      phone,
      company,
      production_type: productionType,
      preferred_city: preferredCity,
      dates_needed: datesNeeded,
      duration,
      crew_size: crewSize,
      budget_range: budgetRange,
      must_have_features: mustHaveFeatures,
      description,
      message: description,
      status: 'new',
      source: 'find-location',
    });

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      writeAuditLog('find_location.db_error', { ipHash: hashIp(ip), error: dbError.message });
      return NextResponse.json({ error: 'Failed to save inquiry. Please try again.' }, { status: 500 });
    }

    const { html, text } = buildNotificationEmail({
      name,
      email,
      phone,
      company,
      productionType,
      preferredCity,
      datesNeeded,
      duration,
      crewSize,
      budgetRange,
      mustHaveFeatures,
      description,
      id: inquiryId,
    });

    if (resend) {
      await resend.emails.send({
        from: 'SetVenue <noreply@setvenue.com>',
        to: 'josh@setvenue.com',
        replyTo: email,
        subject: `New Location Request: ${name}${productionType ? ` — ${productionType}` : ''}${preferredCity ? ` in ${preferredCity}` : ''}`,
        html,
        text,
      });
    } else {
      console.warn('RESEND_API_KEY not set — skipping notification email');
    }

    writeAuditLog('find_location.created', {
      inquiryId,
      ipHash: hashIp(ip),
      contact: maskEmail(email),
      productionType,
      preferredCity,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Find location inquiry error:', error);
    writeAuditLog('find_location.error', {
      ipHash: hashIp(ip),
      error: error instanceof Error ? error.message : 'unknown_error',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
