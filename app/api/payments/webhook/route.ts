import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { promises as fs } from 'fs';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const BOOKINGS_PATH = path.join(process.cwd(), 'data', 'bookings.json');

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
      try {
        const data = JSON.parse(await fs.readFile(BOOKINGS_PATH, 'utf-8'));
        const booking = data.bookings.find(
          (b: { id: string }) => b.id === bookingId
        );

        if (booking) {
          booking.status = 'confirmed';
          booking.stripeSessionId = session.id;
          booking.amountPaid = (session.amount_total ?? 0) / 100;
          booking.platformFee =
            ((session.amount_total ?? 0) - Math.round((session.amount_total ?? 0) / 1.1)) / 100;
          booking.paidAt = new Date().toISOString();
          await fs.writeFile(BOOKINGS_PATH, JSON.stringify(data, null, 2));
        }
      } catch (err) {
        console.error('Failed to update booking:', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
