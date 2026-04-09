// Force redeploy: 2026-03-22T18:22 PDT — hero fix push
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProperties } from '@/lib/properties';
import LocationCard from '@/components/LocationCard';
import { ArrowRight, Search, Zap, DollarSign, Camera, Film, Music, Sparkles, Building2, CalendarCheck } from 'lucide-react';
import EmailPopup from '@/components/EmailPopup';
import HowItWorks from '@/components/HowItWorks';
import FeeComparisonSection from '@/components/FeeComparisonSection';
import FreeListingCTA from '@/components/FreeListingCTA';
import ProductionTrustSection from '@/components/ProductionTrustSection';
const defaultOgImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

export const metadata: Metadata = {
  title: 'SetVenue — Premium Film & Production Location Rentals',
  description: 'Find and book film locations, photo shoot venues, and production event spaces. Lower fees than Giggster or Peerspace. One platform for every production need.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'SetVenue — Premium Film & Production Location Rentals',
    description: 'Find and book film locations, photo shoot venues, and production event spaces. Lower fees than Giggster or Peerspace.',
    url: 'https://setvenue.com',
    type: 'website',
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'SetVenue - Production Location Rentals' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SetVenue — Premium Film & Production Location Rentals',
    description: 'Find and book film locations, photo shoot venues, and production event spaces. Lower fees than Giggster or Peerspace.',
    images: [defaultOgImage],
  },
};

const heroImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=80';
const heroImageAlt = 'Modern white home exterior with blue sky';

const categories = [
  { label: 'Film', icon: Film, href: '/locations?type=film', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80' },
  { label: 'Photo Shoot', icon: Camera, href: '/locations?type=photography', image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Music Video', icon: Music, href: '/locations?type=music-video', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Commercial', icon: Sparkles, href: '/locations?type=commercial', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Events', icon: Building2, href: '/locations?type=events', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80' },
  { label: 'TV Production', icon: CalendarCheck, href: '/locations?type=tv', image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=600&q=80' },
];

function MarketplaceSearch() {
  return (
    <form
      action="/locations"
      className="flex w-full flex-col gap-3 rounded-[30px] border border-white/18 bg-white/96 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:flex-row sm:items-center sm:rounded-full sm:p-2"
    >
      <div className="flex flex-1 items-center gap-3 rounded-full px-2 py-1 sm:px-5 sm:py-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Search className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="hero-home-search" className="sr-only">
            Search locations
          </label>
          <input
            id="hero-home-search"
            type="search"
            name="search"
            placeholder="Search by city, style, or feature"
            className="min-h-[48px] w-full border-0 bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
      <button
        type="submit"
        className="inline-flex min-h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-blue-50 sm:w-auto"
      >
        Search
      </button>
    </form>
  );
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SetVenue',
  url: 'https://setvenue.com',
  description:
    'SetVenue is a production marketplace for film locations, photo shoot venues, and event spaces. Lower fees than Giggster or Peerspace — 0% host fee, 10% guest service fee.',
  sameAs: ['https://twitter.com/SetVenueHQ'],
};

export default async function Home() {
  const featuredLocations = await getFeaturedProperties();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfc_100%)] text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <EmailPopup />

      {/* Hero — full-bleed with search + CTAs */}
      <section className="px-4 pb-6 pt-6 sm:px-6 lg:px-8 lg:pb-8 lg:pt-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-black/10 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.08)] sm:rounded-[44px]">
          <div className="relative isolate min-h-[540px] overflow-hidden px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <Image
              src={heroImage}
              alt={heroImageAlt}
              fill
              priority
              sizes="100vw"
              className="-z-30 object-cover"
            />
            <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.55)_50%,rgba(0,0,0,0.65)_100%)]" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_40%)]" />

            <div className="mx-auto flex max-w-4xl flex-col items-start justify-center text-left">
              <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-[-0.08em] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.8)] sm:text-6xl lg:text-7xl">
                Find your perfect set.
              </h1>
              <p className="mt-3 max-w-xl text-lg text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
                Production-ready locations for film, photo, and events.
              </p>

              <div className="mt-8 w-full max-w-3xl">
                <MarketplaceSearch />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/earn"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
                >
                  <DollarSign className="h-4 w-4" />
                  List your property — free
                </Link>
                <Link
                  href="/for-productions"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
                >
                  <Zap className="h-4 w-4" />
                  For production companies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category tiles — visual browse */}
      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
            Browse by production type
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="aspect-[4/5] relative">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <cat.icon className="mb-1.5 h-5 w-5 text-white/80" />
                    <p className="text-sm font-semibold text-white">{cat.label}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured locations — grid-first, minimal text */}
      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
              Featured locations
            </h2>
            <Link href="/locations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-950 transition hover:text-blue-600">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {featuredLocations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        </div>
      </section>

      {/* Value props — compact icon row */}
      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { value: '0%', label: 'Host fees', sub: 'List for free, keep everything' },
            { value: '10%', label: 'Guest fee', sub: 'Lower than Giggster or Peerspace' },
            { value: '22', label: 'US cities', sub: 'Coast to coast coverage' },
            { value: '40+', label: 'Trusted hosts', sub: 'Curated, production-ready' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-black/8 bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-bold tracking-tight text-blue-600">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{stat.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <FeeComparisonSection />

      <FreeListingCTA />

      <ProductionTrustSection />

      <HowItWorks />

      {/* Testimonials — compact */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
            What people are saying
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                quote: 'Found the exact mid-century vibe in ten minutes. Photos matched perfectly on set day.',
                name: 'Sarah K.',
                role: 'Location Manager',
              },
              {
                quote: 'Zero host fees means I keep what I charge. Other platforms took 20% of every booking.',
                name: 'Marcus T.',
                role: 'Property Owner',
              },
              {
                quote: 'Multi-day booking calendar saved so much back-and-forth. Selected the whole week in two clicks.',
                name: 'Alex R.',
                role: 'Production Coordinator',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-3.5 w-3.5 fill-blue-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-6 text-slate-700">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-slate-950">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host CTA */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#1e3a5f_0%,#1d4ed8_100%)] p-8 shadow-[0_24px_70px_rgba(29,78,216,0.25)] sm:p-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-lg">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                Earn more with zero host fees.
              </h2>
              <p className="mt-3 text-base leading-7 text-blue-100">
                Productions pay $200–$2,000+ per day. List free, keep 100%.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:items-end">
              <Link
                href="/earn"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                <DollarSign className="h-4 w-4" />
                Calculate my earnings
              </Link>
              <Link
                href="/list-property"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                List your property
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — tight */}
      <section className="px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-black/10 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-12">
          <h2 className="text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-4xl">
            The right location is waiting.
          </h2>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/locations"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse locations
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/find-location"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-black/12 bg-white px-8 py-3 font-semibold text-slate-950 transition hover:border-blue-200 hover:text-blue-600"
            >
              Submit a location brief
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">No account required &middot; 10% guest fee &middot; 0% host fee</p>
        </div>
      </section>
    </div>
  );
}
