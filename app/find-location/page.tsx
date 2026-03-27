'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle, MapPin } from 'lucide-react';
import { getCsrfToken, isValidEmail, sanitizeEmail, sanitizeInput } from '@/lib/client-security';

const PRODUCTION_TYPES = ['Film', 'Photo Shoot', 'Music Video', 'Commercial', 'Corporate Event', 'Wedding/Party', 'Podcast/Interview', 'Other'];

const CITIES = [
  'Los Angeles', 'Atlanta', 'New York City', 'Austin', 'Miami', 'Nashville',
  'New Orleans', 'Albuquerque', 'Santa Fe', 'Pittsburgh', 'Detroit', 'Savannah',
  'Honolulu', 'Salt Lake City', 'Portland', 'Seattle', 'San Francisco', 'Chicago',
  'Wilmington NC', 'Oklahoma City', 'Other US City',
];

const DURATIONS = ['Half Day 4hrs', 'Full Day 8hrs', 'Multi-Day', 'Weekly', 'Monthly'];
const CREW_SIZES = ['1-5', '6-15', '16-30', '31-50', '50+'];
const BUDGETS = ['Under $500', '$500-$1000', '$1000-$2500', '$2500-$5000', '$5000-$10000', '$10000+', 'Flexible'];
const FEATURES = [
  'Pool', 'Ocean View', 'Mountain View', 'Modern Kitchen', 'Large Backyard',
  'Rooftop', 'Parking 5+ Vehicles', 'Natural Light', 'Industrial/Warehouse',
  'Privacy/Gated', 'Furnished', 'Historic/Character', 'Outdoor Space',
];

const inputCls =
  'min-h-[48px] w-full rounded-xl border border-black/12 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400';

const selectCls =
  'min-h-[48px] w-full rounded-xl border border-black/12 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none';

const labelCls = 'block text-sm font-semibold text-slate-800 mb-1.5';

export default function FindLocationPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    productionType: '',
    preferredCity: '',
    datesNeeded: '',
    duration: '',
    crewSize: '',
    budgetRange: '',
    mustHaveFeatures: [] as string[],
    description: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleFeature = (feature: string) => {
    setForm((prev) => ({
      ...prev,
      mustHaveFeatures: prev.mustHaveFeatures.includes(feature)
        ? prev.mustHaveFeatures.filter((f) => f !== feature)
        : [...prev.mustHaveFeatures, feature],
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Full name is required.');
    if (!isValidEmail(form.email)) return setError('Enter a valid email address.');
    if (!form.description.trim() || form.description.trim().length < 20)
      return setError('Please describe your project (at least 20 characters).');

    try {
      setSubmitting(true);
      const res = await fetch('/api/find-location', {
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
          company: sanitizeInput(form.company),
          description: sanitizeInput(form.description),
        }),
      });

      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error || 'Something went wrong. Please try again.');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfc_100%)] text-slate-950">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-16 text-center sm:px-6 sm:pt-20 lg:px-8">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
          <MapPin className="h-3.5 w-3.5" />
          Location Concierge
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Find Me a Location
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-500 sm:text-xl">
          Tell us what you need. We personally match you with 3–5 properties within 24 hours. No browsing. No guessing.
        </p>
      </section>

      {/* Form / Success */}
      <section className="mx-auto max-w-2xl px-4 pb-24 sm:px-6 lg:px-8">
        {success ? (
          <div className="rounded-[32px] border border-black/8 bg-white p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">You are all set!</h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-500">
              Got it! We will personally review your requirements and send you 3–5 matching locations within 24 hours. Check your inbox.
            </p>
          </div>
        ) : (
          <div className="rounded-[32px] border border-black/8 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-10">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Contact */}
              <div>
                <h2 className="mb-4 text-base font-semibold uppercase tracking-[0.18em] text-blue-600">Contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className={labelCls}>
                      Full name <span className="text-blue-600">*</span>
                    </label>
                    <input id="name" type="text" required value={form.name} onChange={set('name')} className={inputCls} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelCls}>
                      Email <span className="text-blue-600">*</span>
                    </label>
                    <input id="email" type="email" required value={form.email} onChange={set('email')} className={inputCls} placeholder="jane@company.com" />
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelCls}>
                      Phone <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input id="phone" type="tel" value={form.phone} onChange={set('phone')} className={inputCls} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label htmlFor="company" className={labelCls}>
                      Company <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input id="company" type="text" value={form.company} onChange={set('company')} className={inputCls} placeholder="Production Co." />
                  </div>
                </div>
              </div>

              {/* Production Details */}
              <div>
                <h2 className="mb-4 text-base font-semibold uppercase tracking-[0.18em] text-blue-600">Production Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="productionType" className={labelCls}>Production type</label>
                    <div className="relative">
                      <select id="productionType" value={form.productionType} onChange={set('productionType')} className={selectCls}>
                        <option value="">Select type…</option>
                        {PRODUCTION_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="preferredCity" className={labelCls}>Preferred city</label>
                    <div className="relative">
                      <select id="preferredCity" value={form.preferredCity} onChange={set('preferredCity')} className={selectCls}>
                        <option value="">Select city…</option>
                        {CITIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="datesNeeded" className={labelCls}>Date(s) needed</label>
                    <input id="datesNeeded" type="text" value={form.datesNeeded} onChange={set('datesNeeded')} className={inputCls} placeholder="e.g. March 15-17, or Flexible" />
                  </div>
                  <div>
                    <label htmlFor="duration" className={labelCls}>Duration</label>
                    <div className="relative">
                      <select id="duration" value={form.duration} onChange={set('duration')} className={selectCls}>
                        <option value="">Select duration…</option>
                        {DURATIONS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="crewSize" className={labelCls}>Crew size</label>
                    <div className="relative">
                      <select id="crewSize" value={form.crewSize} onChange={set('crewSize')} className={selectCls}>
                        <option value="">Select size…</option>
                        {CREW_SIZES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="budgetRange" className={labelCls}>Budget range</label>
                    <div className="relative">
                      <select id="budgetRange" value={form.budgetRange} onChange={set('budgetRange')} className={selectCls}>
                        <option value="">Select budget…</option>
                        {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Must-have Features */}
              <div>
                <label className={labelCls}>Must-have features</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {FEATURES.map((feature) => {
                    const checked = form.mustHaveFeatures.includes(feature);
                    return (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleFeature(feature)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          checked
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-black/12 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        {feature}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className={labelCls}>
                  Project description <span className="text-blue-600">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={5}
                  value={form.description}
                  onChange={set('description')}
                  className="w-full rounded-xl border border-black/12 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 resize-none"
                  placeholder="Tell us about your project and the kind of space you are looking for"
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Find My Location'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              We cover all 50 states. If you need a location anywhere in the USA, we will find it.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
