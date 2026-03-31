import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripeClient() {
  if (stripeClient) return stripeClient;

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  stripeClient = new Stripe(apiKey);
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
      amount: Math.round(amount * 100), // Convert to cents
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
      reason: (reason as any) || 'requested_by_customer',
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
