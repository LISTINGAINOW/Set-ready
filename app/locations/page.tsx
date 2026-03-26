import type { Metadata } from 'next';
import LocationCard from '@/components/LocationCard';
import LocationGrid from '@/components/LocationGrid';
import LocationsMapView from '@/components/LocationsMapView';
import { Location } from '@/types/location';
import { getAllProperties } from '@/lib/properties';
import { getLocationSearchText } from '@/lib/search';
import LocationsClientTools from '@/components/LocationsClientTools';

type SearchParams = {
  propertyType?: string;
  amenities?: string;
  bestUses?: string;
  search?: string;
  priceRange?: string;
  view?: string;
};

const locationsPageTitle = 'Browse Production Locations';
const locationsPageDescription = 'Browse production-ready homes, lofts, studios, and production spaces with clear privacy tiers, transparent rates, and fast booking on SetVenue.';

export const metadata: Metadata = {
  title: locationsPageTitle,
  description: locationsPageDescription,
  keywords: [
    'production locations',
    'production-ready locations',
    'film location rentals',
    'photo shoot spaces',
    'los angeles production spaces',
  ],
  alternates: {
    canonical: '/locations',
  },
  openGraph: {
    title: `${locationsPageTitle} | SetVenue`,
    description: locationsPageDescription,
    url: '/locations',
    type: 'website',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'SetVenue locations marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${locationsPageTitle} | SetVenue`,
    description: locationsPageDescription,
    images: ['/icons/icon-512.png'],
  },
};

const propertyTypeChips = ['House', 'Studio', 'Warehouse', 'Loft', 'Cabin', 'Penthouse', 'Apartment'];
const priceRangeChips = ['Under $200', '$200-$400', '$400+'];

const cityHubs = [
  { label: 'Los Angeles', slug: 'los-angeles' },
  { label: 'Atlanta', slug: 'atlanta' },
  { label: 'New York City', slug: 'new-york' },
  { label: 'Austin', slug: 'austin' },
  { label: 'Miami', slug: 'miami' },
  { label: 'Nashville', slug: 'nashville' },
];

function matchesPriceRange(price: number, priceRange?: string) {
  if (!priceRange) return true;
  if (priceRange === 'Under $200') return price < 200;
  if (priceRange === '$200-$400') return price >= 200 && price <= 400;
  if (priceRange === '$400+') return price > 400;
  return true;
}

function filterLocations(locations: Location[], filters: SearchParams) {
  return locations.filter((location) => {
    if (filters.propertyType && location.propertyType !== filters.propertyType.toLowerCase()) {
      return false;
    }

    if (!matchesPriceRange(location.pricePerHour, filters.priceRange)) {
      return false;
    }

    if (filters.amenities && filters.amenities !== 'Amenities') {
      if (!location.amenities.includes(filters.amenities.toLowerCase())) {
        return false;
      }
    }

    if (filters.bestUses && filters.bestUses !== 'Best Uses') {
      if (!(location.bestUses || []).includes(filters.bestUses)) {
        return false;
      }
    }

    if (filters.search && !getLocationSearchText(location).includes(filters.search.toLowerCase().trim())) {
      return false;
    }

    return true;
  });
}

function buildHref(params: SearchParams, updates: Partial<SearchParams> = {}) {
  const next = new URLSearchParams();
  const merged = { ...params, ...updates };

  Object.entries(merged).forEach(([paramKey, paramValue]) => {
    if (!paramValue) return;
    next.set(paramKey, paramValue);
  });

  const query = next.toString();
  return query ? `/locations?${query}` : '/locations';
}

