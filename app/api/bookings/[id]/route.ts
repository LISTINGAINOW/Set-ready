import { NextRequest, NextResponse } from 'next/server';
import bookingsData from '@/data/bookings.json';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const bookings = await readBookings();
    const filtered = bookings.filter(b => b.id !== id);

    if (filtered.length === bookings.length) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    await writeBookings(filtered);
    return NextResponse.json({ message: 'Booking deleted' });
  } catch (error) {
    console.error('Booking delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}