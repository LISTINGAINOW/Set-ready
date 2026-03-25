import { NextRequest, NextResponse } from 'next/server';
import { confirmSubscriber, getSubscriberPublicProfile, hashToken, maskEmail } from '@/lib/newsletter';
import { sanitizeInput, writeAuditLog } from '@/lib/security';

export async function GET(request: NextRequest) {
  const token = sanitizeInput(request.nextUrl.searchParams.get('token') || '');

  if (!token) {
    return NextResponse.json({ error: 'Missing confirmation token.' }, { status: 400 });
  }

  const subscriber = confirmSubscriber(token);
  if (!subscriber) {
    return NextResponse.json({ error: 'Invalid or expired confirmation token.' }, { status: 404 });
  }

  writeAuditLog('newsletter.confirmed', {
    email: maskEmail(subscriber.email),
    tokenHash: hashToken(token),
  });

  return NextResponse.json({ ok: true, subscriber: getSubscriberPublicProfile(subscriber) });
}
