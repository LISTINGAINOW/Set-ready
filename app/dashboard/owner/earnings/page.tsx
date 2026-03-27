"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Clock,
  CheckCircle,
  Wallet,
  Download,
  Calendar,
  RefreshCw,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface EarningRow {
  id: string;
  booking_id: string | null;
  property_id: string | null;
  property_name: string | null;
  renter_name: string | null;
  renter_email: string | null;
  booking_date: string | null;
  booking_amount: number;
  setvenue_fee: number;
  owner_payout: number;
  status: "pending" | "paid";
  payout_date: string | null;
  transaction_id: string | null;
  created_at: string;
}

interface Summary {
  total_earnings: number;
  pending_amount: number;
  paid_out: number;
  current_balance: number;
  booking_count: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function usd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function downloadCsv(rows: EarningRow[]) {
  const headers = [
    "Booking ID",
    "Property",
    "Renter",
    "Booking Date",
    "Booking Amount",
    "SetVenue Fee (10%)",
    "Your Payout (90%)",
    "Status",
    "Payout Date",
    "Transaction ID",
  ];
  const lines = rows.map((r) =>
    [
      r.booking_id ?? "",
      r.property_name ?? r.property_id ?? "",
      r.renter_name ?? "",
      r.booking_date ?? "",
      r.booking_amount.toFixed(2),
      r.setvenue_fee.toFixed(2),
      r.owner_payout.toFixed(2),
      r.status,
      r.payout_date ?? "",
      r.transaction_id ?? "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `setvenue-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      {loading ? (
        <div className="h-8 w-28 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <div className="text-3xl font-bold text-slate-900">{value}</div>
      )}
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
        <CheckCircle className="h-3 w-3" />
        Paid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OwnerEarningsPage() {
  const [user, setUser]         = useState<StoredUser | null>(null);
  const [summary, setSummary]   = useState<Summary | null>(null);
  const [earnings, setEarnings] = useState<EarningRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");

  function load(uid: string) {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ user_id: uid });
    if (startDate) params.set("start", startDate);
    if (endDate)   params.set("end", endDate);

    fetch(`/api/owner/earnings?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSummary(data.summary);
        setEarnings(data.earnings ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    try {
      const parsed: StoredUser = JSON.parse(stored);
      setUser(parsed);
      load(parsed.id);
    } catch {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    if (user) load(user.id);
  }

  const pendingRows = earnings.filter((r) => r.status === "pending");
  const paidRows    = earnings.filter((r) => r.status === "paid");

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your property payout history and pending balances.
          </p>
        </div>
        <button
          onClick={() => earnings.length > 0 && downloadCsv(earnings)}
          disabled={earnings.length === 0 || loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Earnings"
          value={summary ? usd(summary.total_earnings) : "$0.00"}
          color="bg-blue-50 text-blue-600"
          loading={loading}
        />
        <StatCard
          icon={Clock}
          label="Pending Payment"
          value={summary ? usd(summary.pending_amount) : "$0.00"}
          color="bg-yellow-50 text-yellow-600"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle}
          label="Paid Out"
          value={summary ? usd(summary.paid_out) : "$0.00"}
          color="bg-green-50 text-green-600"
          loading={loading}
        />
        <StatCard
          icon={Wallet}
          label="Current Balance"
          value={summary ? usd(summary.current_balance) : "$0.00"}
          color="bg-slate-100 text-slate-600"
          loading={loading}
        />
      </div>

      {/* Date filter */}
      <form onSubmit={handleFilter} className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 uppercase tracking-wide">
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 uppercase tracking-wide">
            To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Apply
        </button>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => { setStartDate(""); setEndDate(""); if (user) load(user.id); }}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Payout notice */}
      {!loading && (summary?.pending_amount ?? 0) > 0 && (
        <div className="mb-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Pending payout: {usd(summary!.pending_amount)}</strong> — Payments are
            processed manually via Mercury transfer. Josh will send your payout within 7 business
            days of booking completion.
          </p>
        </div>
      )}

      {/* Bookings Table */}
      <div className="mb-10">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Booking Earnings</h2>

        {loading ? (
          <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
        ) : earnings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <DollarSign className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="font-medium text-slate-700">No earnings yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Earnings will appear here once bookings are completed on your properties.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Property</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap sm:table-cell">Renter</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap md:table-cell">Booking Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Booking Amt</th>
                    <th className="hidden px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap lg:table-cell">Fee (10%)</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Your Payout</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {earnings.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{row.property_name ?? row.property_id ?? "—"}</p>
                        {row.booking_id && (
                          <p className="text-xs text-slate-400">#{row.booking_id.slice(0, 8)}</p>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-slate-700">{row.renter_name ?? "—"}</p>
                        {row.renter_email && (
                          <p className="text-xs text-slate-400">{row.renter_email}</p>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-slate-600 md:table-cell whitespace-nowrap">
                        {fmt(row.booking_date ?? row.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700 whitespace-nowrap">
                        {usd(row.booking_amount)}
                      </td>
                      <td className="hidden px-4 py-3 text-right text-slate-500 lg:table-cell whitespace-nowrap">
                        −{usd(row.setvenue_fee)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                        {usd(row.owner_payout)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Totals row */}
                <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                  <tr>
                    <td colSpan={3} className="hidden px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide md:table-cell">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap md:hidden">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {usd(earnings.reduce((s, r) => s + r.booking_amount, 0))}
                    </td>
                    <td className="hidden px-4 py-3 text-right font-semibold text-slate-500 lg:table-cell whitespace-nowrap">
                      −{usd(earnings.reduce((s, r) => s + r.setvenue_fee, 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700 whitespace-nowrap">
                      {usd(earnings.reduce((s, r) => s + r.owner_payout, 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Payment History */}
      {!loading && paidRows.length > 0 && (
        <div>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Payment History</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Property</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide sm:table-cell">Booking Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount Paid</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide md:table-cell">Payout Date</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide lg:table-cell">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paidRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {row.property_name ?? row.property_id ?? "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-slate-600 sm:table-cell whitespace-nowrap">
                        {fmt(row.booking_date ?? row.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700 whitespace-nowrap">
                        {usd(row.owner_payout)}
                      </td>
                      <td className="hidden px-4 py-3 text-slate-600 md:table-cell whitespace-nowrap">
                        {fmt(row.payout_date)}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {row.transaction_id ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600">
                            {row.transaction_id}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
