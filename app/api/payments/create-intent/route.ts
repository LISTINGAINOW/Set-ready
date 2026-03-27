import { createClient } from '@/utils/supabase/server';
import { createPaymentIntent } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, amount, propertyId, rentalHours } = body;

    if (!bookingId || !amount || !propertyId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from('booking_requests')
      .select('id, company_name, contact_email, status')
      .eq('id', bookingId)
      .eq('renter_id', user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(
      amount,
      'usd',
      {
        booking_id: bookingId,
        property_id: propertyId,
        user_id: user.id,
        rental_hours: rentalHours?.toString() || '0',
      },
      booking.contact_email
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
