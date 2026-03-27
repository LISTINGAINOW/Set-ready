"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface OwnerRecord {
  owner_id: string;
  email: string;
  name: string;
  has_w9: boolean;
  w9_legal_name: string | null;
  ssn_ein_last4: string | null;
  w9_address: string | null;
  w9_submitted_at: string | null;
  total_earnings: number;
  above_1099_threshold: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function downloadCsv(owners: OwnerRecord[]) {
  const headers = [
    "Owner ID",
    "Email",
    "Name",
    "Has W-9",
    "Legal Name (W-9)",
    "SSN/EIN Last 4",
    "Address",
    "W-9 Submitted",
    "Total Earnings",
    "Above $600 Threshold",
  ];
  const lines = owners.map((o) =>
    [
      o.owner_id,
      o.email,
      o.name,
      o.has_w9 ? "Yes" : "No",
      o.w9_legal_name ?? "",
      o.ssn_ein_last4 ? `****${o.ssn_ein_last4}` : "",
      o.w9_address ?? "",
      o.w9_submitted_at ? fmt(o.w9_submitted_at) : "",
      o.total_earnings.toFixed(2),
      o.above_1099_threshold ? "Yes" : "No",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `setvenue-w9-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminTaxPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword]               = useState("");
  const [authError, setAuthError]             = useState("");
  const [authLoading, setAuthLoading]         = useState(false);

  const [owners, setOwners]     = useState<OwnerRecord[]>([]);
  const [loading, setLoading]   = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<"all" | "has_w9" | "missing_w9" | "above_threshold">("all");

  // ── Auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const saved = localStorage.getItem("adminPassword");
    if (saved) setIsAuthenticated(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        localStorage.setItem("adminPassword", password);
        setIsAuthenticated(true);
      } else {
        setAuthError("Incorrect password");
      }
    } catch {
      setAuthError("Login failed. Try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  // ── Fetch data ────────────────────────────────────────────────────────────

  async function fetchData() {
    setLoading(true);
    setFetchError("");
    try {
      const pw = localStorage.getItem("adminPassword") ?? "";
      const res = await fetch("/api/admin/w9", {
        headers: { Authorization: `Bearer ${pw}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setOwners(data.owners ?? []);
    } catch {
      setFetchError("Failed to load W-9 data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = owners.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.email.toLowerCase().includes(q) ||
      o.name.toLowerCase().includes(q) ||
      (o.w9_legal_name ?? "").toLowerCase().includes(q);

    const matchFilter =
      filter === "all" ||
      (filter === "has_w9" && o.has_w9) ||
      (filter === "missing_w9" && !o.has_w9) ||
      (filter === "above_threshold" && o.above_1099_threshold);

    return matchSearch && matchFilter;
  });

  const stats = {
    total:     owners.length,
    hasW9:     owners.filter((o) => o.has_w9).length,
    missingW9: owners.filter((o) => !o.has_w9).length,
    threshold: owners.filter((o) => o.above_1099_threshold).length,
  };

  // ── Login screen ──────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Admin — Tax & W-9</h1>
            <p className="mt-1 text-sm text-slate-500">Enter your admin password to continue</p>
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
              {authLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="text-center">
            <Link href="/admin" className="text-xs text-blue-600 hover:underline">
              ← Back to Admin Dashboard
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Admin
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-900">Tax & W-9 Management</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => filtered.length > 0 && downloadCsv(filtered)}
              disabled={filtered.length === 0 || loading}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Owners",      value: stats.total,     color: "bg-slate-100 text-slate-600",  icon: Users },
            { label: "W-9 Submitted",     value: stats.hasW9,     color: "bg-green-100 text-green-700",  icon: CheckCircle },
            { label: "W-9 Missing",       value: stats.missingW9, color: "bg-red-100 text-red-700",      icon: XCircle },
            { label: "Needs 1099-NEC",    value: stats.threshold, color: "bg-amber-100 text-amber-700",  icon: AlertTriangle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {loading ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-slate-100" /> : value}
              </div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* 1099 notice */}
        {stats.threshold > 0 && !loading && (
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>{stats.threshold} owner{stats.threshold !== 1 ? "s have" : " has"} earned $600 or more</strong> and
              require a 1099-NEC filing. Export the CSV for tax preparation.
            </p>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="block w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {([
              { key: "all",             label: "All" },
              { key: "has_w9",          label: "W-9 On File" },
              { key: "missing_w9",      label: "Missing W-9" },
              { key: "above_threshold", label: "Needs 1099" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  filter === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {fetchError}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No owners found.</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">W-9 Status</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide md:table-cell">Legal Name</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide sm:table-cell">SSN/EIN</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide lg:table-cell">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Earnings</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">1099</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((owner) => (
                  <tr key={owner.owner_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{owner.name}</p>
                      <p className="text-xs text-slate-400">{owner.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {owner.has_w9 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                          <CheckCircle className="h-3 w-3" />
                          On file
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          <XCircle className="h-3 w-3" />
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-700 md:table-cell">
                      {owner.w9_legal_name ?? <span className="text-slate-400">—</span>}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {owner.ssn_ein_last4 ? (
                        <span className="font-mono text-slate-700">****{owner.ssn_ein_last4}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 lg:table-cell whitespace-nowrap">
                      {fmt(owner.w9_submitted_at)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {usd(owner.total_earnings)}
                    </td>
                    <td className="px-4 py-3">
                      {owner.above_1099_threshold ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                          <AlertTriangle className="h-3 w-3" />
                          Required
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Below $600</span>
                      )}
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
