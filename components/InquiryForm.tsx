'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { getCsrfToken, sanitizeInput, sanitizeEmail } from '@/lib/client-security';

interface InquiryFormProps {
  propertyId: string;
  propertyName: string;
}

const PRODUCTION_TYPES = ['Film', 'TV', 'Commercial', 'Music Video', 'Photo Shoot', 'Event', 'Other'];
const DURATIONS = ['Half Day', 'Full Day', 'Multi-Day', 'Weekly', 'Monthly'];
const BUDGETS = ['Under 1K', '1K-5K', '5K-10K', '10K-25K', '25K-50K', '50K+'];
const HEAR_ABOUT = ['Google', 'Instagram', 'Referral', 'Industry Directory', 'Other'];

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition';
const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition appearance-none';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function InquiryForm({ propertyId, propertyName }: InquiryFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    productionType: '',
    startDate: '',
    endDate: '',
    duration: '',
    crewSize: '',
    budgetRange: '',
    message: '',
    hearAboutUs: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        propertyId,
        propertyName,
        name: sanitizeInput(form.name),
        email: sanitizeEmail(form.email),
        phone: sanitizeInput(form.phone),
        companyName: sanitizeInput(form.companyName),
        productionType: form.productionType,
        startDate: form.startDate,
        endDate: form.endDate,
        duration: form.duration,
        crewSize: sanitizeInput(form.crewSize),
        budgetRange: form.budgetRange,
        message: sanitizeInput(form.message),
        hearAboutUs: form.hearAboutUs,
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="h-7 w-7 text-green-600" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">Inquiry Sent!</h3>
        <p className="text-slate-600">
          The property owner will respond within 24–48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-1 text-2xl font-bold text-slate-900">Inquire About This Property</h2>
      <p className="mb-6 text-sm text-slate-500">Fill out the form below and the host will get back to you shortly.</p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Contact row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Full name <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Jane Smith"
              value={form.name}
              onChange={set('name')}
              required
              maxLength={120}
            />
          </div>
          <div>
            <label className={labelClass}>
              Email <span className="text-blue-600">*</span>
            </label>
            <input
              type="email"
              className={inputClass}
              placeholder="jane@studio.com"
              value={form.email}
              onChange={set('email')}
              required
              maxLength={200}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Phone <span className="text-blue-600">*</span>
            </label>
            <input
              type="tel"
              className={inputClass}
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={set('phone')}
              required
              maxLength={32}
            />
          </div>
          <div>
            <label className={labelClass}>Company / production name</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Acme Productions"
              value={form.companyName}
              onChange={set('companyName')}
              maxLength={120}
            />
          </div>
        </div>

        {/* Production type */}
        <div>
          <label className={labelClass}>
            Production type <span className="text-blue-600">*</span>
          </label>
          <select className={selectClass} value={form.productionType} onChange={set('productionType')} required>
            <option value="">Select a type</option>
            {PRODUCTION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Start date <span className="text-blue-600">*</span>
            </label>
            <input
              type="date"
              className={inputClass}
              value={form.startDate}
              onChange={set('startDate')}
              required
            />
          </div>
          <div>
            <label className={labelClass}>
              End date <span className="text-blue-600">*</span>
            </label>
            <input
              type="date"
              className={inputClass}
              value={form.endDate}
              onChange={set('endDate')}
              required
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className={labelClass}>
            Duration <span className="text-blue-600">*</span>
          </label>
          <select className={selectClass} value={form.duration} onChange={set('duration')} required>
            <option value="">Select duration</option>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Crew & Budget */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Estimated crew size</label>
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 15"
              value={form.crewSize}
              onChange={set('crewSize')}
              min={1}
              max={999}
            />
          </div>
          <div>
            <label className={labelClass}>Budget range</label>
            <select className={selectClass} value={form.budgetRange} onChange={set('budgetRange')}>
              <option value="">Select budget</option>
              {BUDGETS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className={labelClass}>Special requirements / message</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={4}
            placeholder="Tell the host about your project, any specific needs, or questions you have."
            value={form.message}
            onChange={set('message')}
            maxLength={2000}
          />
        </div>

        {/* Hear about us */}
        <div>
          <label className={labelClass}>How did you hear about us?</label>
          <select className={selectClass} value={form.hearAboutUs} onChange={set('hearAboutUs')}>
            <option value="">Select an option</option>
            {HEAR_ABOUT.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending…' : 'Send Inquiry'}
        </button>
      </form>
    </div>
  );
}
