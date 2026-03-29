'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { Location, VerificationBadge } from '@/types/location';
import { Heart, MapPin, Star, Clock, Users, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { isLocationFavorited, subscribeToFavorites, toggleFavoriteLocation } from '@/lib/favorites';
import BookingCalendar from '@/components/BookingCalendar';
import BookingModal from '@/components/BookingModal';
import TrustBadges from '@/components/TrustBadges';
import CompareButton from '@/components/CompareButton';
import { getLocationBlockedDates } from '@/lib/availability';
import { getBookingMode, getVerificationHighlights } from '@/lib/location-utils';

type VerifiedLocation = Location & {
  isVerified?: boolean;
  verificationBadges?: VerificationBadge[];
  responseTime?: string;
};

interface LocationCardProps {
  location: VerifiedLocation;
}

const fallbackPhotos: Record<string, string> = {
  house: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
  penthouse: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
  studio: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
  apartment: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80',
  loft: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
  warehouse: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80',
  cabin: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
};

function formatPropertyType(propertyType: string) {
  return propertyType
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getPrimaryPhoto(location: Location) {
  const firstPhoto = location.images?.find((photo) => typeof photo === 'string' && photo.trim().length > 0);
  return firstPhoto || fallbackPhotos[location.propertyType] || fallbackPhotos.house;
}

export default function LocationCard({ location }: LocationCardProps) {
  const { toast } = useToast();
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selection, setSelection] = useState<{ selectedDate: string; selectedDates?: string[]; selectedTimeSlots: string[]; isMultiDay?: boolean }>({
    selectedDate: '',
    selectedDates: [],
    selectedTimeSlots: [],
    isMultiDay: false,
  });

  useEffect(() => {
    setIsFavorited(isLocationFavorited(location.id));
    return subscribeToFavorites((favorites) => setIsFavorited(favorites.includes(location.id)));
  }, [location.id]);

  const rating = location.reviewRating || 4.8;
  const reviewCount = location.reviewCount || 12;
  const heroPhoto = getPrimaryPhoto(location);
  const blockedDates = getLocationBlockedDates(location.id);
  const bookingMode = getBookingMode(location);
  const verificationBadges = [...getVerificationHighlights(location), ...(location.verificationBadges || [])];

  return (
    <>
      <div className="group overflow-hidden rounded-[30px] border border-black/8 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.10)]">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              const nextFavorites = toggleFavoriteLocation(location.id);
              const nextState = nextFavorites.includes(location.id);
              setIsFavorited(nextState);
              toast({
                title: nextState ? 'Saved to favorites' : 'Removed from favorites',
                description: nextState ? `${location.name} is ready when you want to come back to it.` : `${location.name} was removed from your saved list.`,
                variant: nextState ? 'success' : 'info',
              });
            }}
            className={`btn-press absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition ${
              isFavorited
                ? 'border-blue-500 bg-blue-500 text-white shadow-[0_14px_28px_rgba(59,130,246,0.24)]'
                : 'border-white/70 bg-white/92 text-slate-700 hover:border-blue-200 hover:text-blue-600'
            }`}
            aria-label={isFavorited ? `Remove ${location.name} from favorites` : `Save ${location.name} to favorites`}
            aria-pressed={isFavorited}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          <Link href={`/locations/${location.id}`} className="block">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <Image
                src={heroPhoto}
                alt={location.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/32 via-black/0 to-transparent" />
              <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 backdrop-blur-md">
                {formatPropertyType(location.propertyType)}
              </div>
              {/* Price moved below photo for readability */}
            </div>
          </Link>
        </div>

        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link href={`/locations/${location.id}`} className="line-clamp-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 transition hover:text-blue-600">
                {location.name}
              </Link>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-[-0.03em] text-slate-950">${location.pricePerHour}</span>
                <span className="text-sm font-medium text-slate-400">/ hour</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="truncate">{`${location.city}, ${location.state}`}</span>
              </div>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-950">
              <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
              {rating.toFixed(1)}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1.5 text-sm ${bookingMode === 'instant' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {bookingMode === 'instant' ? 'Instant book' : 'Request to book'}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
              {reviewCount} reviews
            </span>
          </div>

          <p className="mt-5 line-clamp-2 text-base leading-7 text-slate-600">
            {location.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div className="rounded-[22px] bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="h-4 w-4 text-blue-500" />
                Minimum
              </div>
              <p className="mt-2 font-semibold text-slate-950">{location.minimumBookingHours || 3} hour minimum</p>
            </div>
            <div className="rounded-[22px] bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Users className="h-4 w-4 text-blue-500" />
                Capacity
              </div>
              <p className="mt-2 font-semibold text-slate-950">{location.maxGuests || location.maxCapacity || 8} guests</p>
            </div>
          </div>

          <div className="mt-5 border-t border-black/6 pt-5">
            <TrustBadges
              isVerified={location.isVerified}
              verificationBadges={verificationBadges}
              responseTime={location.responseTime}
              variant="compact"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="min-w-[160px] flex-1">
              <CompareButton locationId={location.id} />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsReserveOpen(true);
                toast({
                  title: 'Booking flow opened',
                  description: `Pick a date for ${location.name} and continue when you're ready.`,
                  variant: 'info',
                });
              }}
              className="btn-press min-w-[160px] flex-1 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-blue-200 hover:text-blue-600"
            >
              {bookingMode === 'instant' ? 'Instant book' : 'Request booking'}
            </button>
            <Link
              href={`/locations/${location.id}`}
              className="btn-press min-w-[160px] flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-blue-600 hover:text-white hover:border-blue-600"
            >
              View details
            </Link>
          </div>
        </div>
      </div>

      {isReserveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-black">Reserve {location.name}</h2>
                <p className="mt-1 text-sm text-black/60">
                  Select a date and time for this property, then continue to booking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReserveOpen(false)}
                className="rounded-full border border-black/10 p-2 text-black transition hover:border-blue-500 hover:text-blue-600"
                aria-label="Close reserve modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <BookingCalendar
                bookings={location.bookings}
                blockedDates={blockedDates}
                minimumBookingHours={location.minimumBookingHours || 3}
                hourlyRate={location.pricePerHour}
                onSelectionChange={setSelection}
              />

              <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-black">Continue to booking</h3>
                    <p className="mt-1 text-sm text-black/60">
                      {selection.isMultiDay && (selection.selectedDates?.length || 0) > 1
                        ? `${selection.selectedDates?.length} days selected — dates will be prefilled in the booking request.`
                        : selection.selectedDate && selection.selectedTimeSlots.length > 0
                        ? 'Your selected date and time will be prefilled in the booking request.'
                        : 'Choose a date and one or more time blocks to continue.'}
                    </p>
                  </div>
                  <div className="w-full sm:w-auto sm:min-w-[260px]">
                    <BookingModal
                      locationId={location.id}
                      locationTitle={location.name}
                      hourlyRate={location.pricePerHour}
                      minimumBookingHours={location.minimumBookingHours || 3}
                      city={location.city}
                      state={location.state}
                      securityDeposit={location.securityDeposit}
                      securityDepositRequiredWhen={location.securityDepositRequiredWhen}
                      initialDate={selection.selectedDate}
                      initialTimeSlots={selection.selectedTimeSlots}
                      triggerLabel={
                        selection.isMultiDay && (selection.selectedDates?.length || 0) > 1
                          ? `Book ${selection.selectedDates?.length} days`
                          : selection.selectedDate && selection.selectedTimeSlots.length > 0
                            ? 'Book selected time'
                            : 'Log in to book'
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
