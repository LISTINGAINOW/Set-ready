import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, requireUserSession } from '@/lib/auth-middleware';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  sendBookingApproved,
  sendBookingCancelled,
  sendBookingRejected,
  type BookingRecord,
} from '@/lib/email';
import {
  getBookingById,
  getPropertySummary,
  mapBookingRequestToApi,
  type BookingRequestRow,
} from '@/lib/booking-payment-pipeline';

async function loadAuthorizedBooking(request: NextRequest, bookingId: string) {
  const isAdmin = requireAdminSession(request) === true;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    return { error: NextResponse.json({ error: 'Booking not found' }, { status: 404 }) };
  }

  if (isAdmin) {
    return { booking, isAdmin, userId: null as string | null };
  }

  const userId = requireUserSession(request);
  if (typeof userId !== 'string') {
    return { error: userId };
  }

  if (booking.renter_id && booking.renter_id !== userId) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { booking, isAdmin, userId };
}

function toBookingRecord(booking: BookingRequestRow, propertyName?: string | null): BookingRecord {

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
    status: booking.status,
    property_name: propertyName ?? undefined,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await loadAuthorizedBooking(request, id);
    if ('error' in result) {
      return result.error;
    }

    const property = await getPropertySummary(result.booking.property_id);
    return NextResponse.json({
      booking: {
        ...mapBookingRequestToApi(result.booking, property?.property_name ?? null),
        address: property?.address ?? null,
        city: property?.city ?? null,
        state: property?.state ?? null,
        ownerName: property?.owner_name ?? null,
        ownerEmail: property?.owner_email ?? null,
      },
    });
  } catch (error) {
    console.error('Booking GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await loadAuthorizedBooking(request, id);
    if ('error' in result) {
      return result.error;
    }

    const body = (await request.json()) as {
      action?: 'approve' | 'reject' | 'cancel';
      status?: string;
      reason?: string;
      adminNotes?: string;
    };

    let nextStatus = body.status?.trim() ?? '';
    if (body.action === 'approve') nextStatus = 'approved';
    if (body.action === 'reject') nextStatus = 'rejected';
    if (body.action === 'cancel') nextStatus = 'cancelled';
    if (nextStatus === 'confirmed') nextStatus = 'confirmed';

    const allowedStatuses = ['approved', 'confirmed', 'rejected', 'cancelled', 'pending_payment'];
    if (!allowedStatuses.includes(nextStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (!result.isAdmin && nextStatus !== 'cancelled') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();
    const updatePayload: Record<string, unknown> = {
      status: nextStatus,
      reviewed_at: new Date().toISOString(),
      admin_notes: body.adminNotes ?? body.reason ?? null,
    };

    if (nextStatus === 'cancelled') {
      updatePayload.payment_status = 'cancelled';
    }

    if (nextStatus === 'confirmed') {
      updatePayload.payment_status = 'paid';
    }

    const { data, error } = await supabase
      .from('booking_requests')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        id,
        property_id,
        renter_id,
        company_name,
        contact_name,
        contact_email,
        contact_phone,
        production_type,
        booking_start,
        booking_end,
        notes,
        damage_deposit_amount,
        base_rate,
        service_fee,
        total_amount,
        selected_time_slots,
        status,
        payment_status,
        stripe_payment_intent_id,
        stripe_checkout_session_id,
        payment_failed_reason,
        reviewed_at,
        created_at,
        updated_at
      `)
      .single();

    if (error || !data) {
      throw error ?? new Error('Failed to update booking');
    }

    const property = await getPropertySummary(data.property_id);
    const bookingRecord = toBookingRecord(data, property?.property_name ?? null);

    if (nextStatus === 'approved') {
      const bookingUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://setvenue.com'}/producer/bookings`;
      void sendBookingApproved(bookingRecord, bookingUrl);
    } else if (nextStatus === 'rejected') {
      void sendBookingRejected(
        bookingRecord,
        body.reason || body.adminNotes || 'Unfortunately this booking could not be approved.'
      );
    } else if (nextStatus === 'cancelled') {
      void sendBookingCancelled(bookingRecord);
    }

    return NextResponse.json({ booking: mapBookingRequestToApi(data, property?.property_name ?? null) });
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await loadAuthorizedBooking(request, id);
    if ('error' in result) {
      return result.error;
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('booking_requests')
      .update({
        status: 'cancelled',
        payment_status: 'cancelled',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    const property = await getPropertySummary(result.booking.property_id);
    void sendBookingCancelled(toBookingRecord(result.booking, property?.property_name ?? null));

    return NextResponse.json({ message: 'Booking cancelled' });
  } catch (error) {
    console.error('Booking delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
