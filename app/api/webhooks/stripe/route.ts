import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  sendOwnerBookingNotification,
  sendPaymentFailed,
  sendPaymentSuccessful,
  type BookingRecord,
} from '@/lib/email';
import { getPropertySummary } from '@/lib/booking-payment-pipeline';
import { getStripeClient } from '@/lib/stripe';

function toBookingRecord(
  booking: {
    id: string;
    property_id: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    company_name: string | null;
    production_type: string;
    booking_start: string | null;
    booking_end: string | null;
    damage_deposit_amount: number | null;
    total_amount: number | null;
    status: string;
    notes: string | null;
  },
  propertyName?: string | null
): BookingRecord {
  return {
    id: booking.id,
    property_id: booking.property_id,
    contact_name: booking.contact_name,
    contact_email: booking.contact_email,
    company_name: booking.company_name ?? '',
    production_type: booking.production_type,
    booking_start: booking.booking_start,
    booking_end: booking.booking_end,
    damage_deposit_amount: Number(booking.damage_deposit_amount ?? 0),
    total_amount: Number(booking.total_amount ?? 0),
    status: booking.status,
    property_name: propertyName ?? undefined,
  };
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    if (!webhookSecret) {
      return new Response('Missing Stripe webhook secret', { status: 400 });
    }

    const stripe = getStripeClient();
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      return new Response('Missing stripe signature', { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown webhook signature error';
      console.error(`Webhook signature verification failed: ${message}`);
      return new Response(`Webhook Error: ${message}`, { status: 400 });
    }

    const supabase = createAdminClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        // Primary handler: Stripe copies session metadata to the session object,
        // so booking_id is reliably present here. This is the correct place to
        // mark the booking confirmed/paid.
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;
        if (!bookingId) break;

        const { data, error } = await supabase
          .from('booking_requests')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            stripe_payment_intent_id:
              typeof session.payment_intent === 'string' ? session.payment_intent : null,
            stripe_checkout_session_id: session.id,
            payment_failed_reason: null,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', bookingId)
          .select(`
            id,
            property_id,
            contact_name,
            contact_email,
            contact_phone,
            company_name,
            production_type,
            booking_start,
            booking_end,
            notes,
            damage_deposit_amount,
            total_amount,
            status
          `)
          .single();

        if (error || !data) {
          console.error('Failed to update booking after checkout.session.completed:', error);
          break;
        }

        const property = await getPropertySummary(data.property_id);
        const bookingRecord = toBookingRecord(data, property?.property_name ?? null);
        await sendPaymentSuccessful(bookingRecord);

        if (property?.owner_email) {
          await sendOwnerBookingNotification(property.owner_email, {
            bookingId: data.id,
            propertyName: property.property_name ?? 'Property',
            renterName: data.contact_name,
            renterEmail: data.contact_email,
            renterPhone: data.contact_phone,
            productionType: data.production_type,
            date: data.booking_start ? new Date(data.booking_start).toLocaleDateString('en-US') : 'TBD',
            startTime: data.booking_start ? new Date(data.booking_start).toISOString().slice(11, 16) : undefined,
            endTime: data.booking_end ? new Date(data.booking_end).toISOString().slice(11, 16) : undefined,
            notes: data.notes ?? undefined,
          });
        }
        break;
      }

      // NOTE: payment_intent.succeeded is intentionally NOT handled here.
      // Stripe does not copy checkout session metadata to PaymentIntents, so
      // paymentIntent.metadata.booking_id would always be empty when using
      // Checkout. The checkout.session.completed case above is the correct
      // handler for the confirmed/paid flow.

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.booking_id;
        if (!bookingId) break;

        const failReason =
          paymentIntent.last_payment_error?.message ?? 'Payment could not be processed.';

        const { data, error } = await supabase
          .from('booking_requests')
          .update({
            status: 'pending_payment',
            payment_status: 'failed',
            stripe_payment_intent_id: paymentIntent.id,
            payment_failed_reason: failReason,
          })
          .eq('id', bookingId)
          .select(`
            id,
            property_id,
            contact_name,
            contact_email,
            contact_phone,
            company_name,
            production_type,
            booking_start,
            booking_end,
            notes,
            damage_deposit_amount,
            total_amount,
            status
          `)
          .single();

        if (error || !data) {
          console.error('Failed to update booking after payment failure:', error);
          break;
        }

        const property = await getPropertySummary(data.property_id);
        await sendPaymentFailed(toBookingRecord(data, property?.property_name ?? null), failReason);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;
        if (!bookingId) break;

        const { error } = await supabase
          .from('booking_requests')
          .update({
            status: 'pending_payment',
            payment_status: 'expired',
            stripe_checkout_session_id: session.id,
          })
          .eq('id', bookingId);

        if (error) {
          console.error('Failed to mark checkout session expired:', error);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const bookingId = charge.metadata?.booking_id;
        if (!bookingId) break;

        const { error } = await supabase
          .from('booking_requests')
          .update({
            status: 'cancelled',
            payment_status: 'refunded',
            payment_failed_reason: `Refund processed: ${charge.amount / 100} ${charge.currency.toUpperCase()}`,
          })
          .eq('id', bookingId);

        if (error) {
          console.error('Failed to update refunded booking:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown webhook error';
    console.error('Webhook handler error:', error);
    return new Response(message, { status: 500 });
  }
}
