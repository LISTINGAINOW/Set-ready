import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail, sanitizeEmail, sanitizeInput } from '@/lib/security';
import {
  sendDripWelcomeNewsletter,
  sendDripHostOnboarding,
  sendDripBookingFollowUp,
  sendDripAbandonedInquiry,
} from '@/lib/email';

/**
 * POST /api/emails/drip
 *
 * Trigger a drip email by type. Internal use only — secured by DRIP_SECRET.
 *
 * Body:
 *   type        "welcome_newsletter" | "host_onboarding" | "booking_followup" | "abandoned_inquiry"
 *   email       recipient email address
 *   firstName   recipient first name
 *   // type-specific fields:
 *   propertyTitle  (host_onboarding | booking_followup | abandoned_inquiry)
 *   bookingDate    (booking_followup — ISO date string or formatted string)
 */

const DRIP_SECRET = process.env.DRIP_SECRET;

type DripType =
  | 'welcome_newsletter'
  | 'host_onboarding'
  | 'booking_followup'
  | 'abandoned_inquiry';

const VALID_TYPES: DripType[] = [
  'welcome_newsletter',
  'host_onboarding',
  'booking_followup',
  'abandoned_inquiry',
];

export async function POST(request: NextRequest) {
  // Require internal secret to prevent abuse
  const authHeader = request.headers.get('authorization');
  if (DRIP_SECRET && authHeader !== `Bearer ${DRIP_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const type = sanitizeInput(String(body.type ?? '')) as DripType;
  const email = sanitizeEmail(String(body.email ?? ''));
  const firstName = sanitizeInput(String(body.firstName ?? 'there')).slice(0, 100);
  const propertyTitle = sanitizeInput(String(body.propertyTitle ?? '')).slice(0, 200);
  const bookingDate = sanitizeInput(String(body.bookingDate ?? '')).slice(0, 60);

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      {
        error: `Invalid drip type. Must be one of: ${VALID_TYPES.join(', ')}`,
      },
      { status: 400 }
    );
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  }

  let result: { success: boolean; error?: string };

  switch (type) {
    case 'welcome_newsletter':
      result = await sendDripWelcomeNewsletter(email, firstName);
      break;

    case 'host_onboarding':
      if (!propertyTitle) {
        return NextResponse.json(
          { error: 'propertyTitle is required for host_onboarding' },
          { status: 400 }
        );
      }
      result = await sendDripHostOnboarding(email, firstName, propertyTitle);
      break;

    case 'booking_followup':
      if (!propertyTitle) {
        return NextResponse.json(
          { error: 'propertyTitle is required for booking_followup' },
          { status: 400 }
        );
      }
      result = await sendDripBookingFollowUp(
        email,
        firstName,
        propertyTitle,
        bookingDate || 'your recent booking'
      );
      break;

    case 'abandoned_inquiry':
      if (!propertyTitle) {
        return NextResponse.json(
          { error: 'propertyTitle is required for abandoned_inquiry' },
          { status: 400 }
        );
      }
      result = await sendDripAbandonedInquiry(email, firstName, propertyTitle);
      break;

    default:
      return NextResponse.json({ error: 'Unknown drip type' }, { status: 400 });
  }

  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error ?? 'Send failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, type, recipient: email }, { status: 200 });
}
