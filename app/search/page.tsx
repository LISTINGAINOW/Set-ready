import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Search, Shield } from 'lucide-react';
import HighlightText from '@/components/HighlightText';
import { searchLocations } from '@/lib/search';

export const metadata: Metadata = {
  title: 'Browse Production Locations | SetVenue',
  description: 'Search film locations, photo shoot venues, production spaces, and crew housing across the US. Filter by city, style, amenities, and more.',
  alternates: { canonical: '/search' },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q?.trim() || '';
  const results = searchLocations(query);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-500">
          <Search className="h-4 w-4" />
          Search locations
        </div>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl">Find the right set faster</h1>
        <p className="mt-4 text-lg text-black/60">
          Search across title, city, amenities, content types, and listing descriptions.
        </p>
      </div>

      <form action="/search" className="mb-8 rounded-[28px] border border-black/10 bg-white p-4 shadow-soft md:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Try: Malibu, pool, Video production, changing room, loft"
              className="w-full rounded-xl border border-black bg-white py-3 pl-12 pr-4 text-black outline-none transition placeholder:text-black/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            />
          </div>
          <button
            type="submit"
            className="btn-press rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </form>

      {query ? (
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-blue-600">Results</p>
            <h2 className="text-2xl font-semibold">
              {results.length} match{results.length === 1 ? '' : 'es'} for “{query}”
            </h2>
          </div>
          <Link href="/locations" className="text-sm text-blue-500 transition hover:text-blue-500">
            Browse all locations →
          </Link>
        </div>
      ) : (
        <div className="mb-8 rounded-2xl border border-dashed border-black bg-white/40 px-6 py-10 text-center text-black/60">
          Enter a keyword to search the catalog.
        </div>
      )}

      {query && results.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {results.map((location) => (
            <Link
              key={location.id}
              href={`/locations/${location.id}`}
              className="group overflow-hidden rounded-2xl border border-black bg-white/50 transition hover:border-blue-500/50 hover:bg-white"
            >
              <div className="flex h-44 items-center justify-center bg-gradient-to-r from-blue-600/30 to-white/30 text-6xl text-blue-600">
                📸
              </div>

              <div className="p-6">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold leading-tight text-black group-hover:text-blue-500">
                    <HighlightText text={location.name} query={query} />
                  </h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black/80">
                    {location.style}
                  </span>
                </div>

                <div className="mb-4 flex items-center gap-2 text-sm text-black/60">
                  <MapPin className="h-4 w-4" />
                  <HighlightText text={`${location.city}, ${location.state}`} query={query} />
                </div>

                <p className="mb-5 line-clamp-3 text-sm text-black/80">
                  <HighlightText text={location.description} query={query} />
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {location.amenities.slice(0, 4).map((amenity) => (
                    <span key={amenity} className="rounded-full bg-white/80 px-3 py-1 text-xs text-black/80">
                      <HighlightText text={amenity} query={query} />
                    </span>
                  ))}
                </div>

                {(location.bestUses || []).length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {(location.bestUses || []).map((use) => (
                      <span key={use} className="rounded-full border border-black px-3 py-1 text-xs uppercase tracking-wide text-blue-500">
                        <HighlightText text={use} query={query} />
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-black pt-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-blue-600">From</p>
                    <p className="text-2xl font-bold text-black">${location.pricePerHour}<span className="text-sm text-black/60">/hr</span></p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-black/80">
                    <Shield className="h-4 w-4 text-blue-500" />
                    View listing
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="empty-state">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl text-blue-600 shadow-[0_12px_30px_rgba(59,130,246,0.14)]">🔎</div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">No results found</p>
          <h3 className="mt-3 text-3xl font-semibold text-black">Nothing matched “{query}”</h3>
          <p className="mx-auto mt-4 max-w-xl text-base text-black/60">
            Try a nearby city, a simpler amenity, or a broader production term. Shorter searches usually uncover more usable options.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/locations" className="btn-press inline-flex min-h-[48px] items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600">
              Browse all locations
            </Link>
            <Link href="/search" className="btn-press inline-flex min-h-[48px] items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black hover:border-blue-200 hover:text-blue-600">
              Clear search
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
