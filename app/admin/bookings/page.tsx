import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { readFileSync } from 'fs';
import { join } from 'path';
import BookingsTable from './BookingsTable';

export interface Booking {
  id: string;
  propertyId?: string;
  propertyName?: string;
  clientName?: string;
  guestName?: string;
  clientEmail?: string;
  date?: string;
  startDate?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'approved' | 'completed';
  total?: number;
  amount?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export default function AdminBookingsPage() {
  const token = cookies().get('admin-session')?.value;
  if (!token || !verifyAdminToken(token)) redirect('/admin/login');

  const raw = readFileSync(join(process.cwd(), 'data', 'bookings.json'), 'utf-8');
  const { bookings }: { bookings: Booking[] } = JSON.parse(raw);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
        <p className="mt-1 text-sm text-slate-500">{bookings.length} total bookings</p>
      </div>
      <BookingsTable initialBookings={bookings} />
    </div>
  );
}
