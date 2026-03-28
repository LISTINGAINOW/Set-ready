'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DollarSign, Home, TrendingUp, ArrowRight, Calculator, Shield, Star } from 'lucide-react';

export default function EarnPage() {
  const [propertyType, setPropertyType] = useState('house');
  const [city, setCity] = useState('Los Angeles');
  const [hourlyRate, setHourlyRate] = useState(300);
  const [daysPerMonth, setDaysPerMonth] = useState(4);

  const estimates = useMemo(() => {
    const hoursPerDay = 10;
    const dailyRevenue = hourlyRate * hoursPerDay;
    const monthlyRevenue = dailyRevenue * daysPerMonth;
    const yearlyRevenue = monthlyRevenue * 12;

    // Competitor comparison
    const giggsterCut = 0.20; // 20% average
    const peerspaceCut = 0.175; // 17.5% average
    const setvenueHostCut = 0; // 0% — our differentiator

    const giggsterYearly = yearlyRevenue * (1 - giggsterCut);
    const peerspaceYearly = yearlyRevenue * (1 - peerspaceCut);
    const setvenueYearly = yearlyRevenue * (1 - setvenueHostCut);
    const savedVsGiggster = setvenueYearly - giggsterYearly;

    return {
      dailyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      giggsterYearly,
      peerspaceYearly,
      setvenueYearly,
      savedVsGiggster,
    };
  }, [hourlyRate, daysPerMonth]);

  const cities = [
    'Los Angeles', 'Malibu', 'Beverly Hills', 'Santa Monica', 'New York',
    'Miami', 'Austin', 'Atlanta', 'San Francisco', 'Nashville',
    'Chicago', 'Denver', 'Portland', 'Seattle', 'San Diego',
  ];

  const propertyTypes = [
    { value: 'house', label: 'House', avgRate: 300 },
    { value: 'estate', label: 'Estate/Mansion', avgRate: 800 },
    { value: 'loft', label: 'Loft/Studio', avgRate: 150 },
    { value: 'ranch', label: 'Ranch/Farm', avgRate: 200 },
    { value: 'penthouse', label: 'Penthouse', avgRate: 500 },
    { value: 'warehouse', label: 'Warehouse/Industrial', avgRate: 175 },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-slate-100 bg-gradient-to-b from-blue-50/50 to-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <DollarSign className="h-4 w-4" />
            Earnings Calculator
          </div>
          <h1 className="text-4xl font-bold tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">
            How much could your property earn?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Film productions, photo shoots, and events pay premium rates for the right space.
            With SetVenue, you keep <strong className="text-slate-950">100% of your rental income</strong> — no host fees, ever.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            {/* Inputs */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3 text-slate-950">
                <Calculator className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Your property</h2>
              </div>

              <div className="mt-8 space-y-6">
                {/* Property type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Property type</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setPropertyType(type.value);
                          setHourlyRate(type.avgRate);
                        }}
                        className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                          propertyType === type.value
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-500"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Hourly rate */}
                <div>
                  <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>Hourly rate</span>
                    <span className="text-lg font-bold text-blue-600">${hourlyRate}/hr</span>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={2000}
                    step={25}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>$50/hr</span>
                    <span>$2,000/hr</span>
                  </div>
                </div>

                {/* Days per month */}
                <div>
                  <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>Shoot days per month</span>
                    <span className="text-lg font-bold text-blue-600">{daysPerMonth} days</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={daysPerMonth}
                    onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>1 day</span>
                    <span>20 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {/* SetVenue earnings */}
              <div className="rounded-[28px] border-2 border-blue-500 bg-blue-50/50 p-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Star className="h-4 w-4 fill-blue-500" />
                  Your SetVenue earnings
                </div>
                <div className="mt-4">
                  <p className="text-5xl font-bold tracking-[-0.04em] text-blue-600">
                    ${estimates.yearlyRevenue.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">estimated per year (you keep 100%)</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-sm text-slate-500">Per month</p>
                    <p className="text-xl font-bold text-slate-950">${estimates.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-sm text-slate-500">Per shoot day</p>
                    <p className="text-xl font-bold text-slate-950">${estimates.dailyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Comparison */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Platform comparison (your take-home)</h3>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">SetVenue</p>
                      <p className="text-sm text-green-600 font-medium">0% host fee</p>
                    </div>
                    <p className="text-xl font-bold text-green-600">${estimates.setvenueYearly.toLocaleString()}/yr</p>
                  </div>
                  <div className="border-t border-slate-100" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-700">Peerspace</p>
                      <p className="text-sm text-slate-400">~17.5% host fee</p>
                    </div>
                    <p className="text-lg font-semibold text-slate-600">${estimates.peerspaceYearly.toLocaleString()}/yr</p>
                  </div>
                  <div className="border-t border-slate-100" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-700">Giggster</p>
                      <p className="text-sm text-slate-400">~20% host fee</p>
                    </div>
                    <p className="text-lg font-semibold text-slate-600">${estimates.giggsterYearly.toLocaleString()}/yr</p>
                  </div>
                </div>

                {estimates.savedVsGiggster > 0 && (
                  <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-semibold text-green-800">
                        Save ${estimates.savedVsGiggster.toLocaleString()}/year vs Giggster
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/list-property"
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
            >
              List your property for free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-4 text-sm text-slate-500">
              No signup fees. No host commissions. First 500 owners get free listing for 6 months.
            </p>
          </div>
        </div>
      </section>

      {/* Why host */}
      <section className="border-t border-slate-100 bg-slate-50/50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Why property owners choose SetVenue
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: DollarSign,
                title: 'Keep 100% of your income',
                description: 'We charge property owners zero fees. Set your own rates and keep every dollar. The 10% service fee is paid by the renter.',
              },
              {
                icon: Shield,
                title: 'Insurance required for every booking',
                description: 'Every production must provide liability insurance naming you as additionally insured. Your property is always protected.',
              },
              {
                icon: Home,
                title: 'You control the rules',
                description: 'Set house rules, approved areas, crew limits, noise restrictions, and booking hours. Accept or decline any request.',
              },
              {
                icon: Calculator,
                title: 'Transparent pricing',
                description: 'No hidden fees, no surprise deductions. What you charge is what you earn. Renters see the total upfront including the service fee.',
              },
              {
                icon: Star,
                title: 'Production-ready support',
                description: 'We match your property with productions that fit. Our team understands film permits, crew logistics, and what productions need.',
              },
              {
                icon: TrendingUp,
                title: 'Earn more per day than monthly rent',
                description: 'A single shoot day at $300/hr can earn more than a month of traditional rental income. Four shoot days a month can change everything.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-slate-200 bg-white p-7">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
