import { NextRequest, NextResponse } from 'next/server';
import bookingsData from '@/data/bookings.json';
import locationsData from '@/data/locations.json';
import { requireAdminSession, requireUserSession } from '@/lib/auth-middleware';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  sendBookingApproved,
  sendBookingRejected,
  sendBookingCancelled,
  type BookingRecord,
} from '@/lib/email';

interface Booking {
  id: string;
  locationId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  productionType: string;
  notes: string;
  userId?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  createdAt: string;
}

// In-memory store for new bookings (doesn't persist across serverless invocations)
let inMemoryBookings: Booking[] = (bookingsData.bookings || []) as Booking[];

interface LocationData { id: string; name: string; }
const locations = locationsData as unknown as LocationData[];

async function readBookings(): Promise<Booking[]> {
  // Combine static data with in-memory bookings
  return [...inMemoryBookings];
}

async function writeBookings(bookings: Booking[]) {
  // Update in-memory store only
  inMemoryBookings = bookings;
}

// CRIT-4: Helper to verify a user owns a booking
async function userOwnsBooking(userId: string, booking: Booking): Promise<boolean> {
  if (booking.userId === userId) return true;
  // Fall back to email match for legacy bookings created before userId tracking
  const supabase = createAdminClient();
  const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();
  return !!user && booking.email === user.email;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // CRIT-4: require auth — only booking owner or admin can modify
    const isAdmin = requireAdminSession(request) === true;
    let userId: string | null = null;
    if (!isAdmin) {
      const result = await requireUserSession(request);
      if (typeof result !== 'string') return result;
      userId = result;
    }

    const body = await request.json();
    const { status, reason } = body as { status: string; reason?: string };

    if (!status || !['pending', 'confirmed', 'rejected', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const bookings = await readBookings();
    const bookingIndex = bookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Non-admin users can only update their own booking
    if (!isAdmin && userId) {
      const owns = await userOwnsBooking(userId, bookings[bookingIndex]);
      if (!owns) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const prevStatus = bookings[bookingIndex].status;
    bookings[bookingIndex].status = status as Booking['status'];
    await writeBookings(bookings);

    // Fire-and-forget status change emails (only on actual change)
    if (status !== prevStatus) {
      const booking = bookings[bookingIndex];
      const locationRecord = locations.find((l) => l.id === booking.locationId);
      const propertyName = locationRecord?.name ?? `Property ${booking.locationId}`;
      const bookingRecord: BookingRecord = {
        id: booking.id,
        property_id: booking.locationId,
        contact_name: booking.name,
        contact_email: booking.email,
        company_name: '',
        production_type: booking.productionType,
        booking_start: booking.date,
        property_name: propertyName,
      };
      if (status === 'confirmed') {
        const bookingUrl = `https://setvenue.com/dashboard/bookings`;
        sendBookingApproved(bookingRecord, bookingUrl).catch((err) => {
          console.error('[booking] Failed to send approval email:', err);
        });
      } else if (status === 'rejected') {
        sendBookingRejected(
          bookingRecord,
          reason || 'Unfortunately the dates or production type are not available. Please try different dates or browse other venues.'
        ).catch((err) => {
          console.error('[booking] Failed to send rejection email:', err);
        });
      } else if (status === 'cancelled') {
        sendBookingCancelled(bookingRecord).catch((err) => {
          console.error('[booking] Failed to send cancellation email:', err);
        });
      }
    }

    return NextResponse.json({ booking: bookings[bookingIndex] });
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const isAdmin = requireAdminSession(request) === true;
    let userId: string | null = null;
    if (!isAdmin) {
      const result = await requireUserSession(request);
      if (typeof result !== 'string') return result;
      userId = result;
    }

    const bookings = await readBookings();
    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!isAdmin && userId) {
      const owns = await userOwnsBooking(userId, booking);
      if (!owns) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Booking GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // CRIT-4: require auth — only booking owner or admin can delete
    const isAdmin = requireAdminSession(request) === true;
    let userId: string | null = null;
    if (!isAdmin) {
      const result = await requireUserSession(request);
      if (typeof result !== 'string') return result;
      userId = result;
    }

    const bookings = await readBookings();
    const booking = bookings.find(b => b.id === id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Non-admin users can only delete their own booking
    if (!isAdmin && userId) {
      const owns = await userOwnsBooking(userId, booking);
      if (!owns) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const filtered = bookings.filter(b => b.id !== id);
    await writeBookings(filtered);
    return NextResponse.json({ message: 'Booking deleted' });
  } catch (error) {
    console.error('Booking delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
