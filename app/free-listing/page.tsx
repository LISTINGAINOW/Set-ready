'use client';

import { useState } from 'react';
import { CheckCircle, Star, TrendingDown, Users, Camera, MapPin } from 'lucide-react';

const TOTAL_SPOTS = 500;
const SPOTS_REMAINING = 500; // hardcoded for now — will wire to Supabase

const PROPERTY_TYPES = ['House', 'Loft', 'Studio', 'Estate', 'Commercial'];

const TARGET_MARKETS = [
  'Los Angeles',
  'Atlanta',
  'New York City',
  'Austin',
  'Miami',
  'Nashville',
];

const BENEFITS = [
  {
    icon: <TrendingDown className="h-6 w-6 text-blue-500" />,
    title: 'Zero Listing Fees for 6 Months',
    description:
      'List your property completely free for the first six months. No monthly fees, no setup costs, no catch.',
  },
  {
    icon: <Star className="h-6 w-6 text-blue-500" />,
    title: 'You Keep 100% of Rental Income',
    description:
      'Your rental price is your rental price. Production companies pay a separate booking fee — it never touches your payout.',
  },
  {
    icon: <Users className="h-6 w-6 text-blue-500" />,
    title: '10% Guest Fee — Half the Industry Standard',
    description:
      'Giggster charges 20–25%. We charge 10%. Lower fees mean more bookings and happier clients who come back.',
  },
];

const COMPARISON = [
  { platform: 'SetVenue', listingFee: 'Free', hostFee: '0% (first 500)', guestFee: '10%', highlight: true },
  { platform: 'Giggster', listingFee: '$49+/mo', hostFee: '0%', guestFee: '20–25%', highlight: false },
  { platform: 'Peerspace', listingFee: 'Free', hostFee: '15%', guestFee: '0%', highlight: false },
];

export default function FreeListingPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    propertyType: '',
    photoCount: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/free-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.08),transparent_60%)]" />
        <div className="mx-auto max-w-4xl text-center">
          {/* Live counter badge */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
            </span>
            <span className="text-sm font-semibold text-slate-700">
              <span className="text-blue-600">{SPOTS_REMAINING}</span> of {TOTAL_SPOTS} spots remaining
            </span>
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
            List Your Property Free —{' '}
            <span className="text-blue-600">Only 500 Spots</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
            No listing fees for 6 months. Production companies pay a 10% booking fee — half what
            Giggster charges. You keep 100% of your rental price.
          </p>

          <a
            href="#signup"
            className="mt-10 inline-flex min-h-[52px] items-center rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
          >
            Claim Your Free Spot
          </a>

          {/* Photo requirement callout */}
          <div className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3">
            <Camera className="h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-sm font-medium text-amber-700">
              10+ professional photos required to qualify
            </p>
          </div>
        </div>
      </section>

      {/* Benefit cards */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-500">
              Why SetVenue
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Built for property owners who are serious about film
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-[28px] border border-black/6 bg-white p-8 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  {b.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-950">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-500">
              Fee comparison
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              The math is simple
            </h2>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-black/6 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            {/* Header row */}
            <div className="grid grid-cols-4 border-b border-black/5 bg-slate-50 px-3 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:px-6 sm:text-xs sm:tracking-[0.2em]">
              <span>Platform</span>
              <span className="text-center">Listing</span>
              <span className="text-center">Host</span>
              <span className="text-center">Guest</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={row.platform}
                className={`grid grid-cols-4 items-center px-3 py-5 sm:px-6 ${
                  i < COMPARISON.length - 1 ? 'border-b border-black/5' : ''
                } ${row.highlight ? 'bg-blue-50/50' : ''}`}
              >
                <span
                  className={`font-semibold ${row.highlight ? 'text-blue-600' : 'text-slate-950'}`}
                >
                  {row.platform}
                  {row.highlight && (
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                      YOU
                    </span>
                  )}
                </span>
                <span
                  className={`text-center text-sm ${
                    row.highlight ? 'font-semibold text-emerald-600' : 'text-slate-500'
                  }`}
                >
                  {row.listingFee}
                </span>
                <span
                  className={`text-center text-sm ${
                    row.highlight ? 'font-semibold text-emerald-600' : 'text-slate-500'
                  }`}
                >
                  {row.hostFee}
                </span>
                <span
                  className={`text-center text-sm ${
                    row.highlight ? 'font-semibold text-emerald-600' : 'text-slate-500'
                  }`}
                >
                  {row.guestFee}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-500">
            Where we operate
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Active in top production markets
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            We focus on cities where film and photo production happens every day.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {TARGET_MARKETS.map((city) => (
              <div
                key={city}
                className="flex items-center gap-2 rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-slate-950 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
              >
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                {city}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign-up form */}
      <section id="signup" className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-500">
              Limited spots
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Claim your free spot
            </h2>
            <p className="mt-3 text-slate-500">
              Only{' '}
              <span className="font-semibold text-blue-600">
                {SPOTS_REMAINING} of {TOTAL_SPOTS}
              </span>{' '}
              spots available. No commitment required.
            </p>
          </div>

          <div className="rounded-[32px] border border-black/6 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-10">
            {submitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-950">You're on the list!</h3>
                <p className="mt-2 text-slate-500">
                  We'll be in touch within 24 hours to get your property set up.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className="min-h-[48px] w-full rounded-2xl border border-black/8 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="min-h-[48px] w-full rounded-2xl border border-black/8 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="address">
                    Property Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={form.address}
                    onChange={handleChange}
                    placeholder="123 Main St, Los Angeles, CA 90001"
                    className="min-h-[48px] w-full rounded-2xl border border-black/8 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="propertyType">
                      Property Type
                    </label>
                    <select
                      id="propertyType"
                      name="propertyType"
                      required
                      value={form.propertyType}
                      onChange={handleChange}
                      className="min-h-[48px] w-full rounded-2xl border border-black/8 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="" disabled>
                        Select type…
                      </option>
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="photoCount">
                      Photos Available
                    </label>
                    <input
                      id="photoCount"
                      name="photoCount"
                      type="number"
                      min="0"
                      required
                      value={form.photoCount}
                      onChange={handleChange}
                      placeholder="e.g. 25"
                      className="min-h-[48px] w-full rounded-2xl border border-black/8 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Photo requirement note */}
                <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <Camera className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-sm text-amber-700">
                    <span className="font-semibold">10+ professional photos required</span> to be
                    published on the platform. We'll let you know if your listing needs more.
                  </p>
                </div>

                {error && (
                  <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[52px] w-full rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'Claim Your Free Spot'}
                </button>

                <p className="text-center text-xs text-slate-400">
                  No credit card required. No commitment. Cancel anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
