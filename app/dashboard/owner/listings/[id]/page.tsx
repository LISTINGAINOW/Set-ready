"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  FileText,
  ExternalLink,
} from "lucide-react";

interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Listing {
  id: string;
  user_id: string;
  status: string;
  title: string;
  property_type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  description: string;
  bedrooms: number | null;
  bathrooms: number | null;
  max_capacity: number | null;
  amenities: string[] | null;
  privacy_level: string | null;
  booking_mode: string | null;
  base_rate: number | null;
  cleaning_fee: number | null;
  security_deposit: number | null;
  available_days: string[] | null;
  tot_license_number: string | null;
  business_license_number: string | null;
  has_liability_insurance: boolean | null;
  has_production_insurance: boolean | null;
  ownership_certified: boolean;
  owner_agreement_accepted: boolean;
  insurance_confirmed: boolean;
  indemnification_accepted: boolean;
  review_acknowledged: boolean;
  age_verified: boolean | null;
  property_condition_disclosed: boolean | null;
  zoning_compliant: boolean | null;
  right_to_list: boolean | null;
  content_usage_rights: boolean | null;
  neighbor_acknowledged: boolean | null;
  cancellation_accepted: boolean | null;
  government_id_url: string | null;
  ownership_proof_url: string | null;
  insurance_cert_url: string | null;
  hoa_approval_url: string | null;
  w9_url: string | null;
  photo_urls: string[] | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  cancellation_policy: string | null;
  parking_spots: number | null;
  load_in_access: string | null;
  access_instructions: string | null;
  property_manager_name: string | null;
  property_manager_phone: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; classes: string; bg: string }> = {
  pending_review: {
    label: "Pending Review",
    icon: Clock,
    classes: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    classes: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    classes: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  changes_requested: {
    label: "Changes Requested",
    icon: AlertCircle,
    classes: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0 && value !== false) return null;
  return (
    <div className="grid grid-cols-2 gap-2 py-2 border-b border-slate-100 last:border-0 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}

function CheckRow({ label, value }: { label: string; value: boolean | null | undefined }) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-sm">
      {value ? (
        <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-slate-300" />
      )}
      <span className={value ? "text-slate-900" : "text-slate-400"}>{label}</span>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url: string | null | undefined }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm text-blue-600 hover:bg-slate-50 hover:border-blue-300 transition-colors"
    >
      <FileText className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
    </a>
  );
}

