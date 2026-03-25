import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bookingsData from '@/data/bookings.json';
import { getClientIp, isValidEmail, sanitizeObject, validateCsrf, writeAuditLog } from '@/lib/security';

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

    const bookings = await readBookings();
    const newBooking: Booking = {
      ...body,
      id: `booking_${uuidv4().slice(0, 8)}`,
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

export async function GET() {
  try {
    const bookings = await readBookings();
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
