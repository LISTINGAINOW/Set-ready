import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-middleware';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BOOKINGS_FILE = join(process.cwd(), 'data', 'bookings.json');

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAdminSession(request);
  if (auth !== true) return auth;

  try {
    const { status, notes } = await request.json();
    const data = JSON.parse(readFileSync(BOOKINGS_FILE, 'utf-8'));
    const idx = data.bookings.findIndex((b: { id: string }) => b.id === params.id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (status !== undefined) data.bookings[idx].status = status;
    if (notes !== undefined) data.bookings[idx].notes = notes;
    data.bookings[idx].updatedAt = new Date().toISOString();
    writeFileSync(BOOKINGS_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ booking: data.bookings[idx] });
  } catch (err) {
    console.error('Booking update error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
