import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    })
  : null;

export async function GET(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    const locationItem = session.line_items?.data.find(
      (item) => item.description?.startsWith('Location Rental:')
    );

    return NextResponse.json({
      locationTitle: locationItem?.description?.replace('Location Rental: ', '') ?? 'Location',
      amountTotal: session.amount_total ?? 0,
      customerEmail: session.customer_email ?? session.customer_details?.email ?? '',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
