import { NextRequest, NextResponse } from 'next/server';
import locationsData from '@/data/locations.json';
import { getClientIp, isValidEmail, sanitizeObject, validateCsrf, writeAuditLog } from '@/lib/security';
import { requireAdminSession, requireUserSession } from '@/lib/auth-middleware';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendBookingRequestConfirmation, sendOwnerBookingNotification, type BookingRecord } from '@/lib/email';
import { mapBookingRequestToApi, type BookingRequestRow } from '@/lib/booking-payment-pipeline';

export const dynamic = 'force-dynamic';

interface LocationData {
  id: string;
  name: string;
  hostName?: string;
  hostEmail?: string;
  hostPhone?: string;
}
const locations = locationsData as unknown as LocationData[];

interface BookingRequest {
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
  notes: string;
  baseRate?: number;
  serviceFee?: number;
  total?: number;
  productionCompany?: string;
  hasCoi?: boolean;
  hasFilmPermit?: boolean;
  holdHarmless?: boolean;
}

function combineDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

// Map a DB row to the legacy API shape, enriching with owner data from locations.json
function rowToApiShape(row: BookingRequestRow, locationRecord?: LocationData | null) {
  return {
    ...mapBookingRequestToApi(row, locationRecord?.name ?? null),
    ownerName: locationRecord?.hostName ?? null,
    ownerEmail: locationRecord?.hostEmail ?? null,
    ownerPhone: locationRecord?.hostPhone ?? null,
  };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (!validateCsrf(request)) {
      writeAuditLog('booking.csrf_failed', { ip });
      return NextResponse.json({ error: 'Security validation failed. Refresh and try again.' }, { status: 403 });
    }

    const sanitizedPayload = sanitizeObject((await request.json()) as Record<string, unknown>);
    const body = sanitizedPayload as unknown as BookingRequest;

    if (!body.locationId || !body.name || !body.email || !body.phone || !body.date || !body.startTime || !body.endTime || !body.productionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    // Attach userId from session if present (optional for booking creation)
    let userId: string | undefined;
    const sessionCookie = request.cookies.get('ds-session')?.value;
    if (sessionCookie) {
      const { verifySessionCookie } = await import('@/lib/auth-middleware');
      userId = (await verifySessionCookie(sessionCookie)) ?? undefined;
    }

    const locationRecord = locations.find((l) => l.id === body.locationId);
    const propertyName = locationRecord?.name ?? `Property ${body.locationId}`;

    // Build combined notes preserving crew size, budget, and special requirements
    const noteParts = [
      body.notes?.trim() ? body.notes.trim() : '',
      body.specialRequirements?.trim() ? `Special requirements: ${body.specialRequirements.trim()}` : '',
      body.budget?.trim() ? `Budget: ${body.budget.trim()}` : '',
      body.crewSize?.trim() ? `Crew size: ${body.crewSize.trim()}` : '',
    ].filter(Boolean);
    const combinedNotes = noteParts.join('\n') || null;

    const supabase = createAdminClient();

    // Insert into Supabase booking_requests table
    const { data: inserted, error: insertError } = await supabase
      .from('booking_requests')
      .insert({
        property_id: body.locationId,
        renter_id: userId ?? null,
        contact_name: body.name,
        contact_email: body.email,
        contact_phone: body.phone,
        production_type: body.productionType,
        company_name: body.productionCompany ?? '',
        booking_start: body.date ? combineDateTime(body.date, body.startTime ?? '00:00') : null,
        booking_end: body.date ? combineDateTime(body.date, body.endTime ?? '00:00') : null,
        notes: combinedNotes,
        base_rate: body.baseRate ?? null,
        service_fee: body.serviceFee ?? null,
        total_amount: body.total ?? null,
        damage_deposit_amount: 0,
        selected_time_slots: [],
        status: 'pending',
        payment_status: 'pending',
        // Legal fields from booking form
        hold_harmless_accepted: body.holdHarmless ?? false,
        tos_accepted: false,
        content_permission_accepted: false,
        permit_confirmed: body.hasFilmPermit ?? false,
        has_coi: body.hasCoi ?? false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[booking] Supabase insert error:', insertError);
      writeAuditLog('booking.db_error', { ip, error: insertError.message });
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    const newBooking = rowToApiShape(inserted as BookingRequestRow, locationRecord);
    writeAuditLog('booking.created', { ip, bookingId: newBooking.id, locationId: newBooking.locationId, email: newBooking.email });

    // Fire-and-forget: send confirmation email to renter + notification to owner
    const bookingRecord: BookingRecord = {
      id: newBooking.id,
      property_id: newBooking.locationId,
      contact_name: newBooking.name,
      contact_email: newBooking.email,
      company_name: body.productionCompany ?? '',
      production_type: newBooking.productionType,
      booking_start: newBooking.date,
      property_name: propertyName,
    };
    sendBookingRequestConfirmation(bookingRecord).catch((err) => {
      console.error('[booking] Failed to send renter confirmation email:', err);
    });
    if (locationRecord?.hostEmail) {
      sendOwnerBookingNotification(locationRecord.hostEmail, {
        bookingId: newBooking.id,
        propertyName,
        renterName: newBooking.name,
        renterEmail: newBooking.email,
        renterPhone: newBooking.phone,
        productionType: newBooking.productionType,
        date: newBooking.date,
        startTime: newBooking.startTime,
        endTime: newBooking.endTime,
        crewSize: body.crewSize,
        budget: body.budget,
        specialRequirements: body.specialRequirements,
        notes: body.notes,
      }).catch((err) => {
        console.error('[booking] Failed to send owner notification email:', err);
      });
    }

    return NextResponse.json({ booking: newBooking, message: 'Booking request created' }, { status: 201 });
  } catch (error) {
    console.error('Booking API error:', error);
    writeAuditLog('booking.error', { ip, error: error instanceof Error ? error.message : 'unknown_error' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// CRIT-3: GET requires auth. Regular users see only their own bookings; admins see all.
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();

  // Check if admin first
  const adminCheck = requireAdminSession(request);
  if (adminCheck === true) {
    try {
      const { data: rows, error } = await supabase
        .from('booking_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[booking] GET admin error:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
      }

      const bookings = (rows ?? []).map((row) => {
        const loc = locations.find((l) => l.id === row.property_id);
        return rowToApiShape(row as BookingRequestRow, loc);
      });
      return NextResponse.json({ bookings });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
  }

  // Otherwise require user session — fail-closed
  const userId = await requireUserSession(request);
  // If userId is not a plain string, it's an error response — return it
  if (typeof userId !== 'string') {
    return userId;
  }

  try {
    // Look up user email to filter bookings (for legacy email-based matching)
    const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();

    // Fetch bookings by renter_id (primary) or contact_email (legacy fallback)
    const conditions = [`renter_id.eq.${userId}`];
    if (user?.email) {
      conditions.push(`contact_email.eq.${user.email}`);
    }

    const { data: rows, error } = await supabase
      .from('booking_requests')
      .select('*')
      .or(conditions.join(','))
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[booking] GET user error:', error);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    const bookings = (rows ?? []).map((row) => {
      const loc = locations.find((l) => l.id === row.property_id);
      return rowToApiShape(row as BookingRequestRow, loc);
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