function buildChipHref(params: SearchParams, key: keyof SearchParams, value: string) {
  const nextValue = params[key] === value ? undefined : value;
  return buildHref(params, { [key]: nextValue } as Partial<SearchParams>);
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-blue-500 bg-blue-500 text-white'
          : 'border-black bg-white text-black hover:border-blue-500 hover:text-blue-600'
      }`}
    >
      {label}
    </a>
  );
}

export default async function LocationsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};
  const locations = await getAllProperties();
  const filteredLocations = filterLocations(locations, params);
  const currentView = params.view === 'map' ? 'map' : 'grid';

  const amenitiesList = ['Parking', 'WiFi', 'Lighting', 'Changing Room', 'Shower', 'Kitchen', 'Pool', 'Makeup Station', 'Loading Dock', 'Fireplace', 'Outdoor Shower'];
  const bestUsesList = ['Film Production', 'Photo Shoot', 'Events', 'Luxury Retreat', 'Corporate Retreat'];

  return (
    <main className="min-h-screen overflow-x-hidden bg-white px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[30px] border border-black bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[36px]">
          <div className="border-b border-black px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Browse locations</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-black sm:text-5xl lg:text-6xl">
                Private sets with cleaner filters and clearer expectations.
              </h1>
              <p className="mt-5 text-base leading-7 text-black/70 sm:text-lg">
                Scout production-ready locations by property type, privacy level, and rate — then book the right fit without awkward guesswork.
              </p>
            </div>
          </div>

          <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/50">Property type</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {propertyTypeChips.map((chip) => (
                    <FilterChip
                      key={chip}
                      href={buildChipHref(params, 'propertyType', chip)}
                      label={chip}
                      active={params.propertyType === chip}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/50">Rate</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {priceRangeChips.map((chip) => (
                    <FilterChip
                      key={chip}
                      href={buildChipHref(params, 'priceRange', chip)}
                      label={chip}
                      active={params.priceRange === chip}
                    />
                  ))}
                </div>
              </div>
            </div>

            <form method="GET" className="rounded-[24px] border border-black bg-[#FAFAFA] p-4 sm:rounded-[28px] sm:p-6">
              <div className="mb-5 flex flex-col gap-4 border-b border-black/10 pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/50">Browse mode</p>
                  <p className="mt-2 text-sm text-black/60">Switch between a quick card scan and a full-width map of the currently filtered inventory.</p>
                </div>
                <div className="inline-flex rounded-full border border-black bg-white p-1 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                  <a
                    href={buildHref(params, { view: undefined })}
                    className={`inline-flex min-h-[44px] min-w-[96px] items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
                      currentView === 'grid' ? 'bg-blue-500 text-white shadow-[0_12px_30px_rgba(59,130,246,0.2)]' : 'text-black hover:text-blue-600'
                    }`}
                  >
                    Grid
                  </a>
                  <a
                    href={buildHref(params, { view: 'map' })}
                    className={`inline-flex min-h-[44px] min-w-[96px] items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
                      currentView === 'map' ? 'bg-blue-500 text-white shadow-[0_12px_30px_rgba(59,130,246,0.2)]' : 'text-black hover:text-blue-600'
                    }`}
                  >
                    Map
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                <input type="hidden" name="propertyType" value={params.propertyType || ''} />
                <input type="hidden" name="priceRange" value={params.priceRange || ''} />
                <input type="hidden" name="view" value={currentView === 'map' ? 'map' : ''} />
                <select
                  name="amenities"
                  defaultValue={params.amenities || 'Amenities'}
                  className="min-h-[48px] rounded-2xl border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
                >
                  <option> Amenities </option>
                  {amenitiesList.map((amenity) => (
                    <option key={amenity} value={amenity}>{amenity}</option>
                  ))}
                </select>
                <select
                  name="bestUses"
                  defaultValue={params.bestUses || 'Best Uses'}
                  className="min-h-[48px] rounded-2xl border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:border-blue-500"
                >
                  <option> Best Uses </option>
                  {bestUsesList.map((use) => (
                    <option key={use} value={use}>{use}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="search"
                  placeholder="Search by city, style, amenity, or vibe"
                  defaultValue={params.search || ''}
                  className="min-h-[48px] rounded-2xl border border-black bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black/40 focus:border-blue-500 md:col-span-2 xl:col-span-2"
                />
                <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
                  <button type="submit" className="min-h-[48px] flex-1 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 xl:flex-none">
                    Apply Filters
                  </button>
                  <a href="/locations" className="flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-black px-5 py-3 text-center text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600 xl:flex-none">
                    Clear
                  </a>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4 text-sm text-black/60 sm:flex-row sm:items-center sm:justify-between">
                <p>Showing {filteredLocations.length} of {locations.length} locations</p>
                <p>Built for producers who need discretion, speed, and a professional booking flow.</p>
              </div>
            </form>
          </div>
        </section>

        <section className="mt-8">
          <LocationsClientTools locations={filteredLocations} searchParams={params} />
        </section>

        <section className="mt-8">
          {filteredLocations.length > 0 ? (
            currentView === 'map' ? (
              <LocationsMapView locations={filteredLocations} />
            ) : (
              <LocationGrid locations={filteredLocations} />
            )
          ) : (
            <div className="rounded-[28px] border border-black bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:rounded-[32px] sm:py-20">
              <div className="mb-5 text-6xl">🏜️</div>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-black">No locations match those filters</h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-black/65">
                Loosen one or two filters and you’ll usually uncover more strong options. Privacy-sensitive inventory can be tight by design.
              </p>
              <a href="/locations" className="mt-8 inline-flex min-h-[48px] items-center rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
                Reset browse page
              </a>
            </div>
          )}
        </section>

        <section className="mt-12 rounded-[28px] border border-black/8 bg-slate-50 px-6 py-10 sm:px-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Production hubs</p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-black sm:text-2xl">Browse by city</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {cityHubs.map((hub) => (
              <a
                key={hub.slug}
                href={`/locations/city/${hub.slug}`}
                className="inline-flex min-h-[44px] items-center rounded-full border border-black bg-white px-5 py-2 text-sm font-medium text-black transition hover:border-blue-500 hover:text-blue-600"
              >
                {hub.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
