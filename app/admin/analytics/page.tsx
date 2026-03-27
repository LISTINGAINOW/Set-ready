'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart2,
  Building2,
  MessageSquare,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Lock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  totalProperties: number;
  totalInquiries: number;
  pendingReviews: number;
  conversionRate: number;
}

interface ActivityItem {
  type: string;
  description: string;
  timestamp: string;
  id: string;
}

interface AnalyticsData {
  stats: Stats;
  statusBreakdown: Record<string, number>;
  submissionsByMonth: Record<string, number>;
  inquiriesByProductionType: Record<string, number>;
  inquiriesByCity: Record<string, number>;
  topCities: { city: string; count: number }[];
  recentActivity: ActivityItem[];
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  approved: '#2563eb',
  pending_review: '#eab308',
  rejected: '#ef4444',
  changes_requested: '#0ea5e9',
};

function DonutChart({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">No data yet</p>
    );
  }

  const r = 38;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;

  let cumulativeLen = 0;
  const segments = Object.entries(data).map(([status, count]) => {
    const segLen = (count / total) * circumference;
    const startAngle = -90 + (cumulativeLen / circumference) * 360;
    const seg = { status, count, segLen, startAngle };
    cumulativeLen += segLen;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className="flex-shrink-0"
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="18"
        />
        {/* Segments */}
        {segments.map((seg) => (
          <circle
            key={seg.status}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={STATUS_COLORS[seg.status] ?? '#94a3b8'}
            strokeWidth="18"
            strokeDasharray={`${seg.segLen} ${circumference}`}
            strokeDashoffset={0}
            transform={`rotate(${seg.startAngle} ${cx} ${cy})`}
          />
        ))}
        {/* Center label */}
        <text
          x={cx}
          y={cy - 7}
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="#0f172a"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fontSize="9"
          fill="#94a3b8"
        >
          total
        </text>
      </svg>

      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.status} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
              style={{
                backgroundColor: STATUS_COLORS[seg.status] ?? '#94a3b8',
              }}
            />
            <span className="capitalize text-slate-600">
              {seg.status.replace(/_/g, ' ')}
            </span>
            <span className="ml-2 font-semibold text-slate-900">
              {seg.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Horizontal Bar Chart ─────────────────────────────────────────────────────

function HBarChart({
  data,
  maxItems = 8,
}: {
  data: Record<string, number>;
  maxItems?: number;
}) {
  const entries = Object.entries(data)
    .filter(([key]) => key && key !== 'Unknown' && key !== 'null')
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems);

  if (entries.length === 0) {
    return <p className="py-4 text-sm text-slate-400">No data yet</p>;
  }

  const max = Math.max(...entries.map(([, v]) => v));

  return (
    <div className="space-y-3">
      {entries.map(([label, count]) => (
        <div key={label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="max-w-[65%] truncate text-slate-700">{label}</span>
            <span className="font-semibold text-slate-900">{count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Vertical Bar Chart (time series) ────────────────────────────────────────

function VBarChart({ data }: { data: Record<string, number> }) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    return { key, label, value: data[key] ?? 0 };
  });

  const max = Math.max(...months.map((m) => m.value), 1);

  return (
    <div className="flex items-end gap-2 pt-2" style={{ height: '120px' }}>
      {months.map(({ key, label, value }) => (
        <div key={key} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs text-slate-500">{value > 0 ? value : ''}</span>
          <div
            className="flex w-full flex-col justify-end rounded-t-sm bg-slate-100"
            style={{ height: '80px' }}
          >
            <div
              className="w-full rounded-t-sm bg-blue-600 transition-all duration-500"
              style={{
                height: value > 0 ? `${(value / max) * 100}%` : '0%',
                minHeight: value > 0 ? '4px' : '0',
              }}
            />
          </div>
          <span className="text-xs text-slate-500">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Activity helpers ─────────────────────────────────────────────────────────

function activityStyle(type: string): {
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
} {
  switch (type) {
    case 'new_submission':
      return {
        icon: <Building2 className="h-4 w-4 text-blue-600" />,
        borderColor: '#3b82f6',
        bgColor: '#eff6ff',
      };
    case 'new_inquiry':
      return {
        icon: <MessageSquare className="h-4 w-4 text-sky-600" />,
        borderColor: '#0ea5e9',
        bgColor: '#f0f9ff',
      };
    case 'approved':
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        borderColor: '#22c55e',
        bgColor: '#f0fdf4',
      };
    case 'rejected':
      return {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        borderColor: '#ef4444',
        bgColor: '#fef2f2',
      };
    default:
      return {
        icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
        borderColor: '#eab308',
        bgColor: '#fefce8',
      };
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [password, setPassword] = useState('');
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  const fetchData = useCallback(async (pw: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${pw}` },
      });
      if (res.status === 401) {
        setAuthError(true);
        sessionStorage.removeItem('admin_analytics_pw');
        setSavedPassword(null);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError('Failed to load analytics. Please try again.');
        setLoading(false);
        return;
      }
      const json = (await res.json()) as AnalyticsData;
      setData(json);
      sessionStorage.setItem('admin_analytics_pw', pw);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_analytics_pw');
    if (stored) {
      setSavedPassword(stored);
      fetchData(stored);
    }
  }, [fetchData]);

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!savedPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter admin password to continue
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!password.trim()) return;
              setAuthError(false);
              setSavedPassword(password);
              fetchData(password);
            }}
            className="space-y-4"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              autoFocus
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {authError && (
              <p className="text-center text-sm text-red-500">
                Incorrect password.
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading analytics…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <button
            onClick={() => savedPassword && fetchData(savedPassword)}
            className="mx-auto flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // ── Dashboard ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              SetVenue platform overview
            </p>
          </div>
          <button
            onClick={() => savedPassword && fetchData(savedPassword)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Building2 className="h-4 w-4 text-blue-600" />}
            label="Total Properties"
            value={data.stats.totalProperties}
            sub="All submissions"
          />
          <StatCard
            icon={<MessageSquare className="h-4 w-4 text-blue-600" />}
            label="Total Inquiries"
            value={data.stats.totalInquiries}
            sub="Location requests"
          />
          <StatCard
            icon={<Clock className="h-4 w-4 text-blue-600" />}
            label="Pending Reviews"
            value={data.stats.pendingReviews}
            sub="Awaiting approval"
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
            label="Approval Rate"
            value={`${data.stats.conversionRate}%`}
            sub="Approved / submitted"
          />
        </div>

        {/* Charts — 2 columns */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Submissions Over Time */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-600" />
              <h2 className="font-semibold text-slate-900">
                Submissions Over Time
              </h2>
            </div>
            <VBarChart data={data.submissionsByMonth} />
          </div>

          {/* Status Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-600" />
              <h2 className="font-semibold text-slate-900">
                Status Breakdown
              </h2>
            </div>
            <DonutChart data={data.statusBreakdown} />
          </div>

          {/* Inquiries by Production Type */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-600" />
              <h2 className="font-semibold text-slate-900">
                Inquiries by Production Type
              </h2>
            </div>
            <HBarChart data={data.inquiriesByProductionType} />
          </div>

          {/* Inquiries by City */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-600" />
              <h2 className="font-semibold text-slate-900">
                Inquiries by City
              </h2>
            </div>
            <HBarChart data={data.inquiriesByCity} />
          </div>
        </div>

        {/* Top Markets — full width */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-blue-600" />
            <h2 className="font-semibold text-slate-900">
              Top Markets by Inquiry Volume
            </h2>
          </div>
          {data.topCities.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet</p>
          ) : (
            <div className="space-y-4">
              {data.topCities.map((item, i) => {
                const maxCount = data.topCities[0].count;
                return (
                  <div key={item.city} className="flex items-center gap-3">
                    <span className="w-5 flex-shrink-0 text-right text-sm font-medium text-slate-400">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="mb-1 flex justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          {item.city}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {item.count}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{
                            width: `${(item.count / maxCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-slate-900">
            Recent Activity
          </h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400">No activity yet</p>
          ) : (
            <div className="space-y-2">
              {data.recentActivity.map((item) => {
                const style = activityStyle(item.type);
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-start gap-3 rounded-lg p-3"
                    style={{
                      borderLeft: `4px solid ${style.borderColor}`,
                      backgroundColor: style.bgColor,
                    }}
                  >
                    <div className="mt-0.5 flex-shrink-0">{style.icon}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-slate-700">
                        {item.description}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {timeAgo(item.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sign out */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_analytics_pw');
              setSavedPassword(null);
              setData(null);
            }}
            className="text-sm text-slate-400 transition-colors hover:text-slate-600"
          >
            Sign out of admin
          </button>
        </div>
      </div>
    </div>
  );
}
