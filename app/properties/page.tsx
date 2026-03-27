import type { Metadata } from 'next';
import { getAllProperties } from '@/lib/properties';
import { getLocationSearchText } from '@/lib/search';
import { Location } from '@/types/location';
import LocationCard from '@/components/LocationCard';
import PropertiesFiltersPanel from '@/components/PropertiesFiltersPanel';

export const metadata: Metadata = {
  title: 'Search Properties | SetVenue',
  description: 'Search and filter production-ready locations by type, price, bedrooms, amenities, and more.',
  alternates: { canonical: '/properties' },
};

type SearchParams = Record<string, string | string[] | undefined>;

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [v];
}

function filterAndSort(all: Location[], params: SearchParams): Location[] {
  let results = [...all];

  // Text search
  const q = typeof params.q === 'string' ? params.q.trim() : '';
  if (q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    results = results.filter((loc) => {
      const text = getLocationSearchText(loc);
      return terms.every((t) => text.includes(t));
    });
  }

  // City
  const city = typeof params.city === 'string' ? params.city : '';
  if (city) {
    results = results.filter((loc) => loc.city.toLowerCase() === city.toLowerCase());
  }

  // Property types (checkbox multi-select)
  const propertyTypes = toArray(params.propertyType).map((t) => t.toLowerCase());
  if (propertyTypes.length > 0) {
    results = results.filter((loc) => propertyTypes.includes(loc.propertyType.toLowerCase()));
  }

  // Production types (bestUses)
  const productionTypes = toArray(params.productionType).map((t) => t.toLowerCase());
  if (productionTypes.length > 0) {
    results = results.filter((loc) =>
      productionTypes.some((pt) =>
        (loc.bestUses || []).some((u) => u.toLowerCase().includes(pt))
      )
    );
  }

  // Price range
  const priceMin = typeof params.priceMin === 'string' && params.priceMin ? Number(params.priceMin) : null;
  const priceMax = typeof params.priceMax === 'string' && params.priceMax ? Number(params.priceMax) : null;
  if (priceMin !== null && !isNaN(priceMin)) {
    results = results.filter((loc) => loc.pricePerHour >= priceMin);
  }
  if (priceMax !== null && !isNaN(priceMax)) {
    results = results.filter((loc) => loc.pricePerHour <= priceMax);
  }

  // Bedrooms
  const bedsStr = typeof params.beds === 'string' ? params.beds : 'Any';
  if (bedsStr !== 'Any') {
    const beds = Number(bedsStr);
    if (!isNaN(beds)) results = results.filter((loc) => loc.beds >= beds);
  }

  // Bathrooms
  const bathsStr = typeof params.baths === 'string' ? params.baths : 'Any';
  if (bathsStr !== 'Any') {
    const baths = Number(bathsStr);
    if (!isNaN(baths)) results = results.filter((loc) => loc.baths >= baths);
  }

  // Max capacity
  const capacityStr = typeof params.capacity === 'string' ? params.capacity : 'Any';
  if (capacityStr !== 'Any') {
    const cap = Number(capacityStr);
    if (!isNaN(cap)) {
      results = results.filter((loc) => (loc.maxCapacity || loc.maxGuests || 0) >= cap);
    }
  }

  // Amenities (must match all selected)
  const amenities = toArray(params.amenities);
  if (amenities.length > 0) {
    results = results.filter((loc) =>
      amenities.every((a) =>
        loc.amenities.some((la) => la.toLowerCase().includes(a.toLowerCase()))
      )
    );
  }

  // Sort
  const sort = typeof params.sort === 'string' ? params.sort : 'newest';
  switch (sort) {
    case 'price-asc':
      results.sort((a, b) => a.pricePerHour - b.pricePerHour);
      break;
    case 'price-desc':
      results.sort((a, b) => b.pricePerHour - a.pricePerHour);
      break;
    case 'beds-desc':
      results.sort((a, b) => b.beds - a.beds);
      break;
  }

  return results;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};
  const allLocations = await getAllProperties();
  const filtered = filterAndSort(allLocations, params);

  const cities = Array.from(new Set(allLocations.map((l) => l.city))).sort();

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      {/* Page header */}
      <section className="border-b border-slate-100 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">
            Search locations
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl lg:text-5xl">
            Find the right set.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Filter by property type, production use, price, capacity, and amenities.
          </p>
        </div>
      </section>

      {/* Filters + results */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <PropertiesFiltersPanel
            key={JSON.stringify(params)}
            params={params}
            cities={cities}
            filteredCount={filtered.length}
            totalCount={allLocations.length}
          >
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((location) => (
                  <LocationCard key={location.id} location={location} />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:rounded-[32px] sm:py-20">
                <div className="mb-4 text-5xl">🔎</div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                  No locations match those filters
                </h2>
                <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">
                  Try loosening a filter or two — a shorter search usually uncovers more options.
                </p>
                <a
                  href="/properties"
                  className="mt-8 inline-flex min-h-[48px] items-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Clear all filters
                </a>
              </div>
            )}
          </PropertiesFiltersPanel>
        </div>
      </section>
    </main>
  );
}
