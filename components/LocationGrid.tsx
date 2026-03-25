'use client';

import { useState } from 'react';
import LocationCard from '@/components/LocationCard';
import { Location } from '@/types/location';

const PAGE_SIZE = 12;

interface LocationGridProps {
  locations: Location[];
}

export default function LocationGrid({ locations }: LocationGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = locations.slice(0, visibleCount);
  const hasMore = visibleCount < locations.length;

  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-black/12 bg-white px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:border-blue-200 hover:text-blue-600"
          >
            Load more ({locations.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </>
  );
}
