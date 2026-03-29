'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Location } from '@/types/location';
import LocationCard from '@/components/LocationCard';
import { Search, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';

interface Props {
  allLocations: Location[];
}

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name-az';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'name-az', label: 'Name A–Z' },
];

const CAPACITY_OPTS = ['1–10', '10–25', '25–50', '50+'];

const AMENITY_OPTS = [
  'Pool',
  'Kitchen',
  'Parking',
  'Natural Light',
  'Ocean View',
  'Garden',
  'Fireplace',
  'WiFi',
  'Outdoor Space',
  'Loading Dock',
  'Changing Room',
  'Shower',
];

const PROPERTY_TYPES = [
  'House',
  'Estate',
  'Ranch',
  'Studio',
  'Loft',
  'Commercial',
  'Outdoor',
  'Penthouse',
  'Warehouse',
  'Cabin',
  'Apartment',
];

function getCapacity(loc: Location): number {
  return loc.maxGuests || loc.maxCapacity || 0;
}

function matchesCapacity(loc: Location, range: string): boolean {
  if (!range) return true;
  const cap = getCapacity(loc);
  if (!cap) return true;
  if (range === '1–10') return cap >= 1 && cap <= 10;
  if (range === '10–25') return cap > 10 && cap <= 25;
  if (range === '25–50') return cap > 25 && cap <= 50;
  if (range === '50+') return cap > 50;
  return true;
}

function matchesAmenity(loc: Location, amenity: string): boolean {
  return loc.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()));
}

function applyFilters(
  locs: Location[],
  query: string,
  cities: string[],
  types: string[],
  minPrice: string,
  maxPrice: string,
  capacity: string,
  amenities: string[],
): Location[] {
  const q = query.toLowerCase().trim();
  const minP = minPrice ? parseFloat(minPrice) : 0;
  const maxP = maxPrice ? parseFloat(maxPrice) : Infinity;

  return locs.filter((loc) => {
    if (q) {
      const text = [
        loc.name,
        loc.city,
        loc.state,
        loc.description,
        loc.propertyType,
        loc.style,
        loc.amenities.join(' '),
        (loc.bestUses || []).join(' '),
        loc.vibe || '',
      ]
        .join(' ')
        .toLowerCase();
      if (!q.split(/\s+/).every((term) => text.includes(term))) return false;
    }

    if (cities.length > 0 && !cities.includes(loc.city)) return false;

    if (types.length > 0) {
      const locType = loc.propertyType.toLowerCase();
      if (!types.some((t) => locType.includes(t.toLowerCase()))) return false;
    }

    if (loc.pricePerHour < minP || loc.pricePerHour > maxP) return false;

    if (!matchesCapacity(loc, capacity)) return false;

    if (amenities.length > 0) {
      if (!amenities.every((a) => matchesAmenity(loc, a))) return false;
    }

    return true;
  });
}

