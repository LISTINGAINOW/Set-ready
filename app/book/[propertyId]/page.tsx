'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCsrfToken } from '@/lib/client-security';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Upload,
  FileText,
  Shield,
  CreditCard,
  ClipboardCheck,
  User,
} from 'lucide-react';
import HoldHarmlessAgreement from '@/components/HoldHarmlessAgreement';
import ContentPermissionAgreement from '@/components/ContentPermissionAgreement';

// ── Types ──────────────────────────────────────────────────────────────────────

interface RenterDetails {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  productionType: string;
  bookingStart: string;
  bookingEnd: string;
  notes: string;
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  path: string;
  error: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Your Details',       icon: User },
  { id: 2, label: 'ID Verification',    icon: Shield },
  { id: 3, label: 'Insurance (COI)',    icon: FileText },
  { id: 4, label: 'Hold Harmless',      icon: ClipboardCheck },
  { id: 5, label: 'Damage Deposit',     icon: CreditCard },
  { id: 6, label: 'Terms of Service',   icon: CheckCircle },
  { id: 7, label: 'Review & Submit',    icon: ArrowRight },
];

const PRODUCTION_TYPES = [
  'Feature Film',
  'TV / Streaming Series',
  'Commercial / Advertisement',
  'Music Video',
  'Photo Shoot',
  'Documentary',
  'Reality TV',
  'Short Film / Student Film',
  'Corporate Video',
  'Event / Private Gathering',
  'Other',
];

// ── File Upload Helper ─────────────────────────────────────────────────────────

