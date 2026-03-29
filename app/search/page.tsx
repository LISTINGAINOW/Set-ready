import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllProperties } from '@/lib/properties';
import SearchClient from '@/components/SearchClient';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Search Production Locations | SetVenue',
  description: 'Search film locations, photo shoot venues, production spaces, and crew housing across the US. Filter by city, property type, price, crew size, and amenities.',
  alternates: { canonical: '/search' },
  openGraph: {
    title: 'Search Production Locations | SetVenue',
    description: 'Find and book production-ready locations across the US. Real-time filtering by city, type, price, and amenities.',
    url: '/search',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Production Locations | SetVenue',
    description: 'Find and book production-ready locations across the US.',
  },
};

function SearchSkeleton() {
  return (
    <div className="container mx-auto animate-pulse px-4 py-10">
      <div className="mb-8 max-w-3xl space-y-4">
        <div className="h-8 w-40 rounded-full bg-slate-100" />
        <div className="h-12 w-3/4 rounded-2xl bg-slate-100" />
        <div className="h-5 w-1/2 rounded bg-slate-100" />
      </div>
      <div className="mb-6 h-16 rounded-[28px] bg-slate-100" />
      <div className="flex gap-8">
        <div className="hidden w-64 shrink-0 md:block">
          <div className="h-96 rounded-[24px] bg-slate-100" />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-[30px] bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function SearchPage() {
  const allLocations = await getAllProperties();

  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchClient allLocations={allLocations} />
    </Suspense>
  );
}
