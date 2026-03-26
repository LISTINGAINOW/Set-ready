import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Cities | SetVenue',
  description: 'SetVenue is available nationwide. Browse production-ready locations in 22 US cities — from Los Angeles to New Orleans, Chicago to Honolulu.',
  alternates: { canonical: '/cities' },
  openGraph: {
    title: 'All Cities | SetVenue',
    description: 'SetVenue is available nationwide. Browse production-ready locations in 22 US cities.',
    url: '/cities',
    type: 'website',
  },
};

const allCities = [
  {
    label: 'Los Angeles',
    state: 'CA',
    slug: 'los-angeles',
    tagline: 'The production capital of the world.',
  },
  {
    label: 'New York City',
    state: 'NY',
    slug: 'new-york',
    tagline: 'Brownstones, lofts, and penthouses.',
  },
  {
    label: 'Atlanta',
    state: 'GA',
    slug: 'atlanta',
    tagline: "30% tax credit. #2 US market.",
  },
  {
    label: 'Chicago',
    state: 'IL',
    slug: 'chicago',
    tagline: 'Architecture capital. 30% IL tax credit.',
  },
  {
    label: 'Miami',
    state: 'FL',
    slug: 'miami',
    tagline: 'Ocean light, Art Deco, year-round sun.',
  },
  {
    label: 'Nashville',
    state: 'TN',
    slug: 'nashville',
    tagline: "More than music. 25% TN incentive.",
  },
  {
    label: 'New Orleans',
    state: 'LA',
    slug: 'new-orleans',
    tagline: 'The Big Easy. 25–40% LA tax credit.',
  },
  {
    label: 'Austin',
    state: 'TX',
    slug: 'austin',
    tagline: 'Hill Country ranches. No state income tax.',
  },
  {
    label: 'San Francisco',
    state: 'CA',
    slug: 'san-francisco',
    tagline: 'Victorian homes and iconic views.',
  },
  {
    label: 'Seattle',
    state: 'WA',
    slug: 'seattle',
    tagline: 'Pacific Northwest. Waterfront and modern.',
  },
  {
    label: 'Portland',
    state: 'OR',
    slug: 'portland',
    tagline: 'Eclectic and creative. 20% OR rebate.',
  },
  {
    label: 'Denver',
    state: 'CO',
    slug: 'denver',
    tagline: 'Mountain modern. Ranch to loft.',
  },
  {
    label: 'Salt Lake City',
    state: 'UT',
    slug: 'salt-lake-city',
    tagline: 'Mountain backdrop. 20–25% UT incentive.',
  },
  {
    label: 'Albuquerque',
    state: 'NM',
    slug: 'albuquerque',
    tagline: 'Netflix hub. 25–40% NM rebate.',
  },
  {
    label: 'Santa Fe',
    state: 'NM',
    slug: 'santa-fe',
    tagline: 'Art capital of the Southwest.',
  },
  {
    label: 'Oklahoma City',
    state: 'OK',
    slug: 'oklahoma-city',
    tagline: 'Ranch estates. 37% OK rebate.',
  },
  {
    label: 'Savannah',
    state: 'GA',
    slug: 'savannah',
    tagline: 'Spanish moss and antebellum charm.',
  },
  {
    label: 'Wilmington',
    state: 'NC',
    slug: 'wilmington',
    tagline: 'Screen Gems Studios. 25% NC grant.',
  },
  {
    label: 'Philadelphia',
    state: 'PA',
    slug: 'philadelphia',
    tagline: 'Historic brownstones. 25% PA credit.',
  },
  {
    label: 'Pittsburgh',
    state: 'PA',
    slug: 'pittsburgh',
    tagline: 'Industrial chic. 25% PA credit.',
  },
  {
    label: 'Detroit',
    state: 'MI',
    slug: 'detroit',
    tagline: 'Gritty and authentic. 25% MI incentive.',
  },
  {
    label: 'Honolulu',
    state: 'HI',
    slug: 'honolulu',
    tagline: 'Paradise locations. 20–22% HI credit.',
  },
];

export default function CitiesPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">

        {/* Nationwide banner */}
        <div className="mb-8 flex items-center justify-center rounded-[20px] border border-green-200 bg-green-50 px-6 py-4 text-center">
          <p className="text-sm font-semibold text-green-800 sm:text-base">
            Available Nationwide — List your property anywhere in the USA.
          </p>
        </div>

        {/* Header */}
        <section className="overflow-hidden rounded-[30px] border border-black bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[36px]">
          <div className="border-b border-black px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">22 cities and growing</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-black sm:text-5xl lg:text-6xl">
                Production locations across the USA
              </h1>
              <p className="mt-5 text-base leading-7 text-black/70 sm:text-lg">
                SetVenue connects productions with film-ready properties in every major US market — from the coasts to the heartland.
                Browse by city or list your property anywhere in the country.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/free-listing"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                List Your Property — Any City
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/find-location"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600"
              >
                Find a Location
              </Link>
            </div>
          </div>
        </section>

        {/* City grid */}
        <section className="mt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allCities.map((city) => (
              <Link
                key={city.slug}
                href={`/locations/city/${city.slug}`}
                className="group flex flex-col rounded-[24px] border border-black bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:border-blue-500 hover:shadow-[0_16px_40px_rgba(59,130,246,0.12)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold tracking-[-0.02em] text-black group-hover:text-blue-600">
                      {city.label}
                    </p>
                    <p className="text-xs font-medium text-black/40">{city.state}</p>
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-black/30 transition group-hover:text-blue-500" />
                </div>
                <p className="mt-3 text-sm leading-5 text-black/60">{city.tagline}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Not your city? */}
        <section className="mt-12 rounded-[28px] border border-black/8 bg-slate-50 px-6 py-10 text-center sm:px-10 sm:py-12">
          <h2 className="text-xl font-semibold tracking-[-0.04em] text-black sm:text-2xl">
            Don&apos;t see your city?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-black/65">
            We accept property listings from anywhere in the United States. List your space and we&apos;ll surface it to productions in your area.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/free-listing"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              List Your Property
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/find-location"
              className="inline-flex min-h-[48px] items-center rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600"
            >
              Request a Location
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
