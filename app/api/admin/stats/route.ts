import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-middleware';
import { readFileSync } from 'fs';
import { join } from 'path';

function readData<T>(filename: string): T {
  const content = readFileSync(join(process.cwd(), 'data', filename), 'utf-8');
  return JSON.parse(content);
}

export async function GET(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth !== true) return auth;

  try {
    const locations = readData<unknown[]>('locations.json');
    const { bookings } = readData<{ bookings: Array<{ status: string; total?: number; amount?: number }> }>('bookings.json');
    const { conversations } = readData<{ conversations: Array<{ unreadCount: number }> }>('messages.json');
    const { leads } = readData<{ leads: Array<{ status?: string }> }>('leads.json');

    const totalProperties = locations.length;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total ?? b.amount ?? 0), 0);
    const totalMessages = conversations.length;
    const unreadMessages = conversations.filter((c) => c.unreadCount > 0).length;
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => !l.status || l.status === 'new').length;

    return NextResponse.json({
      totalProperties,
      totalBookings,
      pendingBookings,
      totalRevenue,
      totalMessages,
      unreadMessages,
      totalLeads,
      newLeads,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
