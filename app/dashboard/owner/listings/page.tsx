"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, PlusCircle, Loader2, Image as ImageIcon } from "lucide-react";

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
  base_rate: number | null;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
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

export default function OwnerListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    let user: StoredUser;
    try {
      user = JSON.parse(stored);
    } catch {
      return;
    }

    fetch(`/api/owner/listings?user_id=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((data) => setListings(data.listings ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
          <p className="mt-1 text-sm text-slate-500">All your submitted property listings.</p>
        </div>
        <Link
          href="/list-property"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add Listing
        </Link>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <p className="font-medium text-slate-700">No listings yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Submit your first property to get it reviewed by our team.
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
          {listings.map((listing) => {
            const thumb = listing.photo_urls?.[0];
            return (
              <Link
                key={listing.id}
                href={`/dashboard/owner/listings/${listing.id}`}
                className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-slate-100">
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
                  {listing.base_rate != null && (
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      ${listing.base_rate}/hr
                    </p>
                  )}
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
  );
}
