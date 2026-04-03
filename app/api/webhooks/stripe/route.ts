import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { sendPaymentSuccessful, sendPaymentFailed, sendBookingConfirmedToRenter, sendNewBookingToOwner, sendPaymentReceipt, type BookingRecord } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!stripeSecretKey) {
      return new Response('Missing Stripe secret key', { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey);

    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig || !webhookSecret) {
      return new Response('Missing signature or webhook secret', { status: 400 });
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session completed: ${session.id}`);

        // Update booking status and send emails
        if (session.metadata?.booking_id) {
          const { data: bookingData, error } = await supabase
            .from('booking_requests')
            .update({
              status: 'approved',
              stripe_session_id: session.id,
              reviewed_at: new Date().toISOString(),
            })
            .eq('id', session.metadata.booking_id)
            .select()
            .single();

          if (error) {
            console.error('Failed to update booking:', error);
          } else if (bookingData) {
            // Look up property and owner details then send emails — fire-and-forget
            void (async () => {
              try {
                const { data: prop } = await supabase
                  .from('properties')
                  .select('property_name, owner_email')
                  .eq('id', bookingData.property_id)
                  .single();

                const propertyName = prop?.property_name ?? `Property ${bookingData.property_id}`;
                const ownerEmail = prop?.owner_email;

                const booking: BookingRecord = { ...bookingData, property_name: propertyName };

                // Send confirmation email to renter
                await sendBookingConfirmedToRenter(booking);

                // Send new booking notification to owner
                if (ownerEmail) {
                  await sendNewBookingToOwner(ownerEmail, booking);
                }
              } catch (err) {
                console.error('Failed to send checkout completion emails:', err);
              }
            })();
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);

        // Update booking status in database
        if (paymentIntent.metadata?.booking_id) {
          const { data: bookingData, error } = await supabase
            .from('booking_requests')
            .update({
              status: 'approved',
              stripe_payment_intent_id: paymentIntent.id,
              reviewed_at: new Date().toISOString(),
            })
            .eq('id', paymentIntent.metadata.booking_id)
            .select()
            .single();

          if (error) {
            console.error('Failed to update booking:', error);
          } else if (bookingData) {
            // Look up property name then send confirmation email — fire-and-forget
            void (async () => {
              let propertyName: string | undefined;
              try {
                const { data: prop } = await supabase
                  .from('properties')
                  .select('property_name')
                  .eq('id', bookingData.property_id)
                  .single();
                propertyName = prop?.property_name ?? undefined;
              } catch { /* non-blocking */ }
              const booking: BookingRecord = { ...bookingData, property_name: propertyName };
              await sendPaymentSuccessful(booking);
              
              // Send payment receipt
              await sendPaymentReceipt(booking, paymentIntent.amount / 100, paymentIntent.currency);
            })();
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.id}`);

        // Update booking status
        if (paymentIntent.metadata?.booking_id) {
          const failReason = paymentIntent.last_payment_error?.message ?? 'Payment could not be processed.';
          const { data: bookingData, error } = await supabase
            .from('booking_requests')
            .update({
              status: 'rejected',
              admin_notes: `Payment failed: ${failReason}`,
            })
            .eq('id', paymentIntent.metadata.booking_id)
            .select()
            .single();

          if (error) {
            console.error('Failed to update booking:', error);
          } else if (bookingData) {
            // Look up property name then send failure email — fire-and-forget
            void (async () => {
              let propertyName: string | undefined;
              try {
                const { data: prop } = await supabase
                  .from('properties')
                  .select('property_name')
                  .eq('id', bookingData.property_id)
                  .single();
                propertyName = prop?.property_name ?? undefined;
              } catch { /* non-blocking */ }
              const booking: BookingRecord = { ...bookingData, property_name: propertyName };
              await sendPaymentFailed(booking, failReason);
            })();
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log(`Charge refunded: ${charge.id}`);

        // Update booking status
        if (charge.metadata?.booking_id) {
          const { error } = await supabase
            .from('booking_requests')
            .update({
              status: 'cancelled',
              admin_notes: `Refund processed: ${charge.amount / 100} ${charge.currency.toUpperCase()}`,
            })
            .eq('id', charge.metadata.booking_id);

          if (error) {
            console.error('Failed to update booking:', error);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice paid: ${invoice.id}`);
        // Handle invoice payment
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment failed: ${invoice.id}`);
        // Send email to renter about failed payment
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Acknowledge receipt of event
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return new Response(error.message, { status: 500 });
  }
}
