'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Users,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  Phone,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink,
  User,
  Shield,
  Home,
  RefreshCw,
} from 'lucide-react';

interface Submission {
  id: string;
  user_id: string | null;
  status: 'pending_review' | 'approved' | 'rejected' | 'changes_requested';
  title: string | null;
  property_type: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  description: string | null;
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
  cancellation_policy: string | null;
  cancellation_accepted: boolean | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  parking_spots: number | null;
  load_in_access: string | null;
  access_instructions: string | null;
  property_manager_name: string | null;
  property_manager_phone: string | null;
  government_id_url: string | null;
  ownership_proof_url: string | null;
  insurance_cert_url: string | null;
  hoa_approval_url: string | null;
  w9_url: string | null;
  photo_urls: string[] | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

type ActionMode = 'idle' | 'changes' | 'reject';

const STATUS_CONFIG = {
  pending_review: { label: 'Pending Review', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  approved: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-800' },
  rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-800' },
  changes_requested: { label: 'Changes Requested', bg: 'bg-blue-100', text: 'text-blue-800' },
};

function CheckItem({ label, value }: { label: string; value: boolean | null | undefined }) {
  const checked = value === true;
  return (
    <div className="flex items-start gap-2.5 py-2">
      {checked ? (
        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
      )}
      <span className={`text-sm ${checked ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex gap-3 py-2 border-b border-slate-50 last:border-0">
      <span className="w-40 shrink-0 text-xs font-medium text-slate-500 uppercase tracking-wide pt-0.5">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionMode, setActionMode] = useState<ActionMode>('idle');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  function getAdminPassword(): string {
    return typeof window !== 'undefined' ? localStorage.getItem('adminPassword') ?? '' : '';
  }

  useEffect(() => {
    const pwd = getAdminPassword();
    if (!pwd) {
      router.replace('/admin');
      return;
    }
    fetchSubmission(pwd);
  }, [id]);

  async function fetchSubmission(pwd: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        headers: { Authorization: `Bearer ${pwd}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('adminPassword');
        router.replace('/admin');
        return;
      }
      if (res.status === 404) {
        setError('Submission not found.');
        setLoading(false);
        return;
      }
      const json = await res.json();
      setSubmission(json.submission);
      if (json.submission?.reviewer_notes) {
        setReviewerNotes(json.submission.reviewer_notes);
      }
    } catch {
      setError('Failed to load submission.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(status: 'approved' | 'rejected' | 'changes_requested', notes?: string) {
    setSaving(true);
    setSaveError('');
    try {
      const pwd = getAdminPassword();
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pwd}`,
        },
        body: JSON.stringify({
          status,
          reviewer_notes: notes ?? reviewerNotes,
          reviewed_by: 'admin',
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Failed to update.');
      }
      const json = await res.json();
      setSubmission(json.submission);
      setActionMode('idle');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading submission…</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <p className="font-medium text-slate-700">{error || 'Submission not found'}</p>
          <Link href="/admin" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[submission.status] ?? STATUS_CONFIG.pending_review;
  const hasPhotos = (submission.photo_urls?.length ?? 0) > 0;
  const hasDocuments = submission.government_id_url || submission.ownership_proof_url ||
    submission.insurance_cert_url || submission.hoa_approval_url || submission.w9_url;

  return (
    <>
      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Property photo"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="min-h-screen bg-slate-50 pb-40">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4 sm:px-6">
            <Link href="/admin" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900">
                {submission.title ?? 'Untitled Property'}
              </h1>
              <p className="text-xs text-slate-500">
                {[submission.city, submission.state].filter(Boolean).join(', ')} · Submitted {formatDate(submission.created_at)}
              </p>
            </div>
            <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6">

          {/* Property Info */}
          <SectionCard title="Property Info" icon={Home}>
            <InfoRow label="Title" value={submission.title} />
            <InfoRow label="Type" value={submission.property_type} />
            <InfoRow label="Address" value={[submission.address, submission.city, submission.state, submission.zip].filter(Boolean).join(', ')} />
            <InfoRow label="Bedrooms" value={submission.bedrooms} />
            <InfoRow label="Bathrooms" value={submission.bathrooms} />
            <InfoRow label="Capacity" value={submission.max_capacity ? `${submission.max_capacity} guests` : null} />
            <InfoRow label="Privacy" value={submission.privacy_level} />
            <InfoRow label="Booking Mode" value={submission.booking_mode} />
            {submission.description && (
              <div className="mt-3 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">Description</p>
                <p className="text-sm text-slate-700 leading-relaxed">{submission.description}</p>
              </div>
            )}
          </SectionCard>

          {/* Pricing */}
          <SectionCard title="Pricing" icon={DollarSign}>
            <InfoRow label="Base Rate" value={submission.base_rate != null ? `$${submission.base_rate}/hr` : null} />
            <InfoRow label="Cleaning Fee" value={submission.cleaning_fee != null ? `$${submission.cleaning_fee}` : null} />
            <InfoRow label="Security Deposit" value={submission.security_deposit != null ? `$${submission.security_deposit}` : null} />
          </SectionCard>

          {/* Availability & Amenities */}
          {((submission.available_days?.length ?? 0) > 0 || (submission.amenities?.length ?? 0) > 0) && (
            <SectionCard title="Availability & Amenities" icon={Calendar}>
              {(submission.available_days?.length ?? 0) > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Available Days</p>
                  <div className="flex flex-wrap gap-1.5">
                    {submission.available_days!.map((day) => (
                      <span key={day} className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{day}</span>
                    ))}
                  </div>
                </div>
              )}
              {(submission.amenities?.length ?? 0) > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Amenities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {submission.amenities!.map((a) => (
                      <span key={a} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          )}

          {/* Photos */}
          {hasPhotos && (
            <SectionCard title={`Photos (${submission.photo_urls!.length})`} icon={ImageIcon}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {submission.photo_urls!.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxUrl(url)}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                      <ExternalLink className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
                    </div>
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Documents */}
          {hasDocuments && (
            <SectionCard title="Documents" icon={FileText}>
              <div className="space-y-2">
                {[
                  { label: 'Government ID', url: submission.government_id_url, required: true },
                  { label: 'Ownership Proof', url: submission.ownership_proof_url, required: true },
                  { label: 'Certificate of Insurance', url: submission.insurance_cert_url, required: false },
                  { label: 'HOA Approval', url: submission.hoa_approval_url, required: false },
                  { label: 'W-9', url: submission.w9_url, required: false },
                ].map(({ label, url, required }) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {url ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-slate-300" />
                      )}
                      <span className="text-sm text-slate-700">{label}</span>
                      {!required && <span className="text-xs text-slate-400">(optional)</span>}
                    </div>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Compliance */}
          <SectionCard title="Compliance & Licensing" icon={Shield}>
            <InfoRow label="TOT License #" value={submission.tot_license_number} />
            <InfoRow label="Business License #" value={submission.business_license_number} />
            <div className="mt-2 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-sm">
                {submission.has_liability_insurance ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-slate-300" />
                )}
                <span className={submission.has_liability_insurance ? 'text-slate-700' : 'text-slate-400'}>Liability Insurance</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                {submission.has_production_insurance ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-slate-300" />
                )}
                <span className={submission.has_production_insurance ? 'text-slate-700' : 'text-slate-400'}>Production Insurance</span>
              </div>
            </div>
          </SectionCard>

          {/* Legal Compliance */}
          <SectionCard title="Legal Agreements" icon={CheckCircle}>
            <div className="grid gap-0 sm:grid-cols-2">
              <CheckItem label="Age verified (18+)" value={submission.age_verified} />
              <CheckItem label="Property condition disclosed" value={submission.property_condition_disclosed} />
              <CheckItem label="Zoning compliant" value={submission.zoning_compliant} />
              <CheckItem label="Right to list" value={submission.right_to_list} />
              <CheckItem label="Content usage rights granted" value={submission.content_usage_rights} />
              <CheckItem label="Neighbor notification acknowledged" value={submission.neighbor_acknowledged} />
              <CheckItem label="Ownership certified" value={submission.ownership_certified} />
              <CheckItem label="Owner agreement accepted" value={submission.owner_agreement_accepted} />
              <CheckItem label="Insurance confirmed" value={submission.insurance_confirmed} />
              <CheckItem label="Indemnification accepted" value={submission.indemnification_accepted} />
              <CheckItem label="Review process acknowledged" value={submission.review_acknowledged} />
              <CheckItem label="Cancellation policy accepted" value={submission.cancellation_accepted} />
            </div>
            {submission.cancellation_policy && (
              <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Cancellation Policy: </span>
                <span className="text-sm text-slate-700">{submission.cancellation_policy}</span>
              </div>
            )}
          </SectionCard>

          {/* Emergency & Access */}
          <SectionCard title="Emergency & Access" icon={Phone}>
            <InfoRow label="Emergency Contact" value={submission.emergency_contact_name} />
            <InfoRow label="Emergency Phone" value={submission.emergency_contact_phone} />
            <InfoRow label="Parking Spots" value={submission.parking_spots} />
            <InfoRow label="Load-In Access" value={submission.load_in_access} />
            <InfoRow label="Access Instructions" value={submission.access_instructions} />
            {(submission.property_manager_name || submission.property_manager_phone) && (
              <>
                <InfoRow label="Property Manager" value={submission.property_manager_name} />
                <InfoRow label="Manager Phone" value={submission.property_manager_phone} />
              </>
            )}
          </SectionCard>

          {/* Previous Review Notes */}
          {submission.reviewed_at && (
            <SectionCard title="Previous Review" icon={User}>
              <InfoRow label="Reviewed By" value={submission.reviewed_by} />
              <InfoRow label="Reviewed At" value={formatDate(submission.reviewed_at)} />
              {submission.reviewer_notes && (
                <div className="mt-3 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">Reviewer Notes</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{submission.reviewer_notes}</p>
                </div>
              )}
            </SectionCard>
          )}

        </main>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">

          {saveError && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>
          )}

          {actionMode === 'idle' ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => handleAction('approved')}
                disabled={saving || submission.status === 'approved'}
                className="flex-1 rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 active:scale-95"
              >
                {saving ? 'Saving…' : submission.status === 'approved' ? 'Already Approved' : 'Approve'}
              </button>
              <button
                onClick={() => setActionMode('changes')}
                disabled={saving}
                className="flex-1 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 active:scale-95"
              >
                Request Changes
              </button>
              <button
                onClick={() => setActionMode('reject')}
                disabled={saving || submission.status === 'rejected'}
                className="flex-1 rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 active:scale-95"
              >
                {submission.status === 'rejected' ? 'Already Rejected' : 'Reject'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  {actionMode === 'changes' ? 'Request Changes' : 'Reject Submission'}
                </p>
                <button
                  onClick={() => { setActionMode('idle'); setSaveError(''); }}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder={actionMode === 'changes'
                  ? 'Describe what changes are needed…'
                  : 'Reason for rejection…'}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setActionMode('idle'); setSaveError(''); }}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(actionMode === 'changes' ? 'changes_requested' : 'rejected')}
                  disabled={saving}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-50 active:scale-95 ${
                    actionMode === 'changes' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {saving ? 'Saving…' : actionMode === 'changes' ? 'Send Request' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
