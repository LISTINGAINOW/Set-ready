// Force redeploy: 2026-03-22T18:22 PDT — hero fix push
import Link from 'next/link';
import { getFeaturedProperties } from '@/lib/properties';
import LocationCard from '@/components/LocationCard';
import { ArrowRight, BadgeCheck, Search } from 'lucide-react';
import EmailPopup from '@/components/EmailPopup';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import HowItWorks from '@/components/HowItWorks';
import ReviewList from '@/app/components/ReviewList';
import reviewsData from '@/data/reviews.json';
import type { Review } from '@/types/review';
import StatsBanner from '@/components/StatsBanner';
const heroImage = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80';
const heroImageAlt = 'Modern design-forward home exterior';

const featuredReviews = (reviewsData as Review[]).filter((review) => review.featured).slice(0, 2);

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

const homepageTestimonials = [
  {
    quote: 'We found a polished location in one afternoon, locked the date, and got the privacy terms we needed without a dozen emails.',
    name: 'Ava Chen',
    role: 'Producer',
    location: 'Los Angeles, CA',
  },
  {
    quote: 'The listings feel curated instead of chaotic. My team could actually compare spaces quickly and book with confidence.',
    name: 'Jordan Blake',
    role: 'Creative Director',
    location: 'Miami, FL',
  },
  {
    quote: 'The host communication was fast, clear, and professional. It felt built for real production schedules, not casual rentals.',
    name: 'Nina Torres',
    role: 'Content Lead',
    location: 'Las Vegas, NV',
  },
];

const featuredIn = ['Forbes', 'Architectural Digest', 'Hypebeast', 'Dwell', 'Wallpaper*'];

const pressQuotes = [
  {
    source: 'Editorial placeholder',
    quote: 'A cleaner way to discover design-forward locations for professional productions.',
  },
  {
    source: 'Press placeholder',
    quote: 'Feels more like a private concierge than a crowded rental marketplace.',
  },
  {
    source: 'Creator note',
    quote: 'Built to reduce friction, protect privacy, and help teams move fast when dates matter.',
  },
];

function MarketplaceSearch() {
  return (
    <form
      action="/search"
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
            name="q"
            placeholder="Search by city, style, or feature"
            className="min-h-[48px] w-full border-0 bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
      <button
        type="submit"
        className="inline-flex min-h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 sm:w-auto"
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={heroImageAlt}
              loading="eager"
              fetchPriority="high"
              className="absolute inset-0 -z-30 h-full w-full object-cover"
            />
            <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.68)_42%,rgba(0,0,0,0.78)_100%)]" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_34%)]" />

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
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-4 text-sm font-semibold text-white transition hover:bg-blue-600"
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
        <div className="mx-auto max-w-7xl rounded-[32px] border border-black/8 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.05)] sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Featured in</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
                Trust signals that feel editorial, not noisy.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Placeholder press placement gives the homepage a stronger credibility layer without breaking the minimal look.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {featuredIn.map((publication) => (
                  <div
                    key={publication}
                    className="flex min-h-[72px] items-center justify-center rounded-[22px] border border-black/8 bg-slate-50 px-4 py-3 text-center text-sm font-semibold tracking-[0.18em] text-slate-500"
                  >
                    {publication}
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {pressQuotes.map((item) => (
                  <div key={item.quote} className="rounded-[24px] border border-black/8 bg-slate-50 p-5">
                    <p className="text-base leading-7 text-slate-700">“{item.quote}”</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">{item.source}</p>
                  </div>
                ))}
              </div>
            </div>
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

      <StatsBanner propertyCount={featuredLocations.length} />

      <HowItWorks />

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Social proof</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
              Early featured reviews for the first property.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              These launch reviews are clearly marked as featured placeholders, not verified bookings. That keeps the page honest while still showing the kind of feedback future guests care about.
            </p>
          </div>
          <ReviewList
            initialReviews={featuredReviews}
            showForm={false}
            title="Featured reviews"
            description="Featured reviews are launch placeholders for social proof. Verified badges appear only for booking-backed reviews."
          />
        </div>
      </section>

      <TestimonialCarousel testimonials={homepageTestimonials} />

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
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-950 px-7 py-4 font-semibold text-white transition hover:bg-blue-600"
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
