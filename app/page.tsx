// Force redeploy: 2026-03-22T18:22 PDT — hero fix push
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProperties } from '@/lib/properties';
import LocationCard from '@/components/LocationCard';
import { ArrowRight, BadgeCheck, Search } from 'lucide-react';
import EmailPopup from '@/components/EmailPopup';
import HowItWorks from '@/components/HowItWorks';
export const metadata: Metadata = {
  title: 'SetVenue — Premium Film & Production Location Rentals',
  description: 'Find and book film locations, photo shoot venues, production spaces, and crew housing. Lower fees than Giggster or Peerspace. One platform for every production need.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'SetVenue — Premium Film & Production Location Rentals',
    description: 'Find and book film locations, photo shoot venues, production spaces, and crew housing. Lower fees than Giggster or Peerspace.',
    url: 'https://setvenue.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SetVenue — Premium Film & Production Location Rentals',
    description: 'Find and book film locations, photo shoot venues, production spaces, and crew housing. Lower fees than Giggster or Peerspace.',
  },
};

const heroImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=80';
const heroImageAlt = 'Modern white home exterior with blue sky';

const trustPoints = [
  {
    title: 'Designed for production',
    description: 'Film locations, crew stays, and event venues all in one place.',
  },
  {
    title: 'Curated, not crowded',
    description: 'Fewer distractions, stronger imagery, and listings that feel production-ready.',
  },
  {
    title: 'Faster to shortlist',
    description: 'See the essentials up front and move quickly when a date needs to lock.',
  },
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

export default async function Home() {
  const featuredLocations = await getFeaturedProperties();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfc_100%)] text-slate-950">
      <EmailPopup />

      <section className="px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-black/10 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.08)] sm:rounded-[44px]">
          <div className="relative isolate min-h-[640px] overflow-hidden px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
            <Image
              src={heroImage}
              alt={heroImageAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 100vw"
              className="-z-30 object-cover"
            />
            <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.45)_50%,rgba(0,0,0,0.55)_100%)]" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_40%)]" />

            <div className="mx-auto flex max-w-4xl flex-col items-start justify-center text-left">
              <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-[-0.08em] text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-7xl">
                Locations. Stays. Events. One platform.
              </h1>

              <div className="mt-10 w-full max-w-3xl">
                <MarketplaceSearch />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-black/8 bg-white px-8 py-10 shadow-[0_24px_70px_rgba(15,23,42,0.05)] sm:px-10 sm:py-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Browse</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-4xl">
                Production-ready locations
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                Explore design-forward homes, lofts, and studios for film, photo shoots, events, and crew housing.
              </p>
            </div>

            <Link
              href="/locations"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse properties
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Why it feels better</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
              Less clutter. Better decisions.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The experience is intentionally stripped back so the space, privacy level, and price are easy to compare at a glance.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {trustPoints.map((point) => (
              <div key={point.title} className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-slate-950">{point.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Featured locations</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
                A calmer way to shortlist spaces.
              </h2>
            </div>
            <Link href="/locations" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition hover:text-blue-600">
              View all listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredLocations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* Social proof — Testimonials */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">What people are saying</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-4xl">
              Built for productions that move fast.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: 'We found the exact mid-century vibe we needed in ten minutes. The photos matched perfectly on set day. No wasted scout trips.',
                name: 'Sarah K.',
                role: 'Location Manager',
                company: 'Independent Film',
              },
              {
                quote: 'Zero host fees means I actually keep what I charge. On other platforms, I was losing 20% of every booking to platform fees.',
                name: 'Marcus T.',
                role: 'Property Owner',
                company: 'Malibu Estate',
              },
              {
                quote: 'The booking calendar with multi-day support saved us so much back-and-forth. Selected the whole week and submitted in two clicks.',
                name: 'Alex R.',
                role: 'Production Coordinator',
                company: 'Commercial Production',
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="flex flex-col justify-between rounded-[28px] border border-black/8 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
              >
                <div>
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="h-4 w-4 fill-blue-500 text-blue-500" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-base leading-7 text-slate-700">&ldquo;{testimonial.quote}&rdquo;</p>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-sm font-semibold text-slate-950">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof banner */}
      <section className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-blue-100 bg-blue-50 px-6 py-4">
          <p className="text-center text-sm font-semibold text-blue-700">
            Trusted by 40+ property owners — zero platform fees for hosts, 10% service fee for guests.{' '}
            <Link href="/for-productions" className="underline hover:no-underline">
              Compare to Giggster &amp; Peerspace →
            </Link>
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-blue-100 bg-blue-50/50 px-8 py-10 sm:px-12 sm:py-12">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: '0%', label: 'Host fees' },
              { value: '40+', label: 'Property owners trusted us' },
              { value: '22', label: 'US cities covered' },
              { value: '10%', label: 'Guest service fee' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold tracking-[-0.04em] text-blue-600 sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-black/10 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-12 lg:p-14">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Ready to scout</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
            Start with the right location.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Browse premium spaces, compare the essentials quickly, and move when the right set opens up — or list for free and keep 100% as a host.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/locations"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-blue-600 px-7 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse available locations
            </Link>
            <Link
              href="/list-property"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-black/12 bg-white px-7 py-4 font-semibold text-slate-950 transition hover:border-blue-200 hover:text-blue-600"
            >
              Become a host
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
