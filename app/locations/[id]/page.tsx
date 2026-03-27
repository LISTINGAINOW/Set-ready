import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { CancellationPolicyTier, Location, VerificationBadge } from '@/types/location';
import { MapPin, DollarSign, Home, Users, Mail, Receipt, Check, X as XIcon, Siren, Clock3, BadgeCheck, House, ShieldCheck, FileText } from 'lucide-react';
import BookingSection from '@/components/BookingSection';
import BookingModal from '@/components/BookingModal';
import PhotoGallery from '@/components/PhotoGallery';
import ReviewsList from '@/components/ReviewsList';
import TrustBadges from '@/components/TrustBadges';
import CompareButton from '@/components/CompareButton';
import InquiryForm from '@/components/InquiryForm';
import { getPropertyBySlug } from '@/lib/properties';
import reviewsData from '@/data/reviews.json';
import { getLocationBlockedDates } from '@/lib/availability';
import type { Review } from '@/types/review';
import { getBookingMode, getDisplayAddress, getVerificationHighlights } from '@/lib/location-utils';
import { calculateBookingPricing, MINIMUM_BOOKING_TOTAL, PRODUCER_FEE_RATE } from '@/lib/pricing';

const AreaMap = dynamic(() => import('@/components/AreaMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-black bg-white/60 p-6 text-sm text-black/60">
      Loading approximate location map…
    </div>
  ),
});

type VerifiedLocation = Location & {
  isVerified?: boolean;
  verificationBadges?: VerificationBadge[];
  responseTime?: string;
};

const reviews: Review[] = reviewsData as Review[];

async function getLocation(id: string): Promise<Location | null> {
  return getPropertyBySlug(id);
}

function getPrimaryPhoto(location: Location) {
  return location.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80';
}

const cancellationPolicyContent: Record<CancellationPolicyTier, { summary: string; refundWindow: string; details: string }> = {
  Flexible: {
    summary: 'Full refund if cancelled 24+ hours before the booking start time.',
    refundWindow: '24+ hours before booking',
    details: 'Best for productions that need room to shift dates without penalty.',
  },
  Moderate: {
    summary: 'Full refund if cancelled 48+ hours before the booking start time.',
    refundWindow: '48+ hours before booking',
    details: 'Balanced protection for both hosts and guests on medium-lead bookings.',
  },
  Strict: {
    summary: '50% refund if cancelled 72+ hours before the booking start time.',
    refundWindow: '72+ hours before booking',
    details: 'Best for premium dates and properties that block off significant host time.',
  },
};

