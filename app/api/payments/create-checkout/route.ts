import { NextRequest, NextResponse } from 'next/server';
import { requireUserSession } from '@/lib/auth-middleware';
import { createAdminClient } from '@/utils/supabase/admin';
import { createCheckoutSession } from '@/lib/stripe';
import { getBookingById, getPropertySummary } from '@/lib/booking-payment-pipeline';

export async function POST(request: NextRequest) {
  const userId = requireUserSession(request);
  if (typeof userId !== 'string') {
    return userId;
  }

  try {
    const body = (await request.json()) as { bookingId?: string };
    const bookingId = body.bookingId?.trim();

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.renter_id && booking.renter_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (booking.status === 'confirmed' || booking.payment_status === 'paid') {
      return NextResponse.json({ error: 'Booking has already been paid' }, { status: 409 });
    }

    const property = await getPropertySummary(booking.property_id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const baseRate = Number(booking.base_rate ?? 0);
    const serviceFee = Number(booking.service_fee ?? 0);
    if (baseRate <= 0 || serviceFee < 0) {
      return NextResponse.json({ error: 'Booking pricing is invalid' }, { status: 400 });
    }

    const session = await createCheckoutSession({
      customerEmail: booking.contact_email,
      locationTitle: property.property_name ?? 'Property',
      bookingId: booking.id,
      propertyId: booking.property_id,
      baseRate,
      serviceFee,
      origin: request.nextUrl.origin,
    });

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('booking_requests')
      .update({
        stripe_checkout_session_id: session.id,
        payment_status: 'pending',
        status: 'pending_payment',
      })
      .eq('id', booking.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      url: session.url,
      bookingId: booking.id,
      sessionId: session.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
