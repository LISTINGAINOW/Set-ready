'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GitCompareArrows, MapPin, Star, X, ArrowLeft } from 'lucide-react';
import type { Location } from '@/types/location';
import locationsData from '@/data/locations.json';
import {
  clearComparedLocations,
  getComparedLocationIds,
  subscribeToComparedLocations,
  toggleComparedLocation,
} from '@/lib/compare';

const allLocations = locationsData as unknown as Location[];

function formatType(type: string) {
  return type.replace(/([A-Z])/g, ' $1').trim();
}

function getPrimaryPhoto(location: Location) {
  return (
    location.images?.[0] ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
  );
}

type RowDef = {
  label: string;
  render: (loc: Location) => React.ReactNode;
};

const ROWS: RowDef[] = [
  {
    label: 'Type',
    render: (loc) => formatType(loc.propertyType),
  },
  {
    label: 'Location',
    render: (loc) => `${loc.city}, ${loc.state}`,
  },
  {
    label: 'Rate',
    render: (loc) => (
      <span className="font-semibold text-slate-950">
        ${loc.pricePerHour.toLocaleString()}
        <span className="ml-0.5 font-normal text-slate-500">/hr</span>
      </span>
    ),
  },
  {
    label: 'Beds / Baths',
    render: (loc) => `${loc.beds || '–'} beds · ${loc.baths || '–'} baths`,
  },
  {
    label: 'Sqft',
    render: (loc) => (loc.sqft ? loc.sqft.toLocaleString() + ' sqft' : '–'),
  },
  {
    label: 'Capacity',
    render: (loc) => {
      const cap = loc.maxGuests || loc.maxCapacity;
      return cap ? `${cap} guests` : '–';
    },
  },
  {
    label: 'Style',
    render: (loc) => loc.style || '–',
  },
  {
    label: 'Rating',
    render: (loc) => (
      <span className="inline-flex items-center gap-1">
        <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
        {(loc.reviewRating || 4.8).toFixed(1)}
        <span className="text-slate-400">({loc.reviewCount || 12} reviews)</span>
      </span>
    ),
  },
  {
    label: 'Amenities',
    render: (loc) => (
      <ul className="space-y-1">
        {loc.amenities.slice(0, 8).map((a) => (
          <li key={a} className="flex items-start gap-1.5 text-sm">
            <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-blue-100 text-center text-xs text-blue-600 leading-4">
              ✓
            </span>
            {a}
          </li>
        ))}
        {loc.amenities.length > 8 && (
          <li className="text-xs text-slate-400">+{loc.amenities.length - 8} more</li>
        )}
      </ul>
    ),
  },
  {
    label: 'Best Uses',
    render: (loc) => (
      <div className="flex flex-wrap gap-1">
        {(loc.bestUses || []).map((use) => (
          <span
            key={use}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700"
          >
            {use}
          </span>
        ))}
        {!loc.bestUses?.length && <span className="text-slate-400">–</span>}
      </div>
    ),
  },
];

export default function ComparePage() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(getComparedLocationIds());
    return subscribeToComparedLocations(setIds);
  }, []);

  const properties = useMemo(
    () => ids.map((id) => allLocations.find((l) => l.id === id)).filter(Boolean) as Location[],
    [ids],
  );

  const removeProperty = (id: string) => {
    setIds(toggleComparedLocation(id));
  };

  if (ids.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
          <GitCompareArrows className="h-10 w-10 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-950">No properties to compare</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          Select 2–4 properties from search results or browse listings and use the Compare button on
          each card.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </Link>
          <Link
            href="/locations"
            className="inline-flex items-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:border-blue-300 hover:text-blue-600"
          >
            Browse locations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-black/8 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link
                href="/search"
                className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to search
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Compare Properties
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} selected
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/locations"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:border-blue-300 hover:text-blue-600"
              >
                Add more
              </Link>
              <button
                type="button"
                onClick={() => clearComparedLocations()}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-500 hover:border-red-200 hover:text-red-600"
              >
                <X className="h-4 w-4" />
                Clear all
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compare table */}
      <div className="overflow-x-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `160px repeat(${properties.length}, minmax(220px, 1fr))` }}
          >
            {/* Header row */}
            <div className="flex items-end pb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Properties
              </span>
            </div>
            {properties.map((loc) => (
              <div
                key={loc.id}
                className="overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image
                    src={getPrimaryPhoto(loc)}
                    alt={loc.name}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeProperty(loc.id)}
                    aria-label={`Remove ${loc.name} from comparison`}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 backdrop-blur-md hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {/* Name + location */}
                <div className="p-4">
                  <Link
                    href={`/locations/${loc.id}`}
                    className="line-clamp-2 text-base font-semibold text-slate-950 hover:text-blue-600"
                  >
                    {loc.name}
                  </Link>
                  <div className="mt-1.5 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                    {loc.city}, {loc.state}
                  </div>
                </div>
              </div>
            ))}

            {/* Data rows */}
            {ROWS.map((row) => (
              <>
                <div
                  key={`label-${row.label}`}
                  className="flex items-center border-t border-slate-100 py-4"
                >
                  <span className="text-sm font-semibold text-slate-500">{row.label}</span>
                </div>
                {properties.map((loc) => (
                  <div
                    key={`${row.label}-${loc.id}`}
                    className="border-t border-slate-100 px-4 py-4 text-sm text-slate-700"
                  >
                    {row.render(loc)}
                  </div>
                ))}
              </>
            ))}

            {/* CTA row */}
            <div className="border-t border-slate-100 py-4">
              <span className="text-sm font-semibold text-slate-500">Actions</span>
            </div>
            {properties.map((loc) => (
              <div
                key={`cta-${loc.id}`}
                className="flex flex-col gap-2 border-t border-slate-100 px-4 py-4"
              >
                <Link
                  href={`/locations/${loc.id}`}
                  className="block w-full rounded-full bg-blue-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  View details
                </Link>
                <Link
                  href={`/locations/${loc.id}`}
                  className="block w-full rounded-full border border-black/10 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-900 transition hover:border-blue-300 hover:text-blue-600"
                >
                  Book now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
