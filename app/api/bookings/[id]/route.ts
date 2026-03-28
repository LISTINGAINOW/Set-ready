import { NextRequest, NextResponse } from 'next/server';
import bookingsData from '@/data/bookings.json';
import { requireAdminSession, requireUserSession } from '@/lib/auth-middleware';
import { createAdminClient } from '@/utils/supabase/admin';

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
      const result = requireUserSession(request);
      if (result instanceof NextResponse) return result;
      userId = result;
    }

    const body = await request.json();
    const { status } = body;

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

    bookings[bookingIndex].status = status;
    await writeBookings(bookings);

    return NextResponse.json({ booking: bookings[bookingIndex] });
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

    // CRIT-4: require auth — only booking owner or admin can delete
    const isAdmin = requireAdminSession(request) === true;
    let userId: string | null = null;
    if (!isAdmin) {
      const result = requireUserSession(request);
      if (result instanceof NextResponse) return result;
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
