'use client';

import { useEffect, useState } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { getComparedLocationIds, subscribeToComparedLocations, toggleComparedLocation } from '@/lib/compare';

export default function CompareButton({ locationId }: { locationId: string }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(getComparedLocationIds());
    return subscribeToComparedLocations(setIds);
  }, []);

  const active = ids.includes(locationId);
  const full = !active && ids.length >= 4;

  return (
    <button
      type="button"
      disabled={full}
      onClick={() => setIds(toggleComparedLocation(locationId))}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'border-blue-500 bg-blue-500 text-white'
          : 'border-black/10 bg-white text-slate-900 hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
      }`}
      aria-pressed={active}
    >
      <GitCompareArrows className="h-4 w-4" />
      {active ? 'Added to compare' : full ? 'Compare list full' : 'Compare'}
    </button>
  );
}