export default function OwnerListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }

    let user: StoredUser;
    try {
      user = JSON.parse(stored);
    } catch {
      router.push("/login");
      return;
    }

    fetch(`/api/owner/listings?user_id=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((data) => {
        const found = (data.listings ?? []).find((l: Listing) => l.id === id);
        if (!found) {
          setError("Listing not found or you don't have access to it.");
        } else {
          setListing(found);
        }
      })
      .catch(() => setError("Failed to load listing."))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <XCircle className="mx-auto mb-3 h-7 w-7 text-red-400" />
        <p className="font-medium text-red-700">{error ?? "Listing not found."}</p>
        <Link
          href="/dashboard/owner"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[listing.status] ?? {
    label: listing.status,
    icon: Clock,
    classes: "text-slate-700",
    bg: "bg-slate-50 border-slate-200",
  };
  const StatusIcon = statusCfg.icon;

  return (
    <div className="max-w-3xl">
      {/* Back nav */}
      <Link
        href="/dashboard/owner"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{listing.title}</h1>
          {(listing.city || listing.state) && (
            <p className="mt-1 text-sm text-slate-500">
              {[listing.address, listing.city, listing.state, listing.zip]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </div>
        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2 ${statusCfg.bg}`}>
          <StatusIcon className={`h-4 w-4 ${statusCfg.classes}`} />
          <span className={`text-sm font-medium ${statusCfg.classes}`}>{statusCfg.label}</span>
        </div>
      </div>

      {/* Changes requested banner */}
      {listing.status === "changes_requested" && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div className="flex-1">
              <p className="font-semibold text-blue-800">Action Required: Changes Requested</p>
              {listing.reviewer_notes ? (
                <p className="mt-1 text-sm text-blue-700">{listing.reviewer_notes}</p>
              ) : (
                <p className="mt-1 text-sm text-blue-700">
                  Our team has requested changes to your submission. Please review the notes and
                  resubmit your listing.
                </p>
              )}
              <Link
                href="/list-property"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Resubmit Listing
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Reviewer notes (non-changes_requested) */}
      {listing.reviewer_notes && listing.status !== "changes_requested" && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Reviewer Notes
          </p>
          <p className="text-sm text-slate-700">{listing.reviewer_notes}</p>
          {listing.reviewed_at && (
            <p className="mt-2 text-xs text-slate-400">
              Reviewed on{" "}
              {new Date(listing.reviewed_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}

      <div className="space-y-5">
        {/* Photos */}
        {listing.photo_urls && listing.photo_urls.length > 0 && (
          <SectionCard title={`Photos (${listing.photo_urls.length})`}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listing.photo_urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="h-32 w-full rounded-xl object-cover hover:opacity-90 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </SectionCard>
        )}

        {listing.photo_urls?.length === 0 && (
          <SectionCard title="Photos">
            <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-300">
              <div className="text-center">
                <ImageIcon className="mx-auto mb-1 h-6 w-6 text-slate-300" />
                <p className="text-sm text-slate-400">No photos uploaded</p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Property details */}
        <SectionCard title="Property Details">
          <InfoRow label="Property Type" value={listing.property_type} />
          <InfoRow label="Bedrooms" value={listing.bedrooms} />
          <InfoRow label="Bathrooms" value={listing.bathrooms} />
          <InfoRow label="Max Capacity" value={listing.max_capacity ? `${listing.max_capacity} guests` : null} />
          <InfoRow label="Privacy Level" value={listing.privacy_level} />
          <InfoRow label="Booking Mode" value={listing.booking_mode} />
          <InfoRow
            label="Available Days"
            value={listing.available_days?.join(", ")}
          />
          {listing.description && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="mb-1 text-xs font-medium text-slate-500">Description</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}
        </SectionCard>

        {/* Pricing */}
        <SectionCard title="Pricing">
          <InfoRow
            label="Base Rate"
            value={listing.base_rate != null ? `$${listing.base_rate}/hr` : null}
          />
          <InfoRow
            label="Cleaning Fee"
            value={listing.cleaning_fee != null ? `$${listing.cleaning_fee}` : null}
          />
          <InfoRow
            label="Security Deposit"
            value={listing.security_deposit != null ? `$${listing.security_deposit}` : null}
          />
        </SectionCard>

        {/* Amenities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <SectionCard title="Amenities">
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                >
                  {a}
                </span>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Operational */}
        {(listing.emergency_contact_name ||
          listing.parking_spots != null ||
          listing.load_in_access ||
          listing.access_instructions ||
          listing.property_manager_name ||
          listing.cancellation_policy) && (
          <SectionCard title="Operational Details">
            <InfoRow label="Emergency Contact" value={listing.emergency_contact_name} />
            <InfoRow label="Emergency Phone" value={listing.emergency_contact_phone} />
            <InfoRow
              label="Parking Spots"
              value={listing.parking_spots != null ? listing.parking_spots : null}
            />
            <InfoRow label="Load-In Access" value={listing.load_in_access} />
            <InfoRow label="Access Instructions" value={listing.access_instructions} />
            <InfoRow label="Property Manager" value={listing.property_manager_name} />
            <InfoRow label="Manager Phone" value={listing.property_manager_phone} />
            <InfoRow label="Cancellation Policy" value={listing.cancellation_policy} />
          </SectionCard>
        )}

        {/* Compliance */}
        <SectionCard title="Compliance">
          <InfoRow label="TOT License" value={listing.tot_license_number} />
          <InfoRow label="Business License" value={listing.business_license_number} />
          <div className="mt-2 space-y-0.5">
            <CheckRow label="Has Liability Insurance" value={listing.has_liability_insurance} />
            <CheckRow label="Has Production Insurance" value={listing.has_production_insurance} />
          </div>
        </SectionCard>

        {/* Legal agreements */}
        <SectionCard title="Legal Agreements">
          <CheckRow label="Ownership Certified" value={listing.ownership_certified} />
          <CheckRow label="Owner Agreement Accepted" value={listing.owner_agreement_accepted} />
          <CheckRow label="Insurance Confirmed" value={listing.insurance_confirmed} />
          <CheckRow label="Indemnification Accepted" value={listing.indemnification_accepted} />
          <CheckRow label="Review Acknowledged" value={listing.review_acknowledged} />
          <CheckRow label="Age Verified (18+)" value={listing.age_verified} />
          <CheckRow label="Property Condition Disclosed" value={listing.property_condition_disclosed} />
          <CheckRow label="Zoning Compliant" value={listing.zoning_compliant} />
          <CheckRow label="Right to List Confirmed" value={listing.right_to_list} />
          <CheckRow label="Content Usage Rights Granted" value={listing.content_usage_rights} />
          <CheckRow label="Neighbor Acknowledged" value={listing.neighbor_acknowledged} />
          <CheckRow label="Cancellation Policy Accepted" value={listing.cancellation_accepted} />
        </SectionCard>

        {/* Documents */}
        <SectionCard title="Uploaded Documents">
          {!listing.government_id_url &&
          !listing.ownership_proof_url &&
          !listing.insurance_cert_url &&
          !listing.hoa_approval_url &&
          !listing.w9_url ? (
            <p className="text-sm text-slate-400">No documents uploaded.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              <DocLink label="Government ID" url={listing.government_id_url} />
              <DocLink label="Ownership Proof" url={listing.ownership_proof_url} />
              <DocLink label="Insurance Certificate" url={listing.insurance_cert_url} />
              <DocLink label="HOA Approval" url={listing.hoa_approval_url} />
              <DocLink label="W-9 Form" url={listing.w9_url} />
            </div>
          )}
        </SectionCard>

        {/* Timestamps */}
        <div className="text-xs text-slate-400 pb-4">
          Submitted{" "}
          {new Date(listing.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          {listing.updated_at !== listing.created_at && (
            <>
              {" · "}Last updated{" "}
              {new Date(listing.updated_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
