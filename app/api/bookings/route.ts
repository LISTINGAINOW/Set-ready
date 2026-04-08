import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIp,
  isValidEmail,
  sanitizeObject,
  validateCsrf,
  writeAuditLog,
} from '@/lib/security';
import { requireAdminSession, requireUserSession } from '@/lib/auth-middleware';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  createPendingPaymentBooking,
  getPropertySummary,
  mapBookingRequestToApi,
  normalizeBookingNotes,
  type BookingRequestRow,
} from '@/lib/booking-payment-pipeline';

interface BookingRequestPayload {
  locationId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  productionType: string;
  crewSize?: string;
  budget?: string;
  specialRequirements?: string;
  notes?: string;
  baseRate?: number;
  serviceFee?: number;
  securityDeposit?: number;
  total?: number;
  selectedTimeSlots?: string[];
  securityDepositRequiredWhen?: string;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (!validateCsrf(request)) {
      writeAuditLog('booking.csrf_failed', { ip });
      return NextResponse.json(
        { error: 'Security validation failed. Refresh and try again.' },
        { status: 403 }
      );
    }

    const userId = requireUserSession(request);
    if (typeof userId !== 'string') {
      return userId;
    }

    const sanitizedPayload = sanitizeObject((await request.json()) as Record<string, unknown>);
    const body = sanitizedPayload as unknown as BookingRequestPayload;

    if (
      !body.locationId ||
      !body.name ||
      !body.email ||
      !body.phone ||
      !body.date ||
      !body.startTime ||
      !body.endTime ||
      !body.productionType
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    const property = await getPropertySummary(body.locationId);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const booking = await createPendingPaymentBooking({
      propertyId: body.locationId,
      renterId: userId,
      contactName: body.name,
      contactEmail: body.email,
      contactPhone: body.phone,
      productionType: body.productionType,
      bookingDate: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      notes: normalizeBookingNotes({
        notes: body.notes,
        specialRequirements: body.specialRequirements,
        budget: body.budget,
        crewSize: body.crewSize,
        securityDepositRequiredWhen: body.securityDepositRequiredWhen,
      }),
      companyName: '',
      securityDepositAmount: Number(body.securityDeposit ?? 0),
      baseRate: Number(body.baseRate ?? 0),
      serviceFee: Number(body.serviceFee ?? 0),
      totalAmount: Number(body.total ?? 0),
      selectedTimeSlots: Array.isArray(body.selectedTimeSlots) ? body.selectedTimeSlots : [],
    });

    writeAuditLog('booking.pending_payment_created', {
      ip,
      bookingId: booking.id,
      propertyId: booking.property_id,
      email: booking.contact_email,
      renterId: userId,
    });

    return NextResponse.json(
      {
        booking: mapBookingRequestToApi(booking, property.property_name),
        message: 'Pending payment booking created',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking API error:', error);
    writeAuditLog('booking.error', {
      ip,
      error: error instanceof Error ? error.message : 'unknown_error',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const adminResult = requireAdminSession(request);
  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('booking_requests')
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
      .order('created_at', { ascending: false });

    if (adminResult !== true) {
      const userId = requireUserSession(request);
      if (typeof userId !== 'string') {
        return userId;
      }

      query = query.eq('renter_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const bookings = (data ?? []) as BookingRequestRow[];
    const propertyIds = Array.from(new Set(bookings.map((booking) => booking.property_id).filter(Boolean)));

    let propertyNameMap: Record<string, string> = {};
    if (propertyIds.length > 0) {
      const { data: properties } = await supabase
        .from('properties')
        .select('id, property_name')
        .in('id', propertyIds);

      propertyNameMap = Object.fromEntries(
        (properties ?? []).map((property) => [String(property.id), property.property_name ?? 'Property'])
      );
    }

    return NextResponse.json({
      bookings: bookings.map((booking) =>
        mapBookingRequestToApi(booking, propertyNameMap[booking.property_id] ?? null)
      ),
    });
  } catch (error) {
    console.error('Booking GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
