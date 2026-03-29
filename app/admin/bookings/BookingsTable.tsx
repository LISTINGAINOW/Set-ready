'use client';
import { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import type { Booking } from './page';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'approved' | 'rejected' | 'cancelled' | 'completed';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Pending',   bg: 'bg-amber-100',  text: 'text-amber-800' },
  confirmed: { label: 'Confirmed', bg: 'bg-green-100',  text: 'text-green-800' },
  approved:  { label: 'Approved',  bg: 'bg-green-100',  text: 'text-green-800' },
  rejected:  { label: 'Rejected',  bg: 'bg-red-100',    text: 'text-red-800' },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-100',  text: 'text-slate-600' },
  completed: { label: 'Completed', bg: 'bg-blue-100',   text: 'text-blue-800' },
};

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'cancelled', label: 'Cancelled' },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function fmt(iso?: string) {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BookingsTable({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = bookings.filter((b) => {
    const matchStatus = filter === 'all' || b.status === filter;
    const q = search.toLowerCase();
    const name = (b.clientName ?? b.guestName ?? '').toLowerCase();
    const property = (b.propertyName ?? b.propertyId ?? '').toLowerCase();
    const matchSearch = !q || name.includes(q) || property.includes(q) || b.id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const { booking } = await res.json();
        setBookings((prev) => prev.map((b) => (b.id === id ? booking : b)));
      }
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client, property, ID\u2026"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.key ? 'bg-green-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1 opacity-70">
                  {bookings.filter((b) => b.status === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-medium text-slate-500">No bookings yet</p>
          <p className="mt-1 text-xs text-slate-400">Bookings will appear here when customers make reservations.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['ID', 'Property', 'Client', 'Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No bookings match your filter.</td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500">{b.id.slice(0, 12)}\u2026</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[140px] truncate">
                      {b.propertyName ?? b.propertyId ?? '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {b.clientName ?? b.guestName ?? '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {fmt(b.date ?? b.startDate ?? b.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      {b.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => updateStatus(b.id, 'confirmed')}
                            disabled={updating === b.id}
                            className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition"
                          >
                            {updating === b.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Approve'}
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, 'rejected')}
                            disabled={updating === b.id}
                            className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-400">Showing {filtered.length} of {bookings.length} bookings</p>
    </div>
  );
}
