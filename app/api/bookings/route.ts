import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bookingsData from '@/data/bookings.json';
import locationsData from '@/data/locations.json';
import { getClientIp, isValidEmail, sanitizeObject, validateCsrf, writeAuditLog } from '@/lib/security';
import { requireAdminSession, requireUserSession } from '@/lib/auth-middleware';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendBookingRequestConfirmation, sendOwnerBookingNotification, type BookingRecord } from '@/lib/email';

let inMemoryBookings: Booking[] = (bookingsData.bookings || []) as Booking[];

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
}

interface Booking extends BookingRequest {
  id: string;
  userId?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  createdAt: string;
  propertyName?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

async function readBookings(): Promise<Booking[]> {
  return [...inMemoryBookings];
}

async function writeBookings(bookings: Booking[]) {
  inMemoryBookings = bookings;
}

function enrichBookingsWithOwnerData(bookings: Booking[]) {
  return bookings.map((booking) => {
    const locationRecord = locations.find((location) => location.id === booking.locationId);

    if (!locationRecord) {
      return booking;
    }

    return {
      ...booking,
      ownerName: booking.ownerName ?? locationRecord.hostName ?? null,
      ownerEmail: booking.ownerEmail ?? locationRecord.hostEmail ?? null,
      ownerPhone: booking.ownerPhone ?? locationRecord.hostPhone ?? null,
    };
  });
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

    const bookings = await readBookings();
    const newBooking: Booking = {
      ...body,
      id: `booking_${uuidv4().slice(0, 8)}`,
      userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    await writeBookings(bookings);
    writeAuditLog('booking.created', { ip, bookingId: newBooking.id, locationId: newBooking.locationId, email: newBooking.email });

    // Fire-and-forget: send confirmation email to renter + notification to owner
    const locationRecord = locations.find((l) => l.id === newBooking.locationId);
    const propertyName = locationRecord?.name ?? `Property ${newBooking.locationId}`;
    const bookingRecord: BookingRecord = {
      id: newBooking.id,
      property_id: newBooking.locationId,
      contact_name: newBooking.name,
      contact_email: newBooking.email,
      company_name: '',
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
        crewSize: newBooking.crewSize,
        budget: newBooking.budget,
        specialRequirements: newBooking.specialRequirements,
        notes: newBooking.notes,
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
  // Check if admin first
  const adminCheck = requireAdminSession(request);
  if (adminCheck === true) {
    try {
      const bookings = enrichBookingsWithOwnerData(await readBookings());
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
    // Look up user email to filter bookings (bookings store email, not userId for legacy reasons)
    const supabase = createAdminClient();
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    const bookings = enrichBookingsWithOwnerData(await readBookings());
    // Return bookings belonging to this user (by userId or email match)
    const userBookings = bookings.filter(
      (b) => b.userId === userId || (user && b.email === user.email)
    );
    return NextResponse.json({ bookings: userBookings });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
