import { NextRequest, NextResponse } from 'next/server';
import { getSubscriberPublicProfile, updateSubscriberByToken, hashToken, maskEmail } from '@/lib/newsletter';
import { sanitizeInput, writeAuditLog } from '@/lib/security';

export async function GET(request: NextRequest) {
  const token = sanitizeInput(request.nextUrl.searchParams.get('token') || '');

  if (!token) {
    return NextResponse.redirect(new URL('/email-preferences?error=missing-token', request.url));
  }

  const subscriber = updateSubscriberByToken(token, { active: false });
  if (!subscriber) {
    return NextResponse.redirect(new URL('/email-preferences?error=invalid-token', request.url));
  }

  writeAuditLog('newsletter.unsubscribed', {
    email: maskEmail(subscriber.email),
    tokenHash: hashToken(token),
  });

  return NextResponse.redirect(
    new URL(`/email-preferences?token=${encodeURIComponent(subscriber.unsubscribeToken)}&unsubscribed=1`, request.url)
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;
  const token = sanitizeInput(String(body.token || ''));

  if (!token) {
    return NextResponse.json({ error: 'Missing unsubscribe token.' }, { status: 400 });
  }

  const subscriber = updateSubscriberByToken(token, { active: false });
  if (!subscriber) {
    return NextResponse.json({ error: 'Subscriber not found.' }, { status: 404 });
  }

  writeAuditLog('newsletter.unsubscribed', {
    email: maskEmail(subscriber.email),
    tokenHash: hashToken(token),
  });

  return NextResponse.json({ ok: true, subscriber: getSubscriberPublicProfile(subscriber) });
}
