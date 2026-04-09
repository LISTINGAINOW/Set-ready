import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (stripeClient) return stripeClient;

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  stripeClient = new Stripe(apiKey, {
    apiVersion: '2026-02-25.clover',
  });
  return stripeClient;
}

export async function createPaymentIntent(
  amount: number,
  currency: string,
  metadata: Record<string, string>,
  customerEmail?: string
) {
  try {
    const stripe = getStripeClient();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      receipt_email: customerEmail,
      description: `SetVenue Booking - ${metadata.property_id}`,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

export async function createCheckoutSession(input: {
  customerEmail: string;
  locationTitle: string;
  bookingId: string;
  propertyId: string;
  baseRate: number;
  serviceFee: number;
  origin: string;
}) {
  const stripe = getStripeClient();

  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: input.customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Location Rental: ${input.locationTitle}`,
          },
          unit_amount: Math.round(input.baseRate * 100),
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'SetVenue Service Fee (10%)',
          },
          unit_amount: Math.round(input.serviceFee * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${input.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/booking/confirmation?bookingId=${encodeURIComponent(input.bookingId)}`,
    metadata: {
      booking_id: input.bookingId,
      property_id: input.propertyId,
    },
    payment_intent_data: {
      metadata: {
        booking_id: input.bookingId,
        property_id: input.propertyId,
      },
    },
  });
}

export async function getCheckoutSession(sessionId: string) {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  });
}

export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const stripe = getStripeClient();
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}

export async function refundPayment(paymentIntentId: string, reason?: string) {
  try {
    const stripe = getStripeClient();

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: (reason as Stripe.RefundCreateParams.Reason | undefined) || 'requested_by_customer',
    });
    return refund;
  } catch (error) {
    console.error('Error refunding payment:', error);
    throw error;
  }
}

export async function cancelPaymentIntent(paymentIntentId: string) {
  try {
    const stripe = getStripeClient();
    return await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (error) {
    console.error('Error cancelling payment intent:', error);
    throw error;
  }
}
