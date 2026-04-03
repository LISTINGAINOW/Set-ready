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
  architecturalStyle?: string | string[];
  locationSetting?: string | string[];
  outdoorFeatures?: string | string[];
  interiorFeatures?: string | string[];
  productionFeatures?: string | string[];
  contentPermissions?: string | string[];
  accessibility?: string | string[];
  availability?: string;
  contentType?: string;
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
const priceRangeChips = ['Under $500/day', '$500–$1K/day', '$1K–$3K/day', '$3K–$5K/day', '$5K+/day'];

const architecturalStyles = ['Modern', 'Contemporary', 'Mid-Century Modern', 'Traditional', 'Victorian', 'Craftsman', 'Mediterranean', 'Spanish Colonial', 'Art Deco', 'Industrial', 'Minimalist', 'Rustic', 'Farmhouse', 'Colonial', 'Cape Cod', 'Tudor', 'Bohemian', 'Tropical', 'Japanese', 'Scandinavian'];
const locationSettingOptions = ['Beachfront', 'Ocean View', 'Mountain View', 'City View', 'Hillside', 'Desert', 'Forest', 'Lakefront', 'Riverfront', 'Downtown', 'Suburban', 'Rural', 'Gated Community', 'Private Road'];
const outdoorFeaturesList = ['Pool', 'Hot Tub/Jacuzzi', 'Tennis Court', 'Basketball Court', 'Rooftop Deck', 'Patio/Terrace', 'Balcony', 'Garden/Yard', 'Fire Pit', 'Outdoor Kitchen/BBQ', 'Gazebo', 'Fountain', 'Vineyard', 'Orchard', 'Horse Stables', 'Dock/Marina'];
const interiorFeaturesList = ['Chef Kitchen', 'Home Theater', 'Wine Cellar', 'Library', 'Home Gym', 'Sauna/Steam Room', 'Game Room', 'Recording Studio', 'Art Studio', 'Loft Space', 'Spiral Staircase', 'Fireplace', 'Grand Piano', 'Bar', 'Walk-in Closet'];
const productionFeaturesList = ['High Ceilings (12ft+)', 'Large Windows/Natural Light', 'Open Floor Plan', 'White Walls (CYC-friendly)', 'Loading Dock', 'Freight Elevator', 'Power (200A+)', 'Green Room/Holding Area', 'Makeup Room', 'Wardrobe Room', 'Production Office Space', 'Drive-On Access', 'Blackout Capable'];
const contentPermissionsList = ['Mainstream Film/TV', 'Music Videos', 'Photo Shoots', 'Commercial/Advertising', 'Events/Parties', 'Adult Content', 'Student Film', 'Social Media/Influencer'];
const accessibilityList = ['Wheelchair Accessible', 'Elevator', 'Ground Floor', 'ADA Compliant Bathroom'];
const availabilityOptions = ['Available Now', 'Available This Week', 'Available This Month'];

const cityHubs = [
  { label: 'Los Angeles', slug: 'los-angeles' },
  { label: 'Atlanta', slug: 'atlanta' },
  { label: 'New York City', slug: 'new-york' },
  { label: 'Austin', slug: 'austin' },
  { label: 'Miami', slug: 'miami' },
  { label: 'Nashville', slug: 'nashville' },
  { label: 'New Orleans', slug: 'new-orleans' },
  { label: 'Albuquerque', slug: 'albuquerque' },
  { label: 'Santa Fe', slug: 'santa-fe' },
  { label: 'Pittsburgh', slug: 'pittsburgh' },
  { label: 'Detroit', slug: 'detroit' },
  { label: 'Savannah', slug: 'savannah' },
  { label: 'Honolulu', slug: 'honolulu' },
  { label: 'Salt Lake City', slug: 'salt-lake-city' },
  { label: 'Portland', slug: 'portland' },
  { label: 'Seattle', slug: 'seattle' },
  { label: 'San Francisco', slug: 'san-francisco' },
  { label: 'Chicago', slug: 'chicago' },
  { label: 'Wilmington', slug: 'wilmington' },
  { label: 'Oklahoma City', slug: 'oklahoma-city' },
  { label: 'Philadelphia', slug: 'philadelphia' },
  { label: 'Denver', slug: 'denver' },
];

