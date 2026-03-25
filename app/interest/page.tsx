'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { getCsrfToken, isValidEmail, sanitizeEmail, sanitizeInput } from '@/lib/client-security';

const propertyTypes = ['House', 'Loft', 'Studio', 'Penthouse', 'Apartment', 'Villa', 'Warehouse', 'Outdoor', 'Other'];

const initialForm = {
  name: '',
  email: '',
  phone: '',
  propertyType: '',
  propertyAddress: '',
  message: '',
  ownsOrManagesProperty: false,
};

export default function InterestPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inputClassName =
    'min-h-[48px] w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-black outline-none transition focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/15';

  const emailIsValid = useMemo(() => !form.email || isValidEmail(form.email), [form.email]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!isValidEmail(form.email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!form.propertyType) {
      setError('Select your property type.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken(),
        },
        body: JSON.stringify({
          ...form,
          name: sanitizeInput(form.name),
          email: sanitizeEmail(form.email),
          phone: sanitizeInput(form.phone),
          propertyAddress: sanitizeInput(form.propertyAddress),
          message: sanitizeInput(form.message),
        }),
      });

      const payload = (await response.json()) as { error?: string; redirectTo?: string };
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to submit your interest right now.');
      }

      router.push(payload.redirectTo || '/interest/thank-you');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F9FAFB] px-4 py-10 text-black sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
        <section className="rounded-[28px] border-2 border-black bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)] sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6] bg-blue-50 px-4 py-2 text-sm font-semibold text-[#3B82F6]">
            <Mail className="h-4 w-4" />
            Future host intake
          </div>
          <h1 className="mt-5 text-4xl font-bold sm:text-5xl">Interested in hosting?</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-black/75 sm:text-lg">
            Tell us a little about your property and we&apos;ll review whether it&apos;s a fit. This takes about 2 minutes.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Name *</label>
                <input
                  required
                  className={inputClassName}
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: sanitizeInput(e.target.value) }))}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email *</label>
                <input
                  required
                  type="email"
                  className={`${inputClassName} ${emailIsValid ? '' : 'border-red-500 focus:border-red-500'}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: sanitizeEmail(e.target.value) }))}
                />
                {!emailIsValid && <p className="mt-2 text-sm text-red-600">Please enter a valid email address.</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Phone</label>
                <input
                  className={inputClassName}
                  placeholder="Optional"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: sanitizeInput(e.target.value) }))}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Property type *</label>
                <select
                  required
                  className={inputClassName}
                  value={form.propertyType}
                  onChange={(e) => setForm((prev) => ({ ...prev, propertyType: e.target.value }))}
                >
                  <option value="">Select one</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Property address</label>
                <input
                  className={inputClassName}
                  placeholder="Optional"
                  value={form.propertyAddress}
                  onChange={(e) => setForm((prev) => ({ ...prev, propertyAddress: sanitizeInput(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Message</label>
              <textarea
                rows={5}
                className={`${inputClassName} min-h-[140px]`}
                placeholder="Anything useful about the space, neighborhood, availability, or what kinds of bookings you want."
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: sanitizeInput(e.target.value) }))}
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl border-2 border-black bg-[#F9FAFB] p-4">
              <input
                type="checkbox"
                checked={form.ownsOrManagesProperty}
                onChange={(e) => setForm((prev) => ({ ...prev, ownsOrManagesProperty: e.target.checked }))}
                className="mt-1 accent-[#3B82F6]"
              />
              <span>
                <span className="block font-medium">I own/manage this property</span>
                <span className="mt-1 block text-sm text-black/65">
                  Checking this helps us route your inquiry to the right onboarding path.
                </span>
              </span>
            </label>

            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[#3B82F6] px-6 py-4 text-base font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : 'Submit interest'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[28px] border-2 border-black bg-white p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Private by default
            </div>
            <h2 className="mt-5 text-2xl font-bold">What happens next</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-black/75 sm:text-base">
              <li>1. We review the basics of your property.</li>
              <li>2. We log a confirmation email internally — no real send yet.</li>
              <li>3. If it looks like a fit, we move you into the full listing flow.</li>
            </ul>
          </div>

          <div className="rounded-[28px] border-2 border-black bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold">Good fit checklist</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-black/75 sm:text-base">
              <li>• Strong natural light or distinct design</li>
              <li>• Clear access and parking details</li>
              <li>• Flexible availability for shoots or bookings</li>
              <li>• Ownership or management permission in place</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
