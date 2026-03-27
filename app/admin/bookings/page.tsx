'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronLeft,
  Search,
  FileText,
  Shield,
  RefreshCw,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface BookingRequest {
  id: string;
  property_id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  production_type: string;
  id_document_url: string | null;
  coi_document_url: string | null;
  coi_expiry_date: string | null;
  damage_deposit_amount: number;
  hold_harmless_accepted: boolean;
  hold_harmless_accepted_at: string | null;
  tos_accepted: boolean;
  tos_accepted_at: string | null;
  content_permission_accepted: boolean;
  permit_confirmed: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  admin_notes: string | null;
  reviewed_at: string | null;
  booking_start: string | null;
  booking_end: string | null;
  notes: string | null;
  created_at: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
  approved:  { label: 'Approved',  bg: 'bg-green-100',  text: 'text-green-800',  icon: CheckCircle },
  rejected:  { label: 'Rejected',  bg: 'bg-red-100',    text: 'text-red-800',    icon: XCircle },
  completed: { label: 'Completed', bg: 'bg-blue-100',   text: 'text-blue-800',   icon: CheckCircle },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-100',  text: 'text-slate-600',  icon: XCircle },
};

const TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'approved',  label: 'Approved' },
  { key: 'rejected',  label: 'Rejected' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function CheckBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
      <CheckCircle className="w-3.5 h-3.5" /> Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
      <XCircle className="w-3.5 h-3.5" /> No
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AdminBookingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<BookingRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // ── Auth ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    const saved = localStorage.getItem('adminPassword');
    if (saved) {
      setIsAuthenticated(true);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        localStorage.setItem('adminPassword', password);
        setIsAuthenticated(true);
      } else {
        setAuthError('Incorrect password');
      }
    } catch {
      setAuthError('Login failed. Try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  // ── Fetch bookings ─────────────────────────────────────────────────────────

  async function fetchBookings() {
    setLoading(true);
    setFetchError('');
    try {
      const pw = localStorage.getItem('adminPassword') ?? '';
      const res = await fetch('/api/bookings/protected', {
        headers: { Authorization: `Bearer ${pw}` },
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } catch {
      setFetchError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated]);

  // ── Update status ──────────────────────────────────────────────────────────

  async function handleStatusUpdate(id: string, status: string) {
    setUpdating(true);
    setUpdateError('');
    try {
      const pw = localStorage.getItem('adminPassword') ?? '';
      const res = await fetch('/api/bookings/protected', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pw}`,
        },
        body: JSON.stringify({ id, status, adminNotes }),
      });
      if (!res.ok) throw new Error('Update failed');
      const { booking } = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === id ? booking : b)));
      setSelected(booking);
    } catch {
      setUpdateError('Failed to update. Try again.');
    } finally {
      setUpdating(false);
    }
  }

  // ── Filtered data ──────────────────────────────────────────────────────────

  const filtered = bookings.filter((b) => {
    const matchStatus = filter === 'all' || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.company_name.toLowerCase().includes(q) ||
      b.contact_email.toLowerCase().includes(q) ||
      b.contact_name.toLowerCase().includes(q) ||
      b.property_id.toLowerCase().includes(q) ||
      b.production_type.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ── Login screen ───────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Admin — Bookings</h1>
            <p className="text-sm text-slate-500">Enter your admin password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              className="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {authError && <p className="text-xs text-red-600">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition"
            >
              {authLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="text-center">
            <Link href="/admin" className="text-xs text-blue-600 hover:underline">← Back to Admin Dashboard</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Detail panel ───────────────────────────────────────────────────────────

  if (selected) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-slate-100 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              All Bookings
            </button>
            <span className="text-sm font-semibold text-slate-900">Booking Review</span>
            <StatusBadge status={selected.status} />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Renter Details */}
            <section className="rounded-2xl border border-slate-200 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Renter Details</h2>
              <dl className="space-y-2 text-sm">
                {[
                  ['Company', selected.company_name],
                  ['Contact', selected.contact_name],
                  ['Email', selected.contact_email],
                  ['Phone', selected.contact_phone],
                  ['Production Type', selected.production_type],
                  ['Property ID', selected.property_id],
                  ['Booking Start', fmt(selected.booking_start)],
                  ['Booking End', fmt(selected.booking_end)],
                  ['Submitted', fmt(selected.created_at)],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <dt className="w-32 text-slate-400 flex-shrink-0">{k}</dt>
                    <dd className="text-slate-900 font-medium">{v}</dd>
                  </div>
                ))}
                {selected.notes && (
                  <div className="flex gap-3">
                    <dt className="w-32 text-slate-400 flex-shrink-0">Notes</dt>
                    <dd className="text-slate-700">{selected.notes}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Legal Compliance */}
            <section className="rounded-2xl border border-slate-200 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Legal Compliance</h2>
              <dl className="space-y-2.5 text-sm">
                {[
                  ['Hold Harmless', selected.hold_harmless_accepted, selected.hold_harmless_accepted_at],
                  ['Terms of Service', selected.tos_accepted, selected.tos_accepted_at],
                  ['Content Permission', selected.content_permission_accepted, selected.content_permission_accepted_at ?? null],
                  ['Permit Confirmed', selected.permit_confirmed, null],
                ].map(([label, ok, ts]) => (
                  <div key={label as string} className="flex items-start gap-3">
                    <dt className="w-36 text-slate-400 flex-shrink-0">{label as string}</dt>
                    <dd className="flex flex-col gap-0.5">
                      <CheckBadge ok={ok as boolean} />
                      {ts && <span className="text-xs text-slate-400">{fmt(ts as string)}</span>}
                    </dd>
                  </div>
                ))}
                <div className="flex items-start gap-3">
                  <dt className="w-36 text-slate-400 flex-shrink-0">Damage Deposit</dt>
                  <dd className="font-semibold text-slate-900">${selected.damage_deposit_amount.toLocaleString()}</dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="w-36 text-slate-400 flex-shrink-0">COI Expiry</dt>
                  <dd className="text-slate-900">{fmt(selected.coi_expiry_date)}</dd>
                </div>
              </dl>
            </section>

            {/* Documents */}
            <section className="rounded-2xl border border-slate-200 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Uploaded Documents</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Government ID</span>
                  </div>
                  {selected.id_document_url ? (
                    <span className="text-xs text-green-700 font-semibold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      On file
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      Missing
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Certificate of Insurance</span>
                  </div>
                  {selected.coi_document_url ? (
                    <span className="text-xs text-green-700 font-semibold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      On file
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      Missing
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Documents are stored in a private bucket. Contact engineering to retrieve signed download URLs.</p>
              </div>
            </section>

            {/* Admin Actions */}
            <section className="rounded-2xl border border-slate-200 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Admin Actions</h2>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Admin Notes</label>
                <textarea
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  rows={3}
                  placeholder="Internal notes (visible only to admins)…"
                  value={adminNotes || selected.admin_notes || ''}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
              {updateError && <p className="text-xs text-red-600">{updateError}</p>}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusUpdate(selected.id, 'approved')}
                  disabled={updating || selected.status === 'approved'}
                  className="flex-1 min-w-[100px] rounded-xl bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-40 transition"
                >
                  {updating ? 'Saving…' : 'Approve'}
                </button>
                <button
                  onClick={() => handleStatusUpdate(selected.id, 'rejected')}
                  disabled={updating || selected.status === 'rejected'}
                  className="flex-1 min-w-[100px] rounded-xl bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate(selected.id, 'pending')}
                  disabled={updating || selected.status === 'pending'}
                  className="flex-1 min-w-[100px] rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Reset to Pending
                </button>
              </div>
              {selected.reviewed_at && (
                <p className="text-xs text-slate-400">Last reviewed: {fmt(selected.reviewed_at)}</p>
              )}
            </section>
          </div>
        </main>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Admin
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-900">Booking Requests</span>
          </div>
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="block w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search by company, email, property…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition
                  ${filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {tab.label}
                {tab.key !== 'all' && (
                  <span className="ml-1 opacity-70">
                    {bookings.filter((b) => b.status === tab.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{fetchError}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-sm text-slate-400">Loading bookings…</div>
        )}

        {/* Empty */}
        {!loading && !fetchError && filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-slate-400">No booking requests found.</div>
        )}

        {/* Bookings table */}
        {!loading && filtered.length > 0 && (
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Company', 'Contact', 'Production Type', 'Submitted', 'Status', 'Documents', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">{b.company_name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{b.contact_name}</div>
                      <div className="text-xs text-slate-400">{b.contact_email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{b.production_type}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmt(b.created_at)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <span title="Government ID" className={`w-6 h-6 rounded-full flex items-center justify-center ${b.id_document_url ? 'bg-green-100' : 'bg-red-100'}`}>
                          <Shield className={`w-3 h-3 ${b.id_document_url ? 'text-green-600' : 'text-red-500'}`} />
                        </span>
                        <span title="COI" className={`w-6 h-6 rounded-full flex items-center justify-center ${b.coi_document_url ? 'bg-green-100' : 'bg-red-100'}`}>
                          <FileText className={`w-3 h-3 ${b.coi_document_url ? 'text-green-600' : 'text-red-500'}`} />
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSelected(b); setAdminNotes(b.admin_notes ?? ''); }}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        Review
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