function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function matchesPriceRange(pricePerHour: number, priceRange?: string) {
  if (!priceRange) return true;
  const daily = pricePerHour * 8;
  if (priceRange === 'Under $500/day') return daily < 500;
  if (priceRange === '$500–$1K/day') return daily >= 500 && daily <= 1000;
  if (priceRange === '$1K–$3K/day') return daily >= 1000 && daily <= 3000;
  if (priceRange === '$3K–$5K/day') return daily >= 3000 && daily <= 5000;
  if (priceRange === '$5K+/day') return daily > 5000;
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

    const loc = location as any;

    const archStyles = toArray(filters.architecturalStyle);
    if (archStyles.length > 0) {
      const style = (loc.architecturalStyle || loc.style || '').toLowerCase();
      if (!archStyles.some((s) => style.includes(s.toLowerCase()))) return false;
    }

    const locationSettings = toArray(filters.locationSetting);
    if (locationSettings.length > 0) {
      const settings = ((loc.locationSetting || loc.setting || []) as string[]).map((x: string) => x.toLowerCase());
      if (!locationSettings.some((s) => settings.includes(s.toLowerCase()))) return false;
    }

    const outdoorFilters = toArray(filters.outdoorFeatures);
    if (outdoorFilters.length > 0) {
      const features = ((loc.outdoorFeatures || location.amenities || []) as string[]).map((x: string) => x.toLowerCase());
      if (!outdoorFilters.some((f) => features.includes(f.toLowerCase()))) return false;
    }

    const interiorFilters = toArray(filters.interiorFeatures);
    if (interiorFilters.length > 0) {
      const features = ((loc.interiorFeatures || location.amenities || []) as string[]).map((x: string) => x.toLowerCase());
      if (!interiorFilters.some((f) => features.includes(f.toLowerCase()))) return false;
    }

    const productionFilters = toArray(filters.productionFeatures);
    if (productionFilters.length > 0) {
      const features = ((loc.productionFeatures || location.amenities || []) as string[]).map((x: string) => x.toLowerCase());
      if (!productionFilters.some((f) => features.includes(f.toLowerCase()))) return false;
    }

    const permissionFilters = toArray(filters.contentPermissions);
    if (permissionFilters.length > 0) {
      const perms = ((loc.contentPermissions || loc.contentTypes || []) as string[]).map((x: string) => x.toLowerCase());
      if (!permissionFilters.some((p) => perms.includes(p.toLowerCase()))) return false;
    }

    const accessFilters = toArray(filters.accessibility);
    if (accessFilters.length > 0) {
      const access = ((loc.accessibility || []) as string[]).map((x: string) => x.toLowerCase());
      if (!accessFilters.some((a) => access.includes(a.toLowerCase()))) return false;
    }

    if (filters.contentType) {
      if (filters.contentType === 'adult') {
        if (!loc.adultFriendly) return false;
      } else {
        const types = ((loc.contentTypes || []) as string[]).map((x: string) => x.toLowerCase());
        if (!types.includes(filters.contentType.toLowerCase())) return false;
      }
    }

    return true;
  });
}

function buildHref(params: SearchParams, updates: Partial<SearchParams> = {}) {
  const next = new URLSearchParams();
  const merged = { ...params, ...updates };

  Object.entries(merged).forEach(([paramKey, paramValue]) => {
    if (!paramValue) return;
    if (Array.isArray(paramValue)) {
      paramValue.forEach((v) => next.append(paramKey, v));
    } else {
      next.set(paramKey, paramValue);
    }
  });

  const query = next.toString();
  return query ? `/locations?${query}` : '/locations';
}

function buildChipHref(params: SearchParams, key: keyof SearchParams, value: string) {
  const nextValue = params[key] === value ? undefined : value;
  return buildHref(params, { [key]: nextValue } as Partial<SearchParams>);
}

