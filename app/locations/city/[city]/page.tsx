import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import LocationCard from '@/components/LocationCard';
import { getAllProperties } from '@/lib/properties';

const CITY_HUBS: Record<string, { label: string; state: string; headline: string; description: string }> = {
  'los-angeles': {
    label: 'Los Angeles',
    state: 'CA',
    headline: 'Production locations in Los Angeles',
    description: 'Scout film-ready homes, lofts, and estates across LA — from Malibu to Silver Lake. Production-ready spaces with clear rates, fast booking, and host-level privacy.',
  },
  'atlanta': {
    label: 'Atlanta',
    state: 'GA',
    headline: 'Production locations in Atlanta',
    description: 'Atlanta is one of the fastest-growing production markets in the US. Find design-forward homes, studios, and event spaces for film, photo shoots, and crew stays.',
  },
  'new-york': {
    label: 'New York City',
    state: 'NY',
    headline: 'Production locations in New York City',
    description: 'NYC lofts, penthouses, and brownstones built for production. Browse spaces in Manhattan, Brooklyn, and beyond — curated for shoots that need character, privacy, and logistics.',
  },
  'austin': {
    label: 'Austin',
    state: 'TX',
    headline: 'Production locations in Austin',
    description: 'Austin\'s creative scene demands spaces that match. From Hill Country ranches to downtown studios, find production-ready locations with transparent pricing and fast booking.',
  },
  'miami': {
    label: 'Miami',
    state: 'FL',
    headline: 'Production locations in Miami',
    description: 'Miami\'s light, architecture, and energy make it a premier production destination. Browse oceanfront estates, modern villas, and rooftop studios across Brickell, Wynwood, and the Beach.',
  },
  'nashville': {
    label: 'Nashville',
    state: 'TN',
    headline: 'Production locations in Nashville',
    description: 'Nashville is more than music — it\'s a booming creative hub. Find distinctive homes, industrial lofts, and event spaces for film, brand shoots, and crew accommodations.',
  },
};

export async function generateStaticParams() {
  return Object.keys(CITY_HUBS).map((city) => ({ city }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const hub = CITY_HUBS[city];
  if (!hub) return {};

  return {
    title: `${hub.headline} | SetVenue`,
    description: hub.description,
    alternates: { canonical: `/locations/city/${city}` },
    openGraph: {
      title: `${hub.headline} | SetVenue`,
      description: hub.description,
      url: `/locations/city/${city}`,
      type: 'website',
    },
  };
}

export default async function CityHubPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const hub = CITY_HUBS[city];
  if (!hub) notFound();

  const allProperties = await getAllProperties();
  const cityProperties = allProperties.filter(
    (p) => p.city.toLowerCase().replace(/\s+/g, '-') === city ||
           p.state.toLowerCase() === hub.state.toLowerCase() && city === 'los-angeles' && ['malibu', 'del mar', 'thousand oaks'].includes(p.city.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4">
          <Link href="/locations" className="inline-flex min-h-[44px] items-center text-sm text-black/60 hover:text-black">
            ← All locations
          </Link>
        </div>

        <section className="overflow-hidden rounded-[30px] border border-black bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[36px]">
          <div className="border-b border-black px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">{hub.label}</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-black sm:text-5xl lg:text-6xl">
                {hub.headline}
              </h1>
              <p className="mt-5 text-base leading-7 text-black/70 sm:text-lg">{hub.description}</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {cityProperties.length > 0 ? (
            <>
              <p className="mb-6 text-sm text-black/50">{cityProperties.length} location{cityProperties.length !== 1 ? 's' : ''} in {hub.label}</p>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {cityProperties.map((location) => (
                  <LocationCard key={location.id} location={location} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-[28px] border border-black bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:rounded-[32px] sm:py-20">
              <div className="mb-5 text-5xl">🏙️</div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-black">
                {hub.label} listings coming soon
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-black/65">
                We&apos;re actively curating production-ready spaces in {hub.label}. Browse all available locations or list your property to get on the map.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/locations"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  Browse all locations
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/list-property"
                  className="inline-flex min-h-[48px] items-center rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600"
                >
                  List your space
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="mt-16 rounded-[28px] border border-black/8 bg-slate-50 px-6 py-10 sm:px-10 sm:py-12">
          <h2 className="text-xl font-semibold tracking-[-0.04em] text-black sm:text-2xl">Browse other cities</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {Object.entries(CITY_HUBS)
              .filter(([slug]) => slug !== city)
              .map(([slug, meta]) => (
                <Link
                  key={slug}
                  href={`/locations/city/${slug}`}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-black bg-white px-5 py-2 text-sm font-medium text-black transition hover:border-blue-500 hover:text-blue-600"
                >
                  {meta.label}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
