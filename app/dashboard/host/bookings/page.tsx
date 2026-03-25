'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Clock3, DollarSign, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCalendarRows, getHostBookings } from '@/lib/host-dashboard-data';
import type { HostBooking } from '@/lib/host-dashboard-data';

function statusClasses(status: HostBooking['status']) {
  if (status === 'confirmed') return 'border-green-500/30 bg-green-500/10 text-green-300';
  if (status === 'pending') return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200';
  if (status === 'rejected') return 'border-red-500/30 bg-red-500/10 text-red-300';
  return 'border-white/10 bg-white/5 text-white/70';
}

function calendarCellClasses(value: string) {
  if (value === 'Booked') return 'bg-blue-600/15 text-blue-200 border-blue-500/30';
  if (value === 'Pending') return 'bg-yellow-500/10 text-yellow-100 border-yellow-500/30';
  return 'bg-white/5 text-white/60 border-white/10';
}

export default function HostBookingsPage() {
  const [bookings, setBookings] = useState(getHostBookings());
  const [filter, setFilter] = useState<'all' | HostBooking['status']>('all');

  const filteredBookings = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const metrics = useMemo(() => {
    return {
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
      declined: bookings.filter((booking) => booking.status === 'rejected').length,
      projected: bookings
        .filter((booking) => booking.status === 'pending' || booking.status === 'confirmed')
        .reduce((sum, booking) => sum + booking.payout, 0),
    };
  }, [bookings]);

  const updateBooking = (id: string, status: HostBooking['status']) => {
    setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
  };

  const calendarRows = getCalendarRows();
  const filters: Array<{ id: 'all' | HostBooking['status']; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'rejected', label: 'Declined' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-8 text-white">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="mt-2 text-blue-100/70">Approve or decline requests, watch your schedule, and track payout impact.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none"><CardHeader className="pb-2"><CardTitle className="text-sm text-blue-100">Pending</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-white">{metrics.pending}</div></CardContent></Card>
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none"><CardHeader className="pb-2"><CardTitle className="text-sm text-blue-100">Confirmed</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-white">{metrics.confirmed}</div></CardContent></Card>
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none"><CardHeader className="pb-2"><CardTitle className="text-sm text-blue-100">Declined</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-white">{metrics.declined}</div></CardContent></Card>
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none"><CardHeader className="pb-2"><CardTitle className="text-sm text-blue-100">Projected payouts</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-white">${metrics.projected.toLocaleString()}</div></CardContent></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-white">Incoming requests</CardTitle>
                <p className="mt-2 text-sm text-blue-100/70">Mock moderation controls for accept / decline flows.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filter === item.id ? 'border-blue-500 bg-blue-500/15 text-blue-200' : 'border-white/10 bg-black/30 text-white/70 hover:border-blue-500/40 hover:text-white'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="rounded-3xl border border-white/10 bg-black/40 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-white">{booking.name}</p>
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusClasses(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-blue-100/75">{booking.productionType} • {booking.date} • {booking.startTime}–{booking.endTime}</p>
                    <p className="mt-1 text-sm text-white/65">{booking.email} • {booking.phone} • {booking.guestCount} guests</p>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-200/60">Host payout</p>
                    <p className="mt-1 text-2xl font-bold text-white">${booking.payout.toLocaleString()}</p>
                    <p className="mt-1 text-sm text-white/60">Requested {booking.requestAge}</p>
                  </div>
                </div>

                {booking.notes && <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">{booking.notes}</p>}

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => updateBooking(booking.id, 'confirmed')}
                    disabled={booking.status === 'confirmed'}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 bg-transparent text-white hover:border-blue-500 hover:text-blue-300"
                    onClick={() => updateBooking(booking.id, 'rejected')}
                    disabled={booking.status === 'rejected'}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}

            {filteredBookings.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-10 text-center text-sm text-white/60">
                No bookings in this filter.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><CalendarClock className="h-5 w-5 text-blue-300" /> Booking calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-4 bg-white/5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/70">
                  <div className="px-4 py-3">Date</div>
                  <div className="px-4 py-3">AM</div>
                  <div className="px-4 py-3">PM</div>
                  <div className="px-4 py-3">Eve</div>
                </div>
                {calendarRows.map((row) => (
                  <div key={row.date} className="grid grid-cols-4 border-t border-white/10 text-sm">
                    <div className="px-4 py-3 font-medium text-white">{row.date}</div>
                    {[row.morning, row.afternoon, row.evening].map((value, index) => (
                      <div key={`${row.date}-${index}`} className="px-2 py-2">
                        <div className={`rounded-xl border px-3 py-2 text-center text-xs font-medium ${calendarCellClasses(value)}`}>{value}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
            <CardHeader>
              <CardTitle className="text-white">Workflow notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-white/75">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                <Clock3 className="mt-0.5 h-4 w-4 text-blue-300" />
                <p>Guest messaging is intentionally skipped for now, but this layout leaves space for a future conversation thread.</p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                <DollarSign className="mt-0.5 h-4 w-4 text-blue-300" />
                <p>Payout math is mock-based and derived from listing rates so it can be swapped with a real settlement endpoint later.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