function FilterSection({
  title,
  name,
  options,
  selected,
}: {
  title: string;
  name: string;
  options: string[];
  selected: string[];
}) {
  const activeCount = selected.length;
  return (
    <details className="group overflow-hidden rounded-xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer select-none list-none items-center justify-between px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-black">{title}</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">{activeCount}</span>
          )}
        </div>
        <svg className="h-4 w-4 text-black/40 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </summary>
      <div className="border-t border-slate-100 px-4 pb-4 pt-3">
        <div className="grid grid-cols-2 gap-1">
          {options.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
              <input
                type="checkbox"
                name={name}
                value={option}
                defaultChecked={selected.includes(option)}
                className="h-4 w-4 shrink-0 accent-blue-500"
              />
              <span className="leading-tight text-black/80">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </details>
  );
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

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/50">Content type</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {[
                    { value: 'film', label: 'Film' },
                    { value: 'tv', label: 'TV' },
                    { value: 'commercial', label: 'Commercial' },
                    { value: 'photography', label: 'Photography' },
                    { value: 'music-video', label: 'Music Video' },
                    { value: 'events', label: 'Events' },
                    { value: 'adult', label: 'All Productions' },
                  ].map(({ value, label }) => (
                    <FilterChip
                      key={value}
                      href={buildChipHref(params, 'contentType', value)}
                      label={label}
                      active={params.contentType === value}
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
              </div>

              {/* Advanced Filters */}
              <div className="mt-5 border-t border-black/10 pt-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-black/50">Advanced Filters</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <FilterSection
                    title="Architectural Style"
                    name="architecturalStyle"
                    options={architecturalStyles}
                    selected={toArray(params.architecturalStyle)}
                  />
                  <FilterSection
                    title="Location & Setting"
                    name="locationSetting"
                    options={locationSettingOptions}
                    selected={toArray(params.locationSetting)}
                  />
                  <FilterSection
                    title="Outdoor Features"
                    name="outdoorFeatures"
                    options={outdoorFeaturesList}
                    selected={toArray(params.outdoorFeatures)}
                  />
                  <FilterSection
                    title="Interior Features"
                    name="interiorFeatures"
                    options={interiorFeaturesList}
                    selected={toArray(params.interiorFeatures)}
                  />
                  <FilterSection
                    title="Production Features"
                    name="productionFeatures"
                    options={productionFeaturesList}
                    selected={toArray(params.productionFeatures)}
                  />
                  <FilterSection
                    title="Content Permissions"
                    name="contentPermissions"
                    options={contentPermissionsList}
                    selected={toArray(params.contentPermissions)}
                  />
                  <FilterSection
                    title="Accessibility"
                    name="accessibility"
                    options={accessibilityList}
                    selected={toArray(params.accessibility)}
                  />
                </div>

                {/* Availability */}
                <div className="mt-4 border-t border-black/10 pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-black/50">Availability</p>
                  <div className="flex flex-wrap gap-2">
                    <label className={`inline-flex cursor-pointer items-center rounded-full border px-4 py-2 text-sm font-medium transition ${!params.availability ? 'border-blue-500 bg-blue-500 text-white' : 'border-black/20 bg-white text-black/80 hover:border-blue-400'}`}>
                      <input type="radio" name="availability" value="" defaultChecked={!params.availability} className="sr-only" />
                      Any Time
                    </label>
                    {availabilityOptions.map((opt) => (
                      <label key={opt} className={`inline-flex cursor-pointer items-center rounded-full border px-4 py-2 text-sm font-medium transition ${params.availability === opt ? 'border-blue-500 bg-blue-500 text-white' : 'border-black/20 bg-white text-black/80 hover:border-blue-400'}`}>
                        <input type="radio" name="availability" value={opt} defaultChecked={params.availability === opt} className="sr-only" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="min-h-[48px] flex-1 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 sm:flex-none sm:px-8">
                  Apply Filters
                </button>
                <a href="/locations" className="flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-black px-5 py-3 text-center text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600 sm:flex-none">
                  Clear All
                </a>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4 text-sm text-black/60 sm:flex-row sm:items-center sm:justify-between">
                <p>Showing {filteredLocations.length} of {locations.length} locations</p>
                <p>Built for producers who need discretion, speed, and a professional booking flow.</p>
              </div>
            </form>
          </div>
        </section>

        <section className="mt-8">
          <LocationsClientTools locations={filteredLocations} searchParams={params as Record<string, string | undefined>} />
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
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Production hubs</p>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-black sm:text-2xl">Browse by city</h2>
            </div>
            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              Available Nationwide — List your property anywhere in the USA
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
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
          <div className="mt-6">
            <a href="/cities" className="text-sm font-medium text-blue-600 hover:underline">
              View all 22 cities →
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
