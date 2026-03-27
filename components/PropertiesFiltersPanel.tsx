'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';

const PROPERTY_TYPES = ['House', 'Apartment', 'Loft', 'Studio', 'Warehouse', 'Outdoor', 'Estate', 'Ranch', 'Other'];
const PRODUCTION_TYPES = ['Film', 'TV', 'Commercial', 'Photo Shoot', 'Music Video', 'Event'];
const AMENITIES_LIST = [
  'Pool', 'Kitchen', 'Parking', 'Elevator', 'Rooftop', 'Garden', 'Gym',
  'WiFi', 'Lighting', 'Changing Room', 'Shower', 'Fireplace', 'Loading Dock',
];
const BEDS_OPTIONS = ['Any', '1', '2', '3', '4', '5'];
const BATHS_OPTIONS = ['Any', '1', '2', '3'];
const CAPACITY_OPTIONS = ['Any', '10', '25', '50', '100'];

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [v];
}

type Params = Record<string, string | string[] | undefined>;

function RadioPills({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`inline-flex min-h-[36px] min-w-[44px] items-center justify-center rounded-full border px-3 text-sm font-medium transition ${
            value === opt
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          {opt === 'Any' ? 'Any' : `${opt}+`}
        </button>
      ))}
      {value !== 'Any' && <input type="hidden" name={name} value={value} />}
    </div>
  );
}

interface Props {
  params: Params;
  cities: string[];
  filteredCount: number;
  totalCount: number;
  children: React.ReactNode;
}

export default function PropertiesFiltersPanel({ params, cities, filteredCount, totalCount, children }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [beds, setBeds] = useState(typeof params.beds === 'string' ? params.beds : 'Any');
  const [baths, setBaths] = useState(typeof params.baths === 'string' ? params.baths : 'Any');
  const [capacity, setCapacity] = useState(typeof params.capacity === 'string' ? params.capacity : 'Any');

  const selectedPropertyTypes = toArray(params.propertyType).map((t) => t.toLowerCase());
  const selectedProductionTypes = toArray(params.productionType).map((t) => t.toLowerCase());
  const selectedAmenities = toArray(params.amenities).map((a) => a.toLowerCase());

  const hasFilters = !!(
    params.q ||
    params.city ||
    selectedPropertyTypes.length ||
    selectedProductionTypes.length ||
    params.priceMin ||
    params.priceMax ||
    beds !== 'Any' ||
    baths !== 'Any' ||
    capacity !== 'Any' ||
    selectedAmenities.length
  );

  const currentSort = typeof params.sort === 'string' ? params.sort : 'newest';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (key === 'sort' || !value) return;
      if (Array.isArray(value)) {
        value.forEach((v) => urlParams.append(key, v));
      } else {
        urlParams.append(key, value);
      }
    });
    if (e.target.value !== 'newest') {
      urlParams.set('sort', e.target.value);
    }
    const qs = urlParams.toString();
    router.push(qs ? `/properties?${qs}` : '/properties');
  };

  const renderFilters = (inDrawer = false) => (
    <form method="GET" action="/properties" className="space-y-7">
      {currentSort !== 'newest' && <input type="hidden" name="sort" value={currentSort} />}

      {/* Search */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          Search
        </label>
        <input
          type="text"
          name="q"
          defaultValue={typeof params.q === 'string' ? params.q : ''}
          placeholder="City, style, or feature"
          className="mt-2.5 w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
        />
      </div>

      {/* City */}
      {cities.length > 0 && (
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            City
          </label>
          <select
            name="city"
            defaultValue={typeof params.city === 'string' ? params.city : ''}
            className="mt-2.5 w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      )}

      {/* Property type */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Property type</p>
        <div className={`mt-2.5 space-y-2 ${inDrawer ? 'grid grid-cols-2 gap-x-4 space-y-0' : ''}`}>
          {PROPERTY_TYPES.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-3 py-0.5">
              <input
                type="checkbox"
                name="propertyType"
                value={type}
                defaultChecked={selectedPropertyTypes.includes(type.toLowerCase())}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              <span className="text-sm text-slate-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Production type */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Production type</p>
        <div className={`mt-2.5 space-y-2 ${inDrawer ? 'grid grid-cols-2 gap-x-4 space-y-0' : ''}`}>
          {PRODUCTION_TYPES.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-3 py-0.5">
              <input
                type="checkbox"
                name="productionType"
                value={type}
                defaultChecked={selectedProductionTypes.includes(type.toLowerCase())}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              <span className="text-sm text-slate-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Price / hour</p>
        <div className="mt-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
            <input
              type="number"
              name="priceMin"
              defaultValue={typeof params.priceMin === 'string' ? params.priceMin : ''}
              placeholder="Min"
              min="0"
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white pl-6 pr-3 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>
          <span className="shrink-0 text-slate-300">—</span>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
            <input
              type="number"
              name="priceMax"
              defaultValue={typeof params.priceMax === 'string' ? params.priceMax : ''}
              placeholder="Max"
              min="0"
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white pl-6 pr-3 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Bedrooms</p>
        <div className="mt-2.5">
          <RadioPills name="beds" options={BEDS_OPTIONS} value={beds} onChange={setBeds} />
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Bathrooms</p>
        <div className="mt-2.5">
          <RadioPills name="baths" options={BATHS_OPTIONS} value={baths} onChange={setBaths} />
        </div>
      </div>

      {/* Capacity */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Max capacity</p>
        <div className="mt-2.5">
          <RadioPills name="capacity" options={CAPACITY_OPTIONS} value={capacity} onChange={setCapacity} />
        </div>
      </div>

      {/* Amenities */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Amenities</p>
        <div className={`mt-2.5 space-y-2 ${inDrawer ? 'grid grid-cols-2 gap-x-4 space-y-0' : ''}`}>
          {AMENITIES_LIST.map((amenity) => (
            <label key={amenity} className="flex cursor-pointer items-center gap-3 py-0.5">
              <input
                type="checkbox"
                name="amenities"
                value={amenity}
                defaultChecked={selectedAmenities.includes(amenity.toLowerCase())}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              <span className="text-sm text-slate-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 border-t border-slate-100 pt-5">
        <button
          type="submit"
          className="w-full min-h-[48px] rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
        >
          Apply filters
        </button>
        {hasFilters && (
          <a
            href="/properties"
            className="flex w-full min-h-[44px] items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
          >
            Clear all filters
          </a>
        )}
      </div>
    </form>
  );

  return (
    <>
      {/* Mobile filter trigger */}
      <div className="mb-5 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              ✓
            </span>
          )}
        </button>
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-950">{filteredCount}</span>
          {totalCount !== filteredCount && <span className="text-slate-400"> of {totalCount}</span>}
          <span> location{filteredCount !== 1 ? 's' : ''}</span>
        </p>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[92vh] overflow-y-auto rounded-t-[28px] bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-950">Filters</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">{renderFilters(true)}</div>
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="flex items-start gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-[264px] shrink-0 lg:block">
          <div className="sticky top-8 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">Filters</h2>
              {hasFilters && (
                <a href="/properties" className="text-xs font-medium text-blue-600 hover:underline">
                  Clear all
                </a>
              )}
            </div>
            {renderFilters(false)}
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          {/* Sort + count bar */}
          <div className="mb-6 hidden items-center justify-between gap-3 lg:flex">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-950">{filteredCount}</span>
              {totalCount !== filteredCount && <span className="text-slate-400"> of {totalCount}</span>}
              <span> location{filteredCount !== 1 ? 's' : ''}</span>
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-slate-500">
                Sort:
              </label>
              <select
                id="sort-select"
                value={currentSort}
                onChange={handleSortChange}
                className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 transition"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="beds-desc">Most Bedrooms</option>
              </select>
            </div>
          </div>

          {/* Mobile sort */}
          <div className="mb-4 flex items-center justify-end lg:hidden">
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select-mobile" className="text-sm text-slate-500">
                Sort:
              </label>
              <select
                id="sort-select-mobile"
                value={currentSort}
                onChange={handleSortChange}
                className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 transition"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="beds-desc">Most Bedrooms</option>
              </select>
            </div>
          </div>

          {children}
        </div>
      </div>
    </>
  );
}