async function uploadDocument(
  file: File,
  endpoint: string,
  bookingId: string,
  extra?: Record<string, string>
): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('bookingId', bookingId);
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => form.append(k, v));
  }
  const res = await fetch(endpoint, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Upload failed');
  return data.path as string;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current - 1) / (total - 1)) * 100);
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full bg-blue-600 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StepIndicator({ steps, current }: { steps: typeof STEPS; current: number }) {
  return (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {steps.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
                ${done   ? 'bg-blue-600 text-white'
                : active ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                :          'bg-slate-100 text-slate-400'}`}
            >
              {done ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : step.id}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-4 h-px ${done ? 'bg-blue-300' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FileUploadBox({
  label,
  hint,
  state,
  onChange,
}: {
  label: string;
  hint: string;
  state: UploadState;
  onChange: (file: File) => void;
}) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) onChange(f);
    },
    [onChange]
  );

  return (
    <label
      className={`block w-full rounded-2xl border-2 border-dashed transition-colors cursor-pointer p-8 text-center
        ${state.file
          ? 'border-blue-300 bg-blue-50'
          : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40'}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="sr-only"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
        }}
      />
      {state.file ? (
        <div className="space-y-1">
          <div className="mx-auto w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-slate-900">{state.file.name}</p>
          <p className="text-xs text-slate-500">{(state.file.size / 1024 / 1024).toFixed(2)} MB — click to replace</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="mx-auto w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
            <Upload className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className="text-xs text-slate-500">{hint}</p>
          <p className="text-xs text-slate-400">JPG, PNG, PDF up to 10 MB</p>
        </div>
      )}
      {state.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
    </label>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition';

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function BookPropertyPage() {
  const params = useParams<{ propertyId?: string }>() ?? {};
  const propertyId = params.propertyId ?? '';

  // Ephemeral booking ID used for uploads before the DB record is created
  const [ephemeralId] = useState(() => `pre_${crypto.randomUUID?.() ?? Date.now()}`);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedBookingId, setSubmittedBookingId] = useState('');

  // Step 1 — Renter details
  const [renter, setRenter] = useState<RenterDetails>({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    productionType: '',
    bookingStart: '',
    bookingEnd: '',
    notes: '',
  });

  // Step 2 — ID upload
  const [idUpload, setIdUpload] = useState<UploadState>({ file: null, uploading: false, path: '', error: '' });

  // Step 3 — COI upload
  const [coiUpload, setCoiUpload] = useState<UploadState>({ file: null, uploading: false, path: '', error: '' });
  const [coiExpiry, setCoiExpiry] = useState('');

  // Step 4 — Hold harmless
  const [holdHarmlessAccepted, setHoldHarmlessAccepted] = useState(false);

  // Step 5 — Damage deposit (set by owner; hardcoded placeholder here)
  const damageDepositAmount = 2500;
  const [depositAcknowledged, setDepositAcknowledged] = useState(false);

  // Step 6 — Terms
  const [tosAccepted, setTosAccepted] = useState(false);
  const [contentPermissionAccepted, setContentPermissionAccepted] = useState(false);
  const [permitConfirmed, setPermitConfirmed] = useState(false);

  // ── Validation per step ──────────────────────────────────────────────────────

  function stepValid(s: number): boolean {
    switch (s) {
      case 1:
        return !!(
          renter.companyName.trim() &&
          renter.contactName.trim() &&
          renter.contactEmail.trim() &&
          renter.contactPhone.trim() &&
          renter.productionType
        );
      case 2:
        return !!(idUpload.path || idUpload.file);
      case 3:
        return !!(coiUpload.path || coiUpload.file) && !!coiExpiry;
      case 4:
        return holdHarmlessAccepted;
      case 5:
        return depositAcknowledged;
      case 6:
        return tosAccepted && contentPermissionAccepted && permitConfirmed;
      case 7:
        return true;
      default:
        return false;
    }
  }

  // ── Upload helpers ───────────────────────────────────────────────────────────

  async function ensureIdUploaded(): Promise<string> {
    if (idUpload.path) return idUpload.path;
    if (!idUpload.file) throw new Error('No ID file selected');
    setIdUpload((s) => ({ ...s, uploading: true, error: '' }));
    try {
      const path = await uploadDocument(idUpload.file, '/api/upload/id', ephemeralId);
      setIdUpload((s) => ({ ...s, uploading: false, path }));
      return path;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setIdUpload((s) => ({ ...s, uploading: false, error: msg }));
      throw e;
    }
  }

  async function ensureCoiUploaded(): Promise<string> {
    if (coiUpload.path) return coiUpload.path;
    if (!coiUpload.file) throw new Error('No COI file selected');
    setCoiUpload((s) => ({ ...s, uploading: true, error: '' }));
    try {
      const path = await uploadDocument(coiUpload.file, '/api/upload/coi', ephemeralId, { expiryDate: coiExpiry });
      setCoiUpload((s) => ({ ...s, uploading: false, path }));
      return path;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setCoiUpload((s) => ({ ...s, uploading: false, error: msg }));
      throw e;
    }
  }

  // ── Next / Prev ──────────────────────────────────────────────────────────────

  async function handleNext() {
    if (step === 2 && idUpload.file && !idUpload.path) {
      try { await ensureIdUploaded(); } catch { return; }
    }
    if (step === 3 && coiUpload.file && !coiUpload.path) {
      try { await ensureCoiUploaded(); } catch { return; }
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  // ── Final Submit ─────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');

    try {
      let idPath = idUpload.path;
      let coiPath = coiUpload.path;

      if (!idPath && idUpload.file) idPath = await ensureIdUploaded();
      if (!coiPath && coiUpload.file) coiPath = await ensureCoiUploaded();

      if (!idPath) throw new Error('ID document is required');
      if (!coiPath) throw new Error('Certificate of Insurance is required');

      const bookingStart = renter.bookingStart ? new Date(renter.bookingStart) : null;
      const bookingEnd = renter.bookingEnd ? new Date(renter.bookingEnd) : null;

      if (!bookingStart || Number.isNaN(bookingStart.getTime())) {
        throw new Error('Booking start is required');
      }

      if (!bookingEnd || Number.isNaN(bookingEnd.getTime())) {
        throw new Error('Booking end is required');
      }

      const notes = [
        renter.notes.trim() ? `Notes: ${renter.notes.trim()}` : '',
        renter.companyName.trim() ? `Company: ${renter.companyName.trim()}` : '',
        `ID document: ${idPath}`,
        `COI document: ${coiPath}`,
        coiExpiry ? `COI expiry: ${coiExpiry}` : '',
        holdHarmlessAccepted ? 'Hold harmless accepted: yes' : '',
        tosAccepted ? 'Terms accepted: yes' : '',
        contentPermissionAccepted ? 'Content permission accepted: yes' : '',
        permitConfirmed ? 'Permit confirmation: yes' : '',
        depositAcknowledged ? 'Damage deposit acknowledged: yes' : '',
      ]
        .filter(Boolean)
        .join('\n');

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken(),
        },
        body: JSON.stringify({
          locationId: propertyId,
          name: renter.contactName,
          email: renter.contactEmail,
          phone: renter.contactPhone,
          date: bookingStart.toISOString().slice(0, 10),
          startTime: bookingStart.toISOString().slice(11, 16),
          endTime: bookingEnd.toISOString().slice(11, 16),
          productionType: renter.productionType,
          notes: notes || undefined,
          securityDeposit: damageDepositAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Submission failed');

      setSubmittedBookingId(data.booking?.id ?? '');
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ───────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Booking Request Submitted</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your booking request has been received and is under review. You&rsquo;ll hear back within 24–48 hours.
            </p>
            {submittedBookingId && (
              <p className="text-xs text-slate-400 font-mono mt-1">Ref: {submittedBookingId}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/locations"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Browse More Locations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Wizard Layout ────────────────────────────────────────────────────────────

  const currentStep = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href={`/locations/${propertyId}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to property
          </Link>
          <span className="text-sm font-semibold text-slate-900">Book This Location</span>
          <span className="text-sm text-slate-400">Step {step} of {STEPS.length}</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Progress */}
        <div className="space-y-3">
          <ProgressBar current={step} total={STEPS.length} />
          <StepIndicator steps={STEPS} current={step} />
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900">{currentStep.label}</h1>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

          {/* ── Step 1: Renter Details ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Tell us about your production company and who we&rsquo;ll be working with.</p>
              <FieldGroup label="Production Company or Organization *">
                <input
                  className={inputClass}
                  placeholder="Acme Productions LLC"
                  value={renter.companyName}
                  onChange={(e) => setRenter((r) => ({ ...r, companyName: e.target.value }))}
                />
              </FieldGroup>
              <FieldGroup label="Primary Contact Name *">
                <input
                  className={inputClass}
                  placeholder="Jane Smith"
                  value={renter.contactName}
                  onChange={(e) => setRenter((r) => ({ ...r, contactName: e.target.value }))}
                />
              </FieldGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Email *">
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="jane@acme.com"
                    value={renter.contactEmail}
                    onChange={(e) => setRenter((r) => ({ ...r, contactEmail: e.target.value }))}
                  />
                </FieldGroup>
                <FieldGroup label="Phone *">
                  <input
                    className={inputClass}
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={renter.contactPhone}
                    onChange={(e) => setRenter((r) => ({ ...r, contactPhone: e.target.value }))}
                  />
                </FieldGroup>
              </div>
              <FieldGroup label="Production Type *">
                <select
                  className={inputClass}
                  value={renter.productionType}
                  onChange={(e) => setRenter((r) => ({ ...r, productionType: e.target.value }))}
                >
                  <option value="">Select production type…</option>
                  {PRODUCTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FieldGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Shoot Start Date">
                  <input
                    className={inputClass}
                    type="date"
                    value={renter.bookingStart}
                    onChange={(e) => setRenter((r) => ({ ...r, bookingStart: e.target.value }))}
                  />
                </FieldGroup>
                <FieldGroup label="Shoot End Date">
                  <input
                    className={inputClass}
                    type="date"
                    value={renter.bookingEnd}
                    onChange={(e) => setRenter((r) => ({ ...r, bookingEnd: e.target.value }))}
                  />
                </FieldGroup>
              </div>
              <FieldGroup label="Additional Notes">
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Crew size, equipment, special requirements…"
                  value={renter.notes}
                  onChange={(e) => setRenter((r) => ({ ...r, notes: e.target.value }))}
                />
              </FieldGroup>
            </div>
          )}

          {/* ── Step 2: ID Verification ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800 space-y-1">
                <p className="font-semibold">Government-issued photo ID required</p>
                <p>Upload a clear photo or scan of a valid driver&rsquo;s license or passport for the primary contact. This document is stored securely and only reviewed by SetVenue staff.</p>
              </div>
              <FileUploadBox
                label="Upload Government Photo ID"
                hint="Driver's license or passport — front side clearly visible"
                state={idUpload}
                onChange={(f) => setIdUpload((s) => ({ ...s, file: f, path: '', error: '' }))}
              />
              {idUpload.uploading && (
                <p className="text-xs text-blue-600 text-center animate-pulse">Uploading securely…</p>
              )}
              {idUpload.path && (
                <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ID uploaded securely
                </p>
              )}
              <p className="text-xs text-slate-400 text-center">Your document is encrypted and stored in a private, access-controlled bucket. It is never shared publicly.</p>
            </div>
          )}

          {/* ── Step 3: COI Upload ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800 space-y-1">
                <p className="font-semibold">Certificate of Insurance (COI) required</p>
                <p>You must carry a minimum of <strong>$1,000,000 general liability</strong> per occurrence. Upload a current COI naming the property owner and SetVenue as additional insureds.</p>
              </div>
              <FileUploadBox
                label="Upload Certificate of Insurance"
                hint="ACORD 25 form or equivalent — must show $1M+ coverage"
                state={coiUpload}
                onChange={(f) => setCoiUpload((s) => ({ ...s, file: f, path: '', error: '' }))}
              />
              {coiUpload.uploading && (
                <p className="text-xs text-blue-600 text-center animate-pulse">Uploading securely…</p>
              )}
              {coiUpload.path && (
                <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  COI uploaded securely
                </p>
              )}
              <FieldGroup label="COI Expiry Date *">
                <input
                  className={inputClass}
                  type="date"
                  value={coiExpiry}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCoiExpiry(e.target.value)}
                />
              </FieldGroup>
              <p className="text-xs text-slate-400 text-center">Your COI is stored privately and shared only with the property owner upon booking approval.</p>
            </div>
          )}

          {/* ── Step 4: Hold Harmless ── */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Please read the following agreement in full before accepting.</p>
              <HoldHarmlessAgreement
                accepted={holdHarmlessAccepted}
                onAcceptedChange={setHoldHarmlessAccepted}
              />
            </div>
          )}

          {/* ── Step 5: Damage Deposit ── */}
          {step === 5 && (
            <div className="space-y-5">
              <p className="text-sm text-slate-500">
                This property requires a refundable damage deposit. The deposit is held securely via Stripe and
                released within 5–7 business days after your rental if no damage is reported.
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Damage Deposit</p>
                <p className="text-4xl font-bold text-slate-900">${damageDepositAmount.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Held via Stripe — fully refundable</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 space-y-2">
                <p className="font-semibold text-slate-900">How the deposit works</p>
                <ul className="space-y-1.5 text-slate-600">
                  <li className="flex items-start gap-2"><span className="mt-0.5 text-blue-500">•</span> The deposit is placed as a Stripe authorization hold at booking confirmation — your card is not charged unless damage is found.</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 text-blue-500">•</span> The property owner has up to 48 hours after your rental ends to report any damage.</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 text-blue-500">•</span> If no damage is reported, the hold is released automatically within 5–7 business days.</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 text-blue-500">•</span> If damage is reported, SetVenue will contact both parties before any funds are captured.</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 text-blue-500">•</span> Your liability is not limited to the deposit amount — you remain responsible for the full cost of any damage.</li>
                </ul>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={depositAcknowledged}
                    onChange={(e) => setDepositAcknowledged(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center
                    ${depositAcknowledged
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-slate-300 group-hover:border-blue-400'}`}
                  >
                    {depositAcknowledged && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-700 leading-snug">
                  I understand and acknowledge the{' '}
                  <span className="font-semibold text-slate-900">${damageDepositAmount.toLocaleString()} damage deposit</span>{' '}
                  requirement and the refund process described above.
                </span>
              </label>
            </div>
          )}

          {/* ── Step 6: Terms of Service ── */}
          {step === 6 && (
            <div className="space-y-5">
              <p className="text-sm text-slate-500">
                Please review and accept each of the following before submitting your booking.
              </p>

              {/* ToS */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 max-h-48 overflow-y-auto text-sm text-slate-600 space-y-2 leading-relaxed">
                <p className="font-semibold text-slate-900">SetVenue Terms of Service (Summary)</p>
                <p>By booking through SetVenue, you agree to our full <Link href="/legal/terms" className="text-blue-600 underline" target="_blank">Terms of Service</Link>. Key provisions include:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>SetVenue is a marketplace platform and not a party to the rental agreement between renter and owner.</li>
                  <li>Renters are responsible for all production activities, crew conduct, and property care.</li>
                  <li>Cancellations are subject to the property&rsquo;s individual cancellation policy.</li>
                  <li>SetVenue may suspend or terminate accounts for violations of these terms.</li>
                  <li>Disputes between renters and owners are subject to SetVenue&rsquo;s <Link href="/legal/disputes" className="text-blue-600 underline" target="_blank">Dispute Resolution Policy</Link>.</li>
                  <li>Use of the platform constitutes acceptance of the <Link href="/legal/privacy" className="text-blue-600 underline" target="_blank">Privacy Policy</Link>.</li>
                </ul>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input type="checkbox" checked={tosAccepted} onChange={(e) => setTosAccepted(e.target.checked)} className="sr-only" />
                  <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${tosAccepted ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                    {tosAccepted && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
                <span className="text-sm text-slate-700">I have read and agree to the <Link href="/legal/terms" className="text-blue-600 underline font-medium" target="_blank">SetVenue Terms of Service</Link> and <Link href="/legal/privacy" className="text-blue-600 underline font-medium" target="_blank">Privacy Policy</Link>.</span>
              </label>

              {/* Content Permission */}
              <div className="pt-2 border-t border-slate-100">
                <ContentPermissionAgreement
                  authorizedContentTypes={[]}
                  accepted={contentPermissionAccepted}
                  onAcceptedChange={setContentPermissionAccepted}
                  productionType={renter.productionType}
                />
              </div>

              {/* Permit */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input type="checkbox" checked={permitConfirmed} onChange={(e) => setPermitConfirmed(e.target.checked)} className="sr-only" />
                    <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${permitConfirmed ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                      {permitConfirmed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>
                  <span className="text-sm text-slate-700 leading-snug">
                    I confirm that I will obtain all required <span className="font-semibold text-slate-900">filming permits, location permits, and municipal approvals</span> prior to the start of production. I understand that failure to obtain required permits is my sole responsibility.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ── Step 7: Review & Submit ── */}
          {step === 7 && (
            <div className="space-y-5">
              <p className="text-sm text-slate-500">Review your booking details before submitting.</p>

              {/* Summary card */}
              <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden text-sm">
                {[
                  ['Company', renter.companyName],
                  ['Contact', renter.contactName],
                  ['Email', renter.contactEmail],
                  ['Phone', renter.contactPhone],
                  ['Production Type', renter.productionType],
                  ['Shoot Dates', renter.bookingStart ? `${renter.bookingStart} → ${renter.bookingEnd || 'TBD'}` : 'Not specified'],
                  ['Government ID', idUpload.path ? 'Uploaded' : idUpload.file ? 'Ready to upload' : 'Missing'],
                  ['Certificate of Insurance', coiUpload.path ? `Uploaded (expires ${coiExpiry})` : coiUpload.file ? 'Ready to upload' : 'Missing'],
                  ['Damage Deposit', `$${damageDepositAmount.toLocaleString()} (held via Stripe)`],
                  ['Hold Harmless Agreement', holdHarmlessAccepted ? 'Accepted' : 'Not accepted'],
                  ['Terms of Service', tosAccepted ? 'Accepted' : 'Not accepted'],
                  ['Content Permission', contentPermissionAccepted ? 'Accepted' : 'Not accepted'],
                  ['Permit Confirmation', permitConfirmed ? 'Confirmed' : 'Not confirmed'],
                ].map(([label, value]) => (
                  <div key={label} className="flex px-4 py-2.5 gap-4 bg-white">
                    <dt className="w-40 flex-shrink-0 text-slate-500">{label}</dt>
                    <dd className={`font-medium ${value?.includes('Missing') || value?.includes('Not') ? 'text-red-600' : 'text-slate-900'}`}>{value}</dd>
                  </div>
                ))}
              </dl>

              {submitError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
                By submitting this request, you confirm that all information provided is accurate and that you agree
                to all agreements accepted in the prior steps. Your booking request will be reviewed by the property
                owner and SetVenue before confirmation.
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length ? (
            <button
              onClick={handleNext}
              disabled={!stepValid(step) || idUpload.uploading || coiUpload.uploading}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !stepValid(6)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  Submit Booking Request
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
