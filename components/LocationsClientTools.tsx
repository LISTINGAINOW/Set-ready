'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, BookmarkPlus, GitCompareArrows, Shield } from 'lucide-react';
import type { Location } from '@/types/location';
import { clearComparedLocations, getComparedLocationIds, subscribeToComparedLocations } from '@/lib/compare';
import { getSavedSearches, saveSearch } from '@/lib/saved-searches';
import { getBookingMode, getComparisonAvailability } from '@/lib/location-utils';

export default function LocationsClientTools({ locations, searchParams }: { locations: Location[]; searchParams: Record<string, string | undefined> }) {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setCompareIds(getComparedLocationIds());
    setSavedCount(getSavedSearches().length);
    return subscribeToComparedLocations(setCompareIds);
  }, []);

  const compared = useMemo(() => locations.filter((location) => compareIds.includes(location.id)), [locations, compareIds]);

  const activeFilterSummary = Object.entries(searchParams).filter(([, value]) => value && value.trim().length > 0 && value !== 'grid');

  const saveCurrentSearch = () => {
    const params = new URLSearchParams();
    activeFilterSummary.forEach(([key, value]) => params.set(key, value || ''));
    const name = activeFilterSummary.length > 0 ? activeFilterSummary.map(([key, value]) => `${key}: ${value}`).join(' · ') : 'All locations';
    saveSearch({
      id: `${Date.now()}`,
      name,
      query: params.toString(),
      createdAt: new Date().toISOString(),
      filters: Object.fromEntries(activeFilterSummary.map(([key, value]) => [key, value || ''])),
    });
    setSavedCount(getSavedSearches().length);
    setSaveMessage('Saved locally. Email alerts are demo-logged only.');
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-black bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/50">Moat tools</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">Save this search or compare serious contenders side by side.</h2>
            <p className="mt-2 text-sm text-black/65">Saved searches stay in this browser. New match alerts are logged locally until email delivery is wired up.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={saveCurrentSearch} type="button" className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
              <BookmarkPlus className="h-4 w-4" />
              Save search ({savedCount})
            </button>
            <Link href="/dashboard" className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600">
              <Bell className="h-4 w-4" />
              Dashboard shortcuts
            </Link>
          </div>
        </div>
        {saveMessage ? <p className="mt-3 text-sm text-emerald-700">{saveMessage}</p> : null}
      </div>

      {compared.length > 0 && (
        <div className="rounded-[24px] border border-black bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/50">Comparison tool</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">Side-by-side shortlist</h3>
            </div>
            <button type="button" onClick={clearComparedLocations} className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-black px-4 py-2 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600">
              <GitCompareArrows className="h-4 w-4" />
              Clear compare list
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-black/10">
              <thead className="bg-slate-50 text-left text-sm text-black/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Property</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Amenities</th>
                  <th className="px-4 py-3 font-semibold">Availability</th>
                  <th className="px-4 py-3 font-semibold">Style</th>
                  <th className="px-4 py-3 font-semibold">Booking</th>
                </tr>
              </thead>
              <tbody>
                {compared.map((location) => (
                  <tr key={location.id} className="border-t border-black/10 text-sm text-black/75">
                    <td className="px-4 py-4 font-semibold text-black">{location.name}</td>
                    <td className="px-4 py-4">${location.pricePerHour}/hr</td>
                    <td className="px-4 py-4">{location.sqft ? `${location.sqft.toLocaleString()} sq ft` : 'Contact host'}</td>
                    <td className="px-4 py-4">{location.amenities.slice(0, 3).join(', ')}{location.amenities.length > 3 ? ` +${location.amenities.length - 3}` : ''}</td>
                    <td className="px-4 py-4">{getComparisonAvailability(location)}</td>
                    <td className="px-4 py-4">{location.style || location.propertyType}</td>
                    <td className="px-4 py-4 capitalize">{getBookingMode(location) === 'instant' ? 'Instant book' : 'Request to book'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-black/60">
            <Shield className="h-4 w-4 text-blue-600" />
            Comparison uses already-visible listing data only. Hidden addresses stay hidden.
          </div>
        </div>
      )}
    </div>
  );
}
