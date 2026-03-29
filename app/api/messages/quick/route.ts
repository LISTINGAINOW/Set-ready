import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  getClientIp,
  isValidEmail,
  sanitizeInput,
  sanitizeEmail,
  validateCsrf,
  writeAuditLog,
} from '@/lib/security';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (!validateCsrf(request)) {
      writeAuditLog('quick_message.csrf_failed', { ip });
      return NextResponse.json(
        { error: 'Security validation failed. Refresh the page and try again.' },
        { status: 403 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const name = sanitizeInput(String(body.name || '')).slice(0, 120);
    const email = sanitizeEmail(String(body.email || ''));
    const message = sanitizeInput(String(body.message || '')).replace(/[{}$`]/g, '').slice(0, 1000);
    const propertyId = sanitizeInput(String(body.propertyId || '')).slice(0, 100);
    const propertyName = sanitizeInput(String(body.propertyName || '')).slice(0, 200);

    if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!message) return NextResponse.json({ error: 'Message is required.' }, { status: 400 });

    writeAuditLog('quick_message.received', { ip, propertyId, contact: email.replace(/(.{2}).*@/, '$1***@') });

    if (resend) {
      const year = new Date().getFullYear();

      // Notify admin
      await resend.emails.send({
        from: 'SetVenue <noreply@setvenue.com>',
        to: 'noreply@setvenue.com',
        replyTo: email,
        subject: `Quick question from ${name}${propertyName ? ` — ${propertyName}` : ''}`,
        html: `<!DOCTYPE html><html><body style="margin:0;padding:32px;font-family:sans-serif;background:#f3f4f6;">
<div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:32px;">
<p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#2563eb;">Quick question</p>
<h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#111827;">${propertyName || 'SetVenue Property'}</h2>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;width:80px;">From</td><td style="padding:8px 0;font-size:13px;color:#111827;">${name}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;">Email</td><td style="padding:8px 0;font-size:13px;color:#111827;"><a href="mailto:${email}" style="color:#2563eb;">${email}</a></td></tr>
${propertyId ? `<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;">Property</td><td style="padding:8px 0;font-size:13px;color:#111827;">${propertyName}</td></tr>` : ''}
</table>
<div style="padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
<p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;color:#6b7280;">Message</p>
<p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${message}</p>
</div>
<p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">&copy; ${year} SetVenue</p>
</div></body></html>`,
        text: `Quick question from ${name} (${email})${propertyName ? `\nProperty: ${propertyName}` : ''}\n\n${message}\n\n© ${year} SetVenue`,
      });

      // Auto-reply to sender
      await resend.emails.send({
        from: 'SetVenue <noreply@setvenue.com>',
        to: email,
        subject: `Thanks for reaching out${propertyName ? ` about ${propertyName}` : ''}!`,
        html: `<!DOCTYPE html><html><body style="margin:0;padding:32px;font-family:sans-serif;background:#f3f4f6;">
<div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:32px;">
<p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#2563eb;">Message received</p>
<h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">Thanks for reaching out, ${name.split(' ')[0]}!</h2>
<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">We received your question${propertyName ? ` about <strong>${propertyName}</strong>` : ''} and will get back to you within 24 hours.</p>
<div style="padding:16px 20px;background:#eff6ff;border-radius:10px;border:1px solid #bfdbfe;margin:20px 0;">
<p style="margin:0;font-size:14px;color:#1e40af;line-height:1.6;">In the meantime, you can <a href="https://setvenue.com/locations" style="color:#2563eb;font-weight:600;">browse more locations</a> or <a href="https://setvenue.com/dashboard" style="color:#2563eb;font-weight:600;">check your dashboard</a>.</p>
</div>
<p style="margin:0;font-size:13px;color:#9ca3af;">&copy; ${year} SetVenue &middot; Los Angeles, CA</p>
</div></body></html>`,
        text: `Hi ${name.split(' ')[0]},\n\nThanks for reaching out! We'll get back to you within 24 hours.\n\nBrowse locations: https://setvenue.com/locations\n\n© ${year} SetVenue`,
      });
    } else {
      console.warn('[quick_message] RESEND_API_KEY not set — skipping email');
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Quick message error:', error);
    writeAuditLog('quick_message.error', {
      ip,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