function applySort(locs: Location[], sort: SortKey): Location[] {
  const sorted = [...locs];
  if (sort === 'price-asc') return sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
  if (sort === 'price-desc') return sorted.sort((a, b) => b.pricePerHour - a.pricePerHour);
  if (sort === 'name-az') return sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
      <span
        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
          checked ? 'border-blue-500 bg-blue-500' : 'border-slate-300 bg-white'
        }`}
        aria-hidden
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <span className="leading-tight text-slate-700">{label}</span>
    </label>
  );
}

function FilterSection({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 pb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{title}</span>
          {!!count && (
            <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

export default function SearchClient({ allLocations }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCities, setSelectedCities] = useState<string[]>(
    searchParams.get('cities')?.split(',').filter(Boolean) || [],
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get('types')?.split(',').filter(Boolean) || [],
  );
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [capacity, setCapacity] = useState(searchParams.get('capacity') || '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get('amenities')?.split(',').filter(Boolean) || [],
  );
  const [sort, setSort] = useState<SortKey>((searchParams.get('sort') as SortKey) || 'featured');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const allCities = useMemo(() => {
    const seen: Record<string, boolean> = {};
    const cities: string[] = [];
    allLocations.forEach((l) => {
      if (!seen[l.city]) { seen[l.city] = true; cities.push(l.city); }
    });
    return cities.sort();
  }, [allLocations]);

  const results = useMemo(() => {
    const filtered = applyFilters(
      allLocations,
      query,
      selectedCities,
      selectedTypes,
      minPrice,
      maxPrice,
      capacity,
      selectedAmenities,
    );
    return applySort(filtered, sort);
  }, [allLocations, query, selectedCities, selectedTypes, minPrice, maxPrice, capacity, selectedAmenities, sort]);

  const filterCount = [
    selectedCities.length > 0,
    selectedTypes.length > 0,
    minPrice !== '',
    maxPrice !== '',
    capacity !== '',
    selectedAmenities.length > 0,
  ].filter(Boolean).length;

  const syncUrl = useCallback(
    (state: {
      q: string;
      cities: string[];
      types: string[];
      minPrice: string;
      maxPrice: string;
      capacity: string;
      amenities: string[];
      sort: SortKey;
    }) => {
      const params = new URLSearchParams();
      if (state.q) params.set('q', state.q);
      if (state.cities.length) params.set('cities', state.cities.join(','));
      if (state.types.length) params.set('types', state.types.join(','));
      if (state.minPrice) params.set('minPrice', state.minPrice);
      if (state.maxPrice) params.set('maxPrice', state.maxPrice);
      if (state.capacity) params.set('capacity', state.capacity);
      if (state.amenities.length) params.set('amenities', state.amenities.join(','));
      if (state.sort !== 'featured') params.set('sort', state.sort);
      const str = params.toString();
      router.replace(str ? `/search?${str}` : '/search', { scroll: false });
    },
    [router],
  );

  function getState() {
    return { q: query, cities: selectedCities, types: selectedTypes, minPrice, maxPrice, capacity, amenities: selectedAmenities, sort };
  }

  const handleQuery = (val: string) => {
    setQuery(val);
    syncUrl({ ...getState(), q: val });
  };

  const toggleCity = (city: string) => {
    const next = selectedCities.includes(city)
      ? selectedCities.filter((c) => c !== city)
      : [...selectedCities, city];
    setSelectedCities(next);
    syncUrl({ ...getState(), cities: next });
  };

  const toggleType = (type: string) => {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(next);
    syncUrl({ ...getState(), types: next });
  };

  const toggleAmenity = (amenity: string) => {
    const next = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(next);
    syncUrl({ ...getState(), amenities: next });
  };

  const handleCapacity = (val: string) => {
    const next = capacity === val ? '' : val;
    setCapacity(next);
    syncUrl({ ...getState(), capacity: next });
  };

  const handleMinPrice = (val: string) => {
    setMinPrice(val);
    syncUrl({ ...getState(), minPrice: val });
  };

  const handleMaxPrice = (val: string) => {
    setMaxPrice(val);
    syncUrl({ ...getState(), maxPrice: val });
  };

  const handleSort = (val: SortKey) => {
    setSort(val);
    setSortOpen(false);
    syncUrl({ ...getState(), sort: val });
  };

  const clearAll = () => {
    setQuery('');
    setSelectedCities([]);
    setSelectedTypes([]);
    setMinPrice('');
    setMaxPrice('');
    setCapacity('');
    setSelectedAmenities([]);
    setSort('featured');
    router.replace('/search', { scroll: false });
  };

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    const handler = () => setSortOpen(false);
    document.addEventListener('click', handler, { capture: true });
    return () => document.removeEventListener('click', handler, { capture: true });
  }, [sortOpen]);

  const FilterPanel = (
    <aside className="space-y-0">
      <div className="flex items-center justify-between pb-3 pt-1">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Filters</h2>
        {filterCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="City" count={selectedCities.length} defaultOpen>
        {allCities.map((city) => (
          <CheckboxItem
            key={city}
            label={city}
            checked={selectedCities.includes(city)}
            onChange={() => toggleCity(city)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Property Type" count={selectedTypes.length} defaultOpen>
        {PROPERTY_TYPES.map((type) => (
          <CheckboxItem
            key={type}
            label={type}
            checked={selectedTypes.includes(type)}
            onChange={() => toggleType(type)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Price Range ($/hr)" count={[minPrice, maxPrice].filter(Boolean).length}>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => handleMinPrice(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => handleMaxPrice(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </FilterSection>

      <FilterSection title="Crew Size" count={capacity ? 1 : 0}>
        <div className="flex flex-wrap gap-2 pt-1">
          {CAPACITY_OPTS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleCapacity(opt)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                capacity === opt
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Amenities" count={selectedAmenities.length}>
        {AMENITY_OPTS.map((amenity) => (
          <CheckboxItem
            key={amenity}
            label={amenity}
            checked={selectedAmenities.includes(amenity)}
            onChange={() => toggleAmenity(amenity)}
          />
        ))}
      </FilterSection>
    </aside>
  );

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Featured';

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-600">
          <Search className="h-4 w-4" />
          Search locations
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
          Find the right set faster
        </h1>
        <p className="mt-3 text-lg text-slate-500">
          Search by city, property type, amenities, or keyword — results update instantly.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6 rounded-[28px] border border-black/10 bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600" />
            <input
              type="search"
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Search by city, property type, or keyword…"
              className="w-full rounded-xl border border-black bg-white py-3 pl-12 pr-4 text-black outline-none transition placeholder:text-black/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              aria-label="Search locations"
            />
          </div>
          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-black bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-500 hover:text-blue-600 md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {filterCount > 0 && (
              <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop */}
        <div className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-6 rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
            {FilterPanel}
          </div>
        </div>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowFilters(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-8 pt-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-950">Filters</h2>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="rounded-full p-2 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {FilterPanel}
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="mt-6 w-full rounded-full bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-600"
              >
                Show {results.length} result{results.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="min-w-0 flex-1">
          {/* Top bar: count + sort */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600">
              Showing{' '}
              <span className="font-semibold text-slate-950">{results.length}</span> of{' '}
              <span className="font-semibold text-slate-950">{allLocations.length}</span>{' '}
              {allLocations.length === 1 ? 'property' : 'properties'}
              {filterCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  {filterCount} filter{filterCount !== 1 ? 's' : ''} active
                  <button
                    type="button"
                    onClick={clearAll}
                    aria-label="Clear all filters"
                    className="ml-0.5 rounded-full hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </p>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSortOpen((v) => !v);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-blue-300"
              >
                Sort: {sortLabel}
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSort(opt.value)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-sm transition hover:bg-slate-50 ${
                        sort === opt.value ? 'font-semibold text-blue-600' : 'text-slate-700'
                      }`}
                    >
                      {opt.label}
                      {sort === opt.value && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-black bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl text-blue-600 shadow-[0_12px_30px_rgba(59,130,246,0.14)]">
                🔎
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                No results found
              </p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-950">
                {query ? `Nothing matched "${query}"` : 'No properties match your filters'}
              </h3>
              <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
                Try adjusting your filters, using a broader keyword, or browsing all locations.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600"
                >
                  Clear all filters
                </button>
                <Link
                  href="/locations"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:border-blue-200 hover:text-blue-600"
                >
                  Browse all locations
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
