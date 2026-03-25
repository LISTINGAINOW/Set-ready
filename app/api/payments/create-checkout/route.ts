import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, location_id, amount, guest_email, location_title } = body;

    if (!booking_id || !location_id || !amount || !guest_email || !location_title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const baseAmount = Math.round(Number(amount) * 100); // cents
    const platformFee = Math.round(baseAmount * 0.1); // 10% guest fee

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: guest_email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Location Rental: ${location_title}`,
            },
            unit_amount: baseAmount,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'SetVenue Service Fee (10%)',
            },
            unit_amount: platformFee,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/booking/cancel`,
      metadata: {
        booking_id,
        location_id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
