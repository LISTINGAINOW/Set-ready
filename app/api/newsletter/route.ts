import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, sanitizeInput, writeAuditLog } from '@/lib/security';
import {
  createOneClickUnsubscribeUrl,
  getSubscriberPublicProfile,
  hashToken,
  maskEmail,
  updateSubscriberByToken,
  upsertSubscriber,
} from '@/lib/newsletter';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = String(body.email || '');
    const source = sanitizeInput(String(body.source || 'website'));
    const preferences = body.preferences;
    const gdprConsent = Boolean(body.gdprConsent);

    const { subscriber, created } = upsertSubscriber({
      email,
      source,
      preferences,
      gdprConsent,
    });

    writeAuditLog('newsletter.subscribed', {
      email: maskEmail(subscriber.email),
      source: subscriber.source,
      status: subscriber.status,
      created,
      ip,
    });

    writeAuditLog('newsletter.double_opt_in.logged', {
      email: maskEmail(subscriber.email),
      tokenHash: hashToken(subscriber.doubleOptInToken),
      source: subscriber.source,
    });

    writeAuditLog('newsletter.welcome_email.logged', {
      email: maskEmail(subscriber.email),
      template: 'newsletter-welcome',
      sendDeferredUntilConfirmed: true,
      unsubscribeUrl: createOneClickUnsubscribeUrl(subscriber.unsubscribeToken),
    });

    return NextResponse.json(
      {
        ok: true,
        message: 'Check your email to confirm your subscription. For now, the double opt-in token is logged server-side only.',
        subscriber: getSubscriberPublicProfile(subscriber),
      },
      { status: created ? 201 : 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to save newsletter subscription.' },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const token = sanitizeInput(String(body.token || ''));
    const preferences = body.preferences;
    const active = typeof body.active === 'boolean' ? body.active : undefined;

    if (!token) {
      return NextResponse.json({ error: 'Missing subscriber token.' }, { status: 400 });
    }

    const subscriber = updateSubscriberByToken(token, { preferences, active });
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found.' }, { status: 404 });
    }

    writeAuditLog('newsletter.preferences_updated', {
      email: maskEmail(subscriber.email),
      active: subscriber.active,
      preferences: subscriber.preferences,
    });

    return NextResponse.json({ ok: true, subscriber: getSubscriberPublicProfile(subscriber) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update subscription.' },
      { status: 400 }
    );
  }
}
