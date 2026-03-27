"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle,
  Clock,
  MessageSquare,
  PlusCircle,
  User,
  HelpCircle,
  ArrowRight,
  Image as ImageIcon,
  DollarSign,
} from "lucide-react";
import W9Modal from "@/components/W9Modal";

interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Listing {
  id: string;
  title: string;
  status: string;
  created_at: string;
  photo_urls: string[] | null;
  city: string;
  state: string;
  property_type: string;
}

interface Inquiry {
  id: number;
  name: string;
  property_name: string;
  property_id: string;
  production_type: string | null;
  dates_needed: string | null;
  status: string;
  created_at: string;
  email: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; classes: string }
> = {
  pending_review: { label: "Pending Review", classes: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Approved", classes: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", classes: "bg-red-100 text-red-800" },
  changes_requested: { label: "Changes Requested", classes: "bg-blue-100 text-blue-800" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: "bg-slate-100 text-slate-700" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

export default function OwnerDashboardPage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showW9Modal, setShowW9Modal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    let parsed: StoredUser;
    try {
      parsed = JSON.parse(stored);
    } catch {
      return;
    }
    setUser(parsed);

    // Check if owner has submitted a W-9; show modal if not (unless skipped this session)
    const skipped = sessionStorage.getItem("w9_skipped");
    if (!skipped) {
      fetch(`/api/w9/status?user_id=${encodeURIComponent(parsed.id)}`)
        .then((r) => r.json())
        .then((data) => {
          if (!data.w9) setShowW9Modal(true);
        })
        .catch(() => {/* non-blocking */});
    }

    const userId = parsed.id;

    Promise.all([
      fetch(`/api/owner/listings?user_id=${encodeURIComponent(userId)}`).then((r) => r.json()),
      fetch(`/api/owner/inquiries?user_id=${encodeURIComponent(userId)}`).then((r) => r.json()),
    ])
      .then(([listingsRes, inquiriesRes]) => {
        setListings(listingsRes.listings ?? []);
        setInquiries(inquiriesRes.inquiries ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.status === "approved").length;
  const pendingListings = listings.filter((l) => l.status === "pending_review").length;
  const totalInquiries = inquiries.length;

  function handleW9Skip() {
    sessionStorage.setItem("w9_skipped", "1");
    setShowW9Modal(false);
  }

  return (
    <div>
      {/* W-9 Modal */}
      {showW9Modal && user && (
        <W9Modal
          userId={user.id}
          onSubmitted={() => setShowW9Modal(false)}
          onSkip={handleW9Skip}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {user ? `Welcome back, ${user.firstName}!` : "Owner Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your property listings and inquiries.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Total Listings"
          value={loading ? "—" : totalListings}
          color="bg-slate-100 text-slate-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Approved"
          value={loading ? "—" : activeListings}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={loading ? "—" : pendingListings}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          icon={MessageSquare}
          label="Total Inquiries"
          value={loading ? "—" : totalInquiries}
          color="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/list-property"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            List Another Property
          </Link>
          <Link
            href="/dashboard/owner/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <User className="h-4 w-4" />
            View My Profile
          </Link>
          <Link
            href="/dashboard/owner/earnings"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <DollarSign className="h-4 w-4" />
            View Earnings
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            Help Center
          </Link>
        </div>
      </div>

      {/* My Listings */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">My Listings</h2>
          <Link
            href="/dashboard/owner/listings"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Building2 className="mx-auto mb-3 h-8 w-8 text-slate-400" />
            <p className="font-medium text-slate-700">No listings yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Submit your first property to get started.
            </p>
            <Link
              href="/list-property"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4" /> List a Property
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 6).map((listing) => {
              const thumb = listing.photo_urls?.[0];
              return (
                <Link
                  key={listing.id}
                  href={`/dashboard/owner/listings/${listing.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative h-36 bg-slate-100">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={listing.status} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700">
                      {listing.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {listing.city && listing.state
                        ? `${listing.city}, ${listing.state}`
                        : listing.property_type}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Submitted{" "}
                      {new Date(listing.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Inquiries */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Inquiries</h2>
          <Link
            href="/dashboard/owner/inquiries"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        ) : inquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <MessageSquare className="mx-auto mb-3 h-7 w-7 text-slate-400" />
            <p className="text-sm text-slate-500">No inquiries yet for your properties.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Inquirer</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Property</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-slate-600 sm:table-cell">
                      Production Type
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-slate-600 md:table-cell">
                      Dates Requested
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inquiries.slice(0, 10).map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{inq.name}</p>
                        <p className="text-xs text-slate-500">{inq.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{inq.property_name}</td>
                      <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                        {inq.production_type ?? "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                        {inq.dates_needed ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            inq.status === "new"
                              ? "bg-blue-100 text-blue-700"
                              : inq.status === "contacted"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(inq.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
