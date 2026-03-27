'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  BedDouble,
  Bath,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface Submission {
  id: string;
  title: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: 'pending_review' | 'approved' | 'rejected' | 'changes_requested';
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  max_capacity: number | null;
  base_rate: number | null;
  created_at: string;
  reviewer_notes: string | null;
  reviewed_at: string | null;
}

type FilterTab = 'all' | 'pending_review' | 'approved' | 'rejected' | 'changes_requested';

const STATUS_CONFIG = {
  pending_review: { label: 'Pending Review', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
  approved: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
  changes_requested: { label: 'Changes Requested', bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw },
};

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending_review', label: 'Pending Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'changes_requested', label: 'Changes Requested' },
];

function StatusBadge({ status }: { status: Submission['status'] }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_review;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Check saved auth on mount
  useEffect(() => {
    const saved = localStorage.getItem('adminPassword');
    if (saved) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch submissions when authenticated or filter changes
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchSubmissions(activeFilter);
  }, [isAuthenticated, activeFilter]);

  async function fetchSubmissions(filter: FilterTab) {
    const pwd = localStorage.getItem('adminPassword') ?? '';
    setLoading(true);
    setFetchError('');
    try {
      const url = filter === 'all'
        ? '/api/admin/submissions'
        : `/api/admin/submissions?status=${filter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${pwd}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('adminPassword');
        setIsAuthenticated(false);
        return;
      }
      const json = await res.json();
      setSubmissions(json.submissions ?? []);
    } catch {
      setFetchError('Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  }

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
      const json = await res.json();
      if (json.ok) {
        localStorage.setItem('adminPassword', password);
        setIsAuthenticated(true);
      } else {
        setAuthError('Incorrect password.');
      }
    } catch {
      setAuthError('Something went wrong. Try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('adminPassword');
    setIsAuthenticated(false);
    setSubmissions([]);
    setPassword('');
  }

  // Count by status
  const counts = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white text-xl font-bold">
              S
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">SetVenue listing review portal</p>
          </div>
          <form onSubmit={handleLogin} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
              autoFocus
            />
            {authError && (
              <p className="mt-2 text-sm text-red-600">{authError}</p>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {authLoading ? 'Checking…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">
                {loading ? 'Loading…' : `${submissions.length} submission${submissions.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map((tab) => {
            const count = tab.key === 'all'
              ? Object.values(counts).reduce((a, b) => a + b, 0)
              : (counts[tab.key] ?? 0);
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                    isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm text-slate-500">Loading submissions…</p>
            </div>
          </div>
        ) : fetchError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">{fetchError}</p>
            <button
              onClick={() => fetchSubmissions(activeFilter)}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-500">No submissions found</p>
            <p className="mt-1 text-sm text-slate-400">
              {activeFilter === 'all' ? 'No listings have been submitted yet.' : `No ${activeFilter.replace('_', ' ')} submissions.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {submissions.map((sub) => (
              <Link
                key={sub.id}
                href={`/admin/submissions/${sub.id}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={sub.status} />
                    </div>
                    <h2 className="mt-2 text-base font-semibold text-slate-900 truncate">
                      {sub.title ?? 'Untitled Property'}
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500 truncate">
                      {[sub.address, sub.city, sub.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-blue-600" />
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
                  {sub.property_type && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {sub.property_type}
                    </span>
                  )}
                  {sub.bedrooms != null && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5 text-slate-400" />
                      {sub.bedrooms} bd
                    </span>
                  )}
                  {sub.bathrooms != null && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5 text-slate-400" />
                      {sub.bathrooms} ba
                    </span>
                  )}
                  {sub.max_capacity != null && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {sub.max_capacity} guests
                    </span>
                  )}
                  {sub.base_rate != null && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      ${sub.base_rate}/hr
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    Submitted {formatDate(sub.created_at)}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 transition group-hover:opacity-100">
                    <Eye className="h-3 w-3" />
                    Review
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
