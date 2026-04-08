import { NextRequest, NextResponse } from 'next/server';
import { getCheckoutSession } from '@/lib/stripe';
import { getBookingById, getPropertySummary, mapBookingRequestToApi } from '@/lib/booking-payment-pipeline';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await getCheckoutSession(sessionId);
    const bookingId = session.metadata?.booking_id;

    if (!bookingId) {
      return NextResponse.json({ error: 'Checkout session is missing booking metadata' }, { status: 404 });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const property = await getPropertySummary(booking.property_id);
    const locationItem = session.line_items?.data.find((item) =>
      item.description?.startsWith('Location Rental:')
    );

    return NextResponse.json({
      bookingId,
      paymentStatus: booking.payment_status ?? 'pending',
      bookingStatus: booking.status,
      locationTitle:
        property?.property_name ??
        locationItem?.description?.replace('Location Rental: ', '') ??
        'Location',
      amountTotal: session.amount_total ?? Math.round(Number(booking.total_amount ?? 0) * 100),
      customerEmail: session.customer_email ?? session.customer_details?.email ?? booking.contact_email,
      booking: mapBookingRequestToApi(booking, property?.property_name ?? null),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
