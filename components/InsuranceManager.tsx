'use client';

import { AlertCircle, ArrowRight, CalendarClock, CheckCircle2, ExternalLink, FileText, Shield, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export type InsuranceRecord = {
  id: string;
  fileName: string;
  uploadedAt: string;
  expiresAt: string;
  insurer?: string;
  policyNumber?: string;
  status: 'active' | 'expiring-soon' | 'expired';
  source: 'upload' | 'partner-link';
};

const STORAGE_KEY = 'setvenue.insuranceCertificates';
const BLUE = '#3B82F6';

function getStatus(expiresAt: string): InsuranceRecord['status'] {
  if (!expiresAt) return 'active';
  const now = new Date();
  const expiry = new Date(`${expiresAt}T12:00:00`);
  const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring-soon';
  return 'active';
}

function loadRecords(): InsuranceRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InsuranceRecord[];
    return parsed.map((record) => ({ ...record, status: getStatus(record.expiresAt) }));
  } catch {
    return [];
  }
}

function saveRecords(records: InsuranceRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

interface InsuranceManagerProps {
  mode?: 'dashboard' | 'booking';
  onContinue?: (payload: { insuranceStatus: 'uploaded' | 'partner-link' | 'skipped'; insuranceExpiry?: string }) => void;
}

export default function InsuranceManager({ mode = 'dashboard', onContinue }: InsuranceManagerProps) {
  const [records, setRecords] = useState<InsuranceRecord[]>([]);
  const [fileName, setFileName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [insurer, setInsurer] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [error, setError] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<'thimble' | 'produce911' | ''>('');

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const summary = useMemo(() => {
    const active = records.find((record) => record.status !== 'expired');
    const expiring = records.filter((record) => record.status === 'expiring-soon').length;
    const expired = records.filter((record) => record.status === 'expired').length;
    return { active, expiring, expired };
  }, [records]);

  const resetForm = () => {
    setFileName('');
    setExpiresAt('');
    setInsurer('');
    setPolicyNumber('');
    setError('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF certificate for now.');
      return;
    }
    setError('');
    setFileName(file.name);
  };

  const handleUpload = () => {
    if (!fileName) {
      setError('Choose a PDF certificate first.');
      return;
    }

    if (!expiresAt) {
      setError('Add the certificate expiration date so reminders can work.');
      return;
    }

    const newRecord: InsuranceRecord = {
      id: crypto.randomUUID(),
      fileName,
      uploadedAt: new Date().toISOString(),
      expiresAt,
      insurer: insurer.trim(),
      policyNumber: policyNumber.trim(),
      source: 'upload',
      status: getStatus(expiresAt),
    };

    const next = [newRecord, ...records].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    setRecords(next);
    saveRecords(next);
    resetForm();

    if (mode === 'booking' && onContinue) {
      onContinue({ insuranceStatus: 'uploaded', insuranceExpiry: expiresAt });
    }
  };

  const removeRecord = (id: string) => {
    const next = records.filter((record) => record.id !== id);
    setRecords(next);
    saveRecords(next);
  };

  const continueWithPartner = () => {
    if (!selectedPartner) {
      setError('Pick a partner link first.');
      return;
    }
    setError('');
    if (onContinue) onContinue({ insuranceStatus: 'partner-link' });
  };

  const continueWithoutUpload = () => {
    setError('');
    if (onContinue) onContinue({ insuranceStatus: 'skipped' });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-black bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: BLUE }}>Coverage status</p>
          <p className="mt-3 text-2xl font-bold text-black">{summary.active ? 'On file' : 'Needed'}</p>
          <p className="mt-2 text-sm text-black/65">Minimum $1M general liability required.</p>
        </div>
        <div className="rounded-[28px] border border-black bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: BLUE }}>Expiring soon</p>
          <p className="mt-3 text-2xl font-bold text-black">{summary.expiring}</p>
          <p className="mt-2 text-sm text-black/65">Certificates expiring in the next 30 days.</p>
        </div>
        <div className="rounded-[28px] border border-black bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: BLUE }}>Expired</p>
          <p className="mt-3 text-2xl font-bold text-black">{summary.expired}</p>
          <p className="mt-2 text-sm text-black/65">Update before your next booking request.</p>
        </div>
      </div>

      {summary.active && (
        <div className="rounded-[30px] border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-black">Insurance on file: {summary.active.fileName}</p>
              <p className="mt-1 text-sm text-black/70">Expires {summary.active.expiresAt}. Keep it current so booking confirmations stay smooth.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-black bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: BLUE }}>Upload certificate</p>
              <h3 className="mt-2 text-2xl font-bold text-black">Simple PDF upload for now</h3>
              <p className="mt-2 text-sm leading-6 text-black/70">Production insurance protects everyone. Upload a COI or general liability certificate and we’ll keep the visible details handy for future verification work.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block rounded-[24px] border border-dashed border-black/30 bg-[#fafafa] p-5 transition hover:border-blue-500 hover:bg-blue-50/40">
              <span className="flex items-center gap-3 text-sm font-medium text-black">
                <FileText className="h-5 w-5 text-blue-600" />
                {fileName || 'Choose PDF certificate'}
              </span>
              <span className="mt-2 block text-sm text-black/60">PDF only for now. Verification logic can come later.</span>
              <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleFileChange} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-black/70">Expiration date</label>
                <input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} type="date" className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-black outline-none transition focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black/70">Insurer</label>
                <input value={insurer} onChange={(e) => setInsurer(e.target.value)} type="text" placeholder="Thimble, Hiscox, etc." className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-black outline-none transition focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">Policy number (optional)</label>
              <input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} type="text" placeholder="Policy reference" className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-black outline-none transition focus:border-blue-500" />
            </div>

            {error && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{error}</div>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={handleUpload} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
                Upload insurance PDF
                <ArrowRight className="h-4 w-4" />
              </button>
              {mode === 'booking' && (
                <button type="button" onClick={continueWithoutUpload} className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600">
                  Continue without upload for now
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-black bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: BLUE }}>Need coverage?</p>
                <h3 className="mt-2 text-2xl font-bold text-black">Get insurance in minutes</h3>
                <p className="mt-2 text-sm leading-6 text-black/70">Don’t have insurance? Get instant coverage in minutes with a short-term production policy partner.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <label className={`flex cursor-pointer items-start gap-3 rounded-[24px] border p-4 transition ${selectedPartner === 'thimble' ? 'border-blue-500 bg-blue-50' : 'border-black bg-white'}`}>
                <input type="radio" name="partner" className="mt-1" checked={selectedPartner === 'thimble'} onChange={() => setSelectedPartner('thimble')} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-black">Thimble</p>
                    <a href="https://www.thimble.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                      Open link <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="mt-1 text-sm text-black/65">On-demand production insurance with quick online checkout.</p>
                </div>
              </label>

              <label className={`flex cursor-pointer items-start gap-3 rounded-[24px] border p-4 transition ${selectedPartner === 'produce911' ? 'border-blue-500 bg-blue-50' : 'border-black bg-white'}`}>
                <input type="radio" name="partner" className="mt-1" checked={selectedPartner === 'produce911'} onChange={() => setSelectedPartner('produce911')} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-black">Produce911</p>
                    <a href="https://produce911.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                      Open link <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="mt-1 text-sm text-black/65">Short-term production coverage for crews that need a fast COI path.</p>
                </div>
              </label>
            </div>

            {mode === 'booking' && (
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={continueWithPartner} className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
                  I’ll get insurance now
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link href="/insurance" className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600">
                  Learn about requirements
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-black bg-[#fafafa] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-black">Insurance reminders</h3>
                <p className="mt-2 text-sm leading-6 text-black/70">If a certificate is within 30 days of expiration, flag it before the next booking request. That keeps host trust higher and checkout friction lower.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-black bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: BLUE }}>Saved certificates</p>
            <h3 className="mt-2 text-2xl font-bold text-black">Manage uploaded insurance</h3>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-black/25 bg-[#fafafa] px-5 py-10 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-blue-600" />
            <p className="mt-3 font-semibold text-black">No certificate uploaded yet.</p>
            <p className="mt-2 text-sm text-black/65">Upload a PDF above or use a partner link if you need same-day coverage.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {records.map((record) => (
              <div key={record.id} className="flex flex-col gap-4 rounded-[24px] border border-black p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-black">{record.fileName}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${record.status === 'active' ? 'bg-blue-50 text-blue-700' : record.status === 'expiring-soon' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700'}`}>
                      {record.status === 'active' ? 'Active' : record.status === 'expiring-soon' ? 'Expiring soon' : 'Expired'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-black/65">Uploaded {new Date(record.uploadedAt).toLocaleDateString()} • Expires {record.expiresAt || 'Not set'}</p>
                  {(record.insurer || record.policyNumber) && (
                    <p className="mt-1 text-sm text-black/65">{record.insurer || 'Insurer not set'}{record.policyNumber ? ` • Policy ${record.policyNumber}` : ''}</p>
                  )}
                </div>
                <button type="button" onClick={() => removeRecord(record.id)} className="inline-flex items-center gap-2 self-start rounded-full border border-black px-4 py-2 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600 md:self-center">
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
