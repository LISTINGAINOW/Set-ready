'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Trash2 } from 'lucide-react';
import locationsData from '@/data/locations.json';
import { Location } from '@/types/location';
import { getFavoriteLocationIds, removeFavoriteLocation, subscribeToFavorites } from '@/lib/favorites';

const locations = locationsData as unknown as Location[];

const fallbackPhotos: Record<string, string> = {
  house: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
  penthouse: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
  studio: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
  apartment: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80',
  loft: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
  warehouse: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80',
  cabin: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
};

function getPrimaryPhoto(location: Location) {
  const firstPhoto = location.images?.find((photo) => typeof photo === 'string' && photo.trim().length > 0);
  return firstPhoto || fallbackPhotos[location.propertyType] || fallbackPhotos.house;
}

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteLocationIds());
    return subscribeToFavorites(setFavoriteIds);
  }, []);

  const favoriteLocations = useMemo(() => {
    const favoriteSet = new Set(favoriteIds);
    return locations.filter((location) => favoriteSet.has(location.id));
  }, [favoriteIds]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-[#FAFAFA] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[30px] border border-black bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[36px]">
          <div className="border-b border-black px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Saved locations</p>
            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.06em] text-black sm:text-5xl lg:text-6xl">
                  Your favorites list, ready when you come back.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-black/70 sm:text-lg">
                  Save standout properties while you scout, then jump straight back into the ones worth a second look.
                </p>
              </div>
              <div className="inline-flex items-center gap-3 self-start rounded-full border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700">
                <Heart className="h-4 w-4 fill-current" />
                {favoriteLocations.length} saved {favoriteLocations.length === 1 ? 'property' : 'properties'}
              </div>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            {favoriteLocations.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {favoriteLocations.map((location) => (
                  <article
                    key={location.id}
                    className="overflow-hidden rounded-[28px] border border-black bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(59,130,246,0.14)]"
                  >
                    <Link href={`/locations/${location.id}`} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#FAFAFA]">
                        <Image
                          src={getPrimaryPhoto(location)}
                          alt={location.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70" />
                        <div className="absolute bottom-4 left-4 rounded-2xl bg-white/94 px-4 py-2 backdrop-blur-md">
                          <p className="text-xs uppercase tracking-[0.2em] text-black/45">From</p>
                          <p className="text-2xl font-semibold tracking-[-0.04em] text-black">
                            ${location.pricePerHour}
                            <span className="ml-1 text-sm font-medium text-black/60">/hour</span>
                          </p>
                        </div>
                      </div>
                    </Link>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link href={`/locations/${location.id}`} className="text-xl font-semibold tracking-[-0.03em] text-black transition hover:text-blue-600">
                            {location.name}
                          </Link>
                          <div className="mt-2 flex items-center gap-2 text-sm text-black/65">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span>{`${location.city}, ${location.state}`}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFavoriteIds(removeFavoriteLocation(location.id))}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 transition hover:border-blue-500 hover:bg-blue-500 hover:text-white"
                          aria-label={`Remove ${location.name} from favorites`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-black/72">{location.description}</p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full border border-blue-500 bg-white px-3 py-1 text-sm font-medium text-blue-600">
                          {location.style}
                        </span>
                        <span className="rounded-full border border-black/10 bg-[#FAFAFA] px-3 py-1 text-sm text-black/65">
                          {location.minimumBookingHours || 3} hour minimum
                        </span>
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Link
                          href={`/locations/${location.id}`}
                          className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                        >
                          View details
                        </Link>
                        <button
                          type="button"
                          onClick={() => setFavoriteIds(removeFavoriteLocation(location.id))}
                          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-black px-5 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-blue-200 bg-blue-50/50 px-6 py-16 text-center sm:px-10 sm:py-20">
                <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                  <Heart className="h-7 w-7" />
                </div>
                <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-black">No favorites yet</h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-black/65">
                  Tap the blue heart on any location card to build your shortlist. We&apos;ll keep it saved in this browser for your next session.
                </p>
                <Link
                  href="/locations"
                  className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  Browse locations
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
