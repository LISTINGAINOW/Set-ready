import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Clock, DollarSign, FileText, MapPin, Search, Shield, Users, Zap } from 'lucide-react';
import { getFeaturedProperties } from '@/lib/properties';
import LocationCard from '@/components/LocationCard';

export const metadata: Metadata = {
  title: 'For Production Companies | SetVenue — Film & Photo Location Rentals',
  description: 'Find production-ready film locations, photo shoot venues, and crew housing. Lower fees than Giggster or Peerspace. Search by city, style, amenities, and budget.',
  alternates: { canonical: '/for-productions' },
  openGraph: {
    title: 'For Production Companies | SetVenue',
    description: 'Film locations, photo shoot venues, and crew housing — one platform, lower fees.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For Production Companies | SetVenue',
    description: 'Film locations, photo shoot venues, and crew housing — one platform, lower fees.',
  },
};

const painPoints = [
  {
    icon: Clock,
    problem: 'Scouting takes weeks',
    solution: 'Search 500+ curated locations with production-ready details. Filter by city, style, capacity, and amenities in seconds.',
  },
  {
    icon: DollarSign,
    problem: 'Platform fees eat your budget',
    solution: 'Just 10% service fee for renters — lower than Giggster (15-25%) and Peerspace (15-20%). More budget for what matters.',
  },
  {
    icon: Search,
    problem: 'Listings hide the details',
    solution: 'Every SetVenue property shows crew parking, power access, load-in logistics, noise levels, and production-specific amenities upfront.',
  },
  {
    icon: MapPin,
    problem: 'Scattered across platforms',
    solution: 'Locations, crew housing, and event venues in one place. One search, one booking, one invoice.',
  },
];

const features = [
  {
    title: 'Multi-day booking',
    description: 'Book for a single day, a full week, or an entire month. Select your date range and get instant pricing.',
    icon: '📅',
  },
  {
    title: 'Name Your Price',
    description: 'Make offers on properties. Negotiate rates, duration, and terms directly with the host through the platform.',
    icon: '💰',
  },
  {
    title: 'Production-ready profiles',
    description: 'Every listing includes parking spots, power specs, max crew capacity, privacy level, cancellation policy, and verified amenities.',
    icon: '🎬',
  },
  {
    title: 'City permit guides',
    description: '22 US cities with permit requirements, fees, timelines, and direct links to permit applications.',
    icon: '📋',
  },
  {
    title: 'Insurance integration',
    description: 'Understand insurance requirements before you book. We guide you through what coverage the host requires.',
    icon: '🛡️',
  },
  {
    title: 'Location concierge',
    description: "Can't find the right space? Submit a brief and our team will scout properties that match your creative needs.",
    icon: '🔍',
  },
];

export default async function ForProductionsPage() {
  const featuredLocations = await getFeaturedProperties();
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-slate-100 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <Zap className="h-4 w-4" />
            For production companies
          </div>
          <h1 className="text-4xl font-bold tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">
            The fastest way to find and book production locations.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Skip the spreadsheets, the endless emails, and the 20% platform fees.
            SetVenue connects you directly with production-ready properties at the lowest cost.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/locations"
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
            >
              Browse locations
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/find-location"
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-950 transition hover:border-blue-200 hover:text-blue-600"
            >
              Find me a location
            </Link>
          </div>
        </div>
      </section>

      {/* Pain points → Solutions */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Why SetVenue</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              We solve the problems you actually have.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {painPoints.map((item) => (
              <div key={item.problem} className="rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wider text-red-500 line-through decoration-red-300">{item.problem}</p>
                <p className="mt-3 text-base leading-7 text-slate-700">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured locations */}
      {featuredLocations.length > 0 && (
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Featured locations</p>
                <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  Production-ready spaces, ready to book.
                </h2>
              </div>
              <Link href="/locations" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition hover:text-blue-600">
                Browse all locations
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {featuredLocations.slice(0, 3).map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fee comparison */}
      <section className="border-y border-slate-100 bg-slate-50/50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Lower fees. More budget for your production.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            A $5,000 booking costs you $500 less on SetVenue than on Giggster.
          </p>
          <div className="mt-10 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
            <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-600">
              <div className="text-left">Platform</div>
              <div>Host fee</div>
              <div>Guest fee</div>
              <div>Total on $5K booking</div>
            </div>
            {[
              { name: 'SetVenue', hostFee: '0%', guestFee: '10%', total: '$5,500', highlight: true },
              { name: 'Peerspace', hostFee: '~17.5%', guestFee: 'Included', total: '~$6,060', highlight: false },
              { name: 'Giggster', hostFee: '15-25%', guestFee: 'Included', total: '~$6,000', highlight: false },
            ].map((row) => (
              <div
                key={row.name}
                className={`grid grid-cols-4 px-6 py-5 text-sm ${
                  row.highlight
                    ? 'border-l-4 border-l-blue-500 bg-blue-50/50 font-semibold text-slate-950'
                    : 'border-b border-slate-50 text-slate-600'
                }`}
              >
                <div className="text-left font-semibold">{row.name}</div>
                <div>{row.hostFee}</div>
                <div>{row.guestFee}</div>
                <div className={row.highlight ? 'text-blue-600' : ''}>{row.total}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Built for productions</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Everything your production needs.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-[24px] border border-slate-200 bg-white p-7">
                <div className="mb-4 text-3xl">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-slate-950 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
            Ready to find your next location?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            Browse production-ready locations or let our concierge team find the perfect match for your brief.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/locations"
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
            >
              Browse locations
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/find-location"
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full border border-slate-700 bg-white/5 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
            >
              Location concierge
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
