'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitCompareArrows, X } from 'lucide-react';
import {
  clearComparedLocations,
  getComparedLocationIds,
  subscribeToComparedLocations,
} from '@/lib/compare';

export default function CompareFloatingBar() {
  const [ids, setIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    setIds(getComparedLocationIds());
    return subscribeToComparedLocations(setIds);
  }, []);

  if (ids.length < 2) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 lg:bottom-6">
      <div className="flex items-center gap-3 rounded-full border border-black bg-white px-5 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-900">
            {ids.length} propert{ids.length === 1 ? 'y' : 'ies'} selected
          </span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <button
          type="button"
          onClick={() => router.push('/compare')}
          className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          Compare
        </button>
        <button
          type="button"
          onClick={() => clearComparedLocations()}
          aria-label="Clear compare list"
          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