function getDefaultHouseRules(location: Location, maxGuests?: number) {
  return [
    'No smoking indoors unless explicitly approved by the host.',
    'No parties or unregistered guests without prior approval.',
    'Respect quiet hours and keep exterior noise controlled after 10 PM.',
    'Leave the space photo-ready and clean up gear, props, and trash before wrap.',
    `Maximum occupancy: ${typeof maxGuests === 'number' ? `${maxGuests} people` : 'Follow host guidance'}${typeof maxGuests === 'number' ? ' unless the host approves a larger crew.' : '.'}`,
    location.parkingDetails || 'Parking instructions are shared after booking confirmation.',
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const location = await getPropertyBySlug(id);
  if (!location) return {};

  const title = `${location.name} | Film Location Rental | SetVenue`;
  const description = `Book ${location.name} for your next production. ${location.beds} bed, ${location.baths} bath in ${location.city}, ${location.state}. Starting at $${location.pricePerHour}/hr. 0% host fee.`;
  const primaryPhoto = location.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80';
  const url = `https://setvenue.com/locations/${id}`;

  return {
    title,
    description,
    alternates: { canonical: `/locations/${id}` },
    openGraph: {
      title,
      description,
      url,
      siteName: 'SetVenue',
      type: 'website',
      images: [{ url: primaryPhoto, width: 1200, height: 800, alt: location.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [primaryPhoto],
    },
  };
}

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const location = await getLocation(id);

  if (!location) {
    notFound();
  }

  const displayAddress = getDisplayAddress(location);
  const bookingMode = getBookingMode(location);
  const verificationBadges = [...getVerificationHighlights(location), ...(location.verificationBadges || [])];
  const minimumBookingHours = location.minimumBookingHours || 3;
  const blockedDates = getLocationBlockedDates(location.id);
  const maxGuestsValue = location.maxGuests ?? location.maxCapacity;
  const sampleBaseRate = location.pricePerHour * minimumBookingHours;
  const samplePricing = calculateBookingPricing(sampleBaseRate);
  const sampleServiceFee = samplePricing.producerFee;
  const sampleTotal = samplePricing.total;
  const gallery = location.images?.length ? location.images : [getPrimaryPhoto(location)];
  const locationReviews = reviews.filter((review) => review.propertyId === location.id);
  const cancellationPolicyTier = location.cancellationPolicy || 'Moderate';
  const cancellationPolicy = cancellationPolicyContent[cancellationPolicyTier];
  const houseRules = location.houseRules?.length ? location.houseRules : getDefaultHouseRules(location, maxGuestsValue);

  // Compliance banner removed from browse view — TOT/STR info is for hosts only (list-property page)
  const regulationsBanner: string | null = null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <a href="/locations" className="inline-flex min-h-[44px] items-center text-sm text-black/60 hover:text-black sm:text-base">
          ← Back to Browse
        </a>
      </div>

      {/* Compliance / regulatory banner */}
      {regulationsBanner && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span><span className="font-semibold">Local regulations:</span> {regulationsBanner}</span>
        </div>
      )}

      {/* Insurance badges */}
      {(location.hasLiabilityInsurance || location.hasProductionInsurance) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {location.hasLiabilityInsurance && (
            <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-800">
              <ShieldCheck className="h-4 w-4" />
              Liability Insurance
            </span>
          )}
          {location.hasProductionInsurance && (
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-800">
              <ShieldCheck className="h-4 w-4" />
              Production Insurance
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <PhotoGallery photos={gallery} title={location.name} />
          </div>

          <div className="rounded-2xl border border-black bg-white/50 p-5 sm:p-8">
            <h1 className="mb-4 text-3xl font-bold text-black sm:text-4xl">{location.name}</h1>
            <div className="mb-6 flex items-start text-black/60">
              <MapPin className="mr-2 mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm sm:text-base">
                {displayAddress}
              </span>
            </div>
            <div className="mb-8 space-y-4">
              <TrustBadges
                isVerified={location.isVerified}
                verificationBadges={verificationBadges}
                responseTime={location.responseTime}
                showTitle
              />
              <p className="text-base text-black/80 sm:text-lg">{location.description}</p>
            </div>

            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
              <div className="rounded-xl bg-white/50 p-5">
                <div className="mb-2 flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-blue-500" />
                  <span className="text-black/60">Price</span>
                </div>
                <div className="text-3xl font-bold text-black">
                  ${location.pricePerHour}
                  <span className="text-lg text-black/60">/hour</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/50 p-5">
                <div className="mb-2 flex items-center">
                  <Home className="mr-2 h-5 w-5 text-blue-600" />
                  <span className="text-black/60">Property Type</span>
                </div>
                <div className="text-xl font-bold capitalize text-black sm:text-2xl">{location.propertyType}</div>
              </div>
              <div className="rounded-xl bg-white/50 p-5">
                <div className="mb-2 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-500" />
                  <span className="text-black/60">Style</span>
                </div>
                <div className="text-base font-semibold text-black sm:text-lg">{location.style}</div>
              </div>
              {(location.bestUses || []).length > 0 && (
                <div className="rounded-xl bg-white/50 p-5">
                  <div className="mb-2 flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-500" />
                    <span className="text-black/60">Best Uses</span>
                  </div>
                  <div className="text-base font-semibold text-black sm:text-lg">{(location.bestUses || []).join(', ')}</div>
                </div>
              )}
            </div>

            <div className="mb-10 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 sm:p-6">
              <div className="flex items-start gap-3 text-blue-500">
                <Receipt className="mt-1 h-5 w-5 shrink-0" />
                <h2 className="text-xl font-bold text-black sm:text-2xl">Transparent booking pricing</h2>
              </div>
              <p className="mt-3 text-sm text-black/80 sm:text-base">
                Producers see a transparent 10% service fee added before checkout. Hosts keep 100% — always. No hidden charges.
              </p>
              {(location as any).pricing && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Rates by Production Type</p>
                  <div className="flex flex-wrap gap-2">
                    {(location as any).pricing.adult?.enabled && (
                      <span className="rounded-full bg-pink-50 px-3 py-1 text-sm text-pink-700">🔞 Adult ${(location as any).pricing.adult.hourlyRate}/hr</span>
                    )}
                    {(location as any).pricing.events?.enabled && (
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-700">🎉 Events ${(location as any).pricing.events.hourlyRate}/hr</span>
                    )}
                    {(location as any).pricing.mainstream?.enabled && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">🎬 Film/TV {(location as any).pricing.mainstream.dailyRate ? `$${(location as any).pricing.mainstream.dailyRate.toLocaleString()}/day` : `$${(location as any).pricing.mainstream.hourlyRate}/hr`}</span>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-black bg-white/60 p-4">
                  <p className="text-sm text-black/60">Base rate ({minimumBookingHours} hr min.)</p>
                  <p className="mt-2 text-2xl font-bold text-black">${sampleBaseRate.toFixed(2)}</p>
                </div>
                <div className="rounded-xl border border-black bg-white/60 p-4">
                  <p className="text-sm text-black/60">{Math.round(PRODUCER_FEE_RATE * 100)}% service fee added</p>
                  <p className="mt-2 text-2xl font-bold text-black">${sampleServiceFee.toFixed(2)}</p>
                </div>
                <div className="rounded-xl border border-black bg-white/60 p-4">
                  <p className="text-sm text-black/60">Estimated total (min. ${MINIMUM_BOOKING_TOTAL})</p>
                  <p className="mt-2 text-2xl font-bold text-black">${sampleTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-bold text-black">Amenities</h2>
              <div className="flex flex-wrap gap-3">
                {location.amenities.map((amenity) => (
                  <span key={amenity} className="rounded-full border border-black bg-white px-4 py-2 text-sm text-black capitalize sm:text-base">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-bold text-black">About This Location</h2>
              <p className="text-black/80">
                {location.style && `This ${location.style} property`}{!location.style && 'This property'} features {location.amenities.slice(0, 3).join(', ')}{location.amenities.length > 3 ? `, and ${location.amenities.length - 3} more amenities` : ''}. Located in{' '}
                {location.city}, {location.state}, it&apos;s production-ready with professional-grade access, parking, and crew-friendly layouts.
              </p>
            </div>

            <div className="mb-10 grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-black bg-white/70 p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-600/10 p-3 text-blue-600">
                    <Siren className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Cancellation policy</p>
                    <h2 className="mt-2 text-2xl font-bold text-black">{cancellationPolicyTier}</h2>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-black/80 sm:text-base">{cancellationPolicy.summary}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-black/10 bg-black p-4 text-white">
                    <div className="flex items-center gap-2 text-sm text-blue-300">
                      <Clock3 className="h-4 w-4" />
                      Refund window
                    </div>
                    <p className="mt-2 text-lg font-semibold">{cancellationPolicy.refundWindow}</p>
                  </div>
                  <div className="rounded-xl border border-blue-600/20 bg-blue-600/10 p-4">
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <BadgeCheck className="h-4 w-4" />
                      What to expect
                    </div>
                    <p className="mt-2 text-sm leading-6 text-black/80">{cancellationPolicy.details}</p>
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-black/10 bg-white p-4">
                  <p className="text-sm font-semibold text-black">Refund rules</p>
                  <ul className="mt-3 space-y-2 text-sm text-black/70">
                    <li>• Cancellation timing is measured against the scheduled booking start time.</li>
                    <li>• Refunds apply to the booking amount before any non-refundable payment processing charges.</li>
                    <li>• Guests should cancel through the platform so the timeline is documented clearly.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-black bg-white/70 p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-600/10 p-3 text-blue-600">
                    <House className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">House rules</p>
                    <h2 className="mt-2 text-2xl font-bold text-black">Host guidelines</h2>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-black/80 sm:text-base">
                  Hosts can customize these rules later. For now, each listing shows a clean mock set tailored to the space.
                </p>
                <div className="mt-5 grid gap-3">
                  {houseRules.map((rule) => (
                    <div key={rule} className="flex items-start gap-3 rounded-xl border border-blue-600/15 bg-blue-600/5 px-4 py-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <span className="text-sm leading-6 text-black/80">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-bold text-black">Location Rules</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[...(location.locationRules || []), { label: 'Cleaning fee may apply if property is left in poor condition', allowed: true }].map((rule) => (
                  <div key={rule.label} className="flex flex-col gap-3 rounded-xl border border-black bg-white/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-black/80 sm:text-base">{rule.label}</span>
                    <span className="inline-flex items-center gap-1 self-start rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-600 sm:self-auto">
                      {rule.allowed ? <Check className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
                      {rule.allowed ? 'Allowed' : 'Not allowed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-bold text-black">Location</h2>
              <AreaMap city={location.city} state={location.state} />
            </div>

            <BookingSection
              locationId={location.id}
              locationTitle={location.name}
              hourlyRate={location.pricePerHour}
              minimumBookingHours={minimumBookingHours}
              city={location.city}
              state={location.state}
              securityDeposit={location.securityDeposit}
              securityDepositRequiredWhen={location.securityDepositRequiredWhen}
              bookings={location.bookings}
              blockedDates={blockedDates}
            />

            <div className="mt-10">
              <h2 className="mb-4 text-2xl font-bold text-black">Reviews & ratings</h2>
              <ReviewsList propertyId={location.id} initialReviews={locationReviews} />
            </div>

            <div className="mt-10">
              <InquiryForm propertyId={location.id} propertyName={location.name} />
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:space-y-8">
          <div className="rounded-2xl border border-black bg-white/50 p-5 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-black">{bookingMode === 'instant' ? 'Instant Book' : 'Request Booking'}</h2>
              <CompareButton locationId={location.id} />
            </div>
            <p className="mb-6 text-sm text-black/60 sm:text-base">{bookingMode === 'instant' ? 'This host allows fast-track checkout on approved dates.' : 'Choose from the calendar below the map, or send a general booking request here.'}</p>
            <BookingModal
              locationId={location.id}
              locationTitle={location.name}
              hourlyRate={location.pricePerHour}
              minimumBookingHours={minimumBookingHours}
              city={location.city}
              state={location.state}
              securityDeposit={location.securityDeposit}
              securityDepositRequiredWhen={location.securityDepositRequiredWhen}
            />
            <div className="mt-4 border-t border-gray-200 pt-4">
              <a
                href={`/bid/${location.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-green-600 px-6 py-3 text-center font-semibold text-green-600 transition hover:bg-green-600 hover:text-white"
              >
                🎯 Name Your Price
              </a>
              <p className="mt-2 text-center text-xs text-gray-500">Have a different budget? Make an offer and negotiate directly.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-black bg-white/50 p-5 sm:p-8">
            <h2 className="mb-6 text-2xl font-bold text-black">Contact</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-black/60" />
                <span className="text-sm text-black/80 sm:text-base">Contact details are shared according to the listing privacy tier and booking stage.</span>
              </div>
              <p className="mt-6 text-sm text-black/60">
                Hosts may choose what contact details to share on their listing. SetVenue business support is email-only via support@setvenue.com.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-black bg-white/50 p-5 sm:p-8">
            <h2 className="mb-6 text-2xl font-bold text-black">Quick Facts</h2>
            <ul className="space-y-4">
              <li className="flex items-center justify-between gap-4">
                <span className="text-black/60">Minimum booking</span>
                <span className="text-right font-semibold text-black">{minimumBookingHours} hours</span>
              </li>
              <li className="flex items-center justify-between gap-4">
                <span className="text-black/60">Max capacity</span>
                <span className="text-right font-semibold text-black">{typeof maxGuestsValue === 'number' ? `${maxGuestsValue} people` : 'Contact host'}</span>
              </li>
              <li className="flex items-center justify-between gap-4">
                <span className="text-black/60">Cancellation</span>
                <span className="text-right font-semibold text-black">{cancellationPolicyTier}</span>
              </li>
              <li className="flex items-center justify-between gap-4">
                <span className="text-black/60">Security deposit</span>
                <span className="text-right font-semibold text-black">{typeof location.securityDeposit === 'number' && location.securityDeposit > 0 ? `$${location.securityDeposit}` : 'Not required'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


