"use client";

import { useState } from "react";
import { X, FileText, Shield, AlertCircle, CheckCircle } from "lucide-react";

interface W9ModalProps {
  userId: string;
  onSubmitted: () => void;
  onSkip: () => void;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

export default function W9Modal({ userId, onSubmitted, onSkip }: W9ModalProps) {
  const [legalName, setLegalName]         = useState("");
  const [ssnEin, setSsnEin]               = useState("");
  const [address, setAddress]             = useState("");
  const [city, setCity]                   = useState("");
  const [state, setState]                 = useState("");
  const [zip, setZip]                     = useState("");
  const [signatureAccepted, setSignature] = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState("");
  const [success, setSuccess]             = useState(false);

  // Format SSN/EIN as user types (XXX-XX-XXXX or XX-XXXXXXX)
  function formatTaxId(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }

  function handleTaxIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
    setSsnEin(formatTaxId(raw));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!signatureAccepted) {
      setError("You must sign the W-9 by checking the certification box.");
      return;
    }

    const rawDigits = ssnEin.replace(/\D/g, "");
    if (rawDigits.length !== 9) {
      setError("Please enter a valid 9-digit SSN or EIN.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/w9/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          legal_name: legalName.trim(),
          ssn_ein: ssnEin.replace(/\D/g, ""),
          address: address.trim(),
          city: city.trim(),
          state,
          zip: zip.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");

      setSuccess(true);
      setTimeout(() => onSubmitted(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onSkip} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Complete Your W-9</h2>
              <p className="text-xs text-slate-500">Required for tax reporting (1099-NEC)</p>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <p className="text-base font-semibold text-slate-900">W-9 submitted successfully</p>
            <p className="text-sm text-slate-500">
              Your tax information is on file. You can now receive payouts.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto">
            <div className="space-y-4 px-6 py-5">
              {/* Notice */}
              <div className="flex gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  SetVenue is required by the IRS to collect W-9 information from property owners
                  who earn $600 or more annually. Your information is encrypted and used only for
                  1099-NEC tax filing.
                </p>
              </div>

              {/* Legal Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Full legal name or business name"
                  className="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* SSN / EIN */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SSN or EIN <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={ssnEin}
                    onChange={handleTaxIdChange}
                    placeholder="XX-XXXXXXX"
                    className="block w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Enter your Social Security Number (SSN) or Employer Identification Number (EIN).
                  Only the last 4 digits will be displayed after submission.
                </p>
              </div>

              {/* Address */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street, Apt 4B"
                  className="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* City / State / Zip */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Los Angeles"
                    className="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">—</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ZIP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                    placeholder="90210"
                    className="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Certification */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signatureAccepted}
                    onChange={(e) => setSignature(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Certification:</strong> Under penalties of perjury,
                    I certify that: (1) the number shown on this form is my correct taxpayer identification number,
                    (2) I am not subject to backup withholding, (3) I am a U.S. citizen or other U.S. person,
                    and (4) the FATCA code(s) entered on this form (if any) indicating that I am exempt from
                    FATCA reporting is correct.
                  </span>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={onSkip}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Remind me later
              </button>
              <button
                type="submit"
                disabled={submitting || !signatureAccepted}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                {submitting ? "Submitting…" : "Submit W-9"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
