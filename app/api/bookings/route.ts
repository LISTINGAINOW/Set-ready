import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bookingsData from '@/data/bookings.json';
import { getClientIp, isValidEmail, sanitizeObject, validateCsrf, writeAuditLog } from '@/lib/security';
import { requireAdminSession, requireUserSession } from '@/lib/auth-middleware';
import { createAdminClient } from '@/utils/supabase/admin';

let inMemoryBookings: Booking[] = (bookingsData.bookings || []) as Booking[];

interface BookingRequest {
  locationId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  productionType: string;
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
}

async function readBookings(): Promise<Booking[]> {
  return [...inMemoryBookings];
}

async function writeBookings(bookings: Booking[]) {
  inMemoryBookings = bookings;
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
      userId = verifySessionCookie(sessionCookie) ?? undefined;
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
      const bookings = await readBookings();
      return NextResponse.json({ bookings });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
  }

  // Otherwise require user session — fail-closed
  const userId = requireUserSession(request);
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

    const bookings = await readBookings();
    // Return bookings belonging to this user (by userId or email match)
    const userBookings = bookings.filter(
      (b) => b.userId === userId || (user && b.email === user.email)
    );
    return NextResponse.json({ bookings: userBookings });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
