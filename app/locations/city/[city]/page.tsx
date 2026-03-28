import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import LocationCard from '@/components/LocationCard';
import { getAllProperties } from '@/lib/properties';

interface CityHub {
  label: string;
  state: string;
  headline: string;
  description: string;
  bullets: string[];
  propertyTypes: string[];
  incentives?: string;
}

const CITY_HUBS: Record<string, CityHub> = {
  'los-angeles': {
    label: 'Los Angeles',
    state: 'CA',
    headline: 'Production locations in Los Angeles',
    description: 'Scout film-ready homes, lofts, and estates across LA — from Malibu to Silver Lake. Production-ready spaces with clear rates, fast booking, and host-level privacy.',
    bullets: [
      'The #1 production market in the world — crew, gear, and talent all local',
      'Diverse locations from beach to desert to hillside in one metropolitan area',
      'Year-round filming weather with 300+ sunny days per year',
    ],
    propertyTypes: ['Hillside estates', 'Beach homes', 'Modern villas', 'Urban lofts', 'Studio-adjacent homes', 'Luxury penthouses'],
    incentives: 'California Film & Television Tax Credit: 20–25% on qualifying production spend. Apply through the CA Film Commission.',
  },
  'atlanta': {
    label: 'Atlanta',
    state: 'GA',
    headline: 'Production locations in Atlanta',
    description: 'Atlanta is one of the fastest-growing production markets in the US. Find design-forward homes, studios, and event spaces for film, photo shoots, and crew stays.',
    bullets: [
      '#2 production market in the US — home to major studios and soundstages',
      "Georgia's 30% base tax credit attracts major studio and streaming productions",
      'Lower cost of living means more location budget goes further',
    ],
    propertyTypes: ['Historic mansions', 'Suburban estates', 'Urban lofts', 'Industrial studios', 'Modern new builds'],
    incentives: "Georgia Entertainment Industry Investment Act: 30% base tax credit on qualifying Georgia spend. One of the most competitive incentive programs in the US.",
  },
  'new-york': {
    label: 'New York City',
    state: 'NY',
    headline: 'Production locations in New York City',
    description: 'NYC lofts, penthouses, and brownstones built for production. Browse spaces in Manhattan, Brooklyn, and beyond — curated for shoots that need character, privacy, and logistics.',
    bullets: [
      'Unmatched visual diversity — every neighborhood tells a different story',
      'Deep local crew base and world-class production infrastructure',
      "NY Empire State Film Production Credit covers 25–35% of qualifying expenses",
    ],
    propertyTypes: ['Brownstones', 'Industrial lofts', 'Penthouses', 'Townhouses', 'Warehouse spaces', 'Rooftop terraces'],
    incentives: 'New York State Empire State Film Production Credit: 25–35% on qualifying NY production costs. Apply through Empire State Development.',
  },
  'austin': {
    label: 'Austin',
    state: 'TX',
    headline: 'Production locations in Austin',
    description: "Austin's creative scene demands spaces that match. From Hill Country ranches to downtown studios, find production-ready locations with transparent pricing and fast booking.",
    bullets: [
      'Fast-growing creative hub with world-class music, tech, and film communities',
      'Hill Country provides dramatic landscapes within an hour of downtown',
      'Private property filming generally requires no city permit — more flexibility',
    ],
    propertyTypes: ['Hill Country ranches', 'Modern downtown studios', 'Lakefront estates', 'Mid-century homes', 'Creative lofts'],
    incentives: 'Texas Film Commission incentives available on qualifying productions. No state income tax is an additional financial benefit.',
  },
  'miami': {
    label: 'Miami',
    state: 'FL',
    headline: 'Production locations in Miami',
    description: "Miami's light, architecture, and energy make it a premier production destination. Browse oceanfront estates, modern villas, and rooftop studios across Brickell, Wynwood, and the Beach.",
    bullets: [
      'World-class natural light and year-round tropical weather',
      'Iconic Art Deco, Mediterranean Revival, and ultra-modern architecture',
      'International appeal — locations that read as multiple global destinations',
    ],
    propertyTypes: ['Oceanfront estates', 'Modern glass villas', 'Art Deco properties', 'Rooftop studios', 'Waterfront mansions'],
    incentives: 'Florida has no state income tax. Miami-Dade Film Commission provides support and coordination for productions of all sizes.',
  },
  'nashville': {
    label: 'Nashville',
    state: 'TN',
    headline: 'Production locations in Nashville',
    description: "Nashville is more than music — it's a booming creative hub. Find distinctive homes, industrial lofts, and event spaces for film, brand shoots, and crew accommodations.",
    bullets: [
      'Booming creative economy with strong music, entertainment, and tech industries',
      "Tennessee's 25% incentive program applies to qualifying productions",
      'Less permit competition and lower costs than LA, NYC, or Atlanta',
    ],
    propertyTypes: ['Farmhouses', 'Industrial lofts', 'Modern mansions', 'Music-connected venues', 'Event spaces'],
    incentives: "Tennessee Film, Entertainment & Music Commission: 25% incentive on qualifying Tennessee spend. Music industry connections make Nashville ideal for music video productions.",
  },
  'new-orleans': {
    label: 'New Orleans',
    state: 'LA',
    headline: 'Production locations in New Orleans',
    description: "The Big Easy offers unmatched architectural diversity — from French Quarter balconies to Garden District grandeur. One of the most film-active cities in the country.",
    bullets: [
      'Louisiana Entertainment tax credit 25–40% — among the best incentives in the US',
      'Unique architecture found nowhere else: French Quarter, Garden District, shotgun houses',
      'Active year-round production market with deep local crew base',
    ],
    propertyTypes: ['Antebellum mansions', 'French Quarter apartments', 'Garden District estates', 'Bayou retreats', 'Creole cottages'],
    incentives: 'Louisiana Entertainment tax credit: 25–40% on qualifying production spend. Apply through the Louisiana Entertainment office. One of the most generous programs in the nation.',
  },
  'albuquerque': {
    label: 'Albuquerque',
    state: 'NM',
    headline: 'Production locations in Albuquerque',
    description: "Breaking Bad territory and Netflix's growing Southwest hub. Desert landscapes, adobe architecture, and some of the most generous film incentives in the country.",
    bullets: [
      'New Mexico 25–40% film tax rebate — Netflix and major studios film here consistently',
      'Dramatic desert landscapes, mesa formations, and Southwestern architecture',
      'Lower production costs and growing local crew base',
    ],
    propertyTypes: ['Adobe homes', 'Desert estates', 'Pueblo-style properties', 'Ranch spreads', 'Urban lofts'],
    incentives: 'New Mexico Film Production Tax Credit: 25–40% refundable tax rebate on qualifying NM expenditures. One of the most competitive programs in the US.',
  },
  'santa-fe': {
    label: 'Santa Fe',
    state: 'NM',
    headline: 'Production locations in Santa Fe',
    description: "The art capital of the Southwest. Adobe homes, galleries, and mountain views make Santa Fe a distinctive and compelling production backdrop.",
    bullets: [
      'New Mexico 25–40% film tax rebate applies to Santa Fe productions',
      'World-renowned art scene — galleries, museums, and unique creative spaces',
      'Stunning Sangre de Cristo mountain views and high desert light',
    ],
    propertyTypes: ['Adobe homes', 'Artist studios', 'Gallery spaces', 'Mountain retreats', 'Historic haciendas'],
    incentives: 'New Mexico Film Production Tax Credit: 25–40% refundable tax rebate on qualifying NM expenditures. Apply through the New Mexico Film Office.',
  },
  'pittsburgh': {
    label: 'Pittsburgh',
    state: 'PA',
    headline: 'Production locations in Pittsburgh',
    description: "Steel City renaissance. Industrial chic meets historic charm in a city that's increasingly attracting major film and TV productions.",
    bullets: [
      'Pennsylvania 25% tax credit on qualifying PA production spend',
      'Industrial warehouses, iconic bridges, and a dramatic skyline unlike anywhere else',
      'Lower costs than NYC or LA with strong university and tech scenes',
    ],
    propertyTypes: ['Industrial warehouses', 'Victorian mansions', 'Modern lofts', 'Riverfront properties', 'Historic row houses'],
    incentives: 'Pennsylvania Film Production Tax Credit: 25% on qualifying Pennsylvania expenditures. Apply through the PA Film Office.',
  },
  'detroit': {
    label: 'Detroit',
    state: 'MI',
    headline: 'Production locations in Detroit',
    description: "Gritty, authentic, and affordable. Detroit's warehouses, mansions, and urban landscapes offer a raw visual palette that's impossible to replicate on a soundstage.",
    bullets: [
      'Michigan 25% film incentive on qualifying Michigan spend',
      'Dramatically lower production costs than other major markets',
      'Iconic urban landscapes — from Art Deco mansions to vast industrial spaces',
    ],
    propertyTypes: ['Art Deco mansions', 'Industrial warehouses', 'Modern lofts', 'Urban estates', 'Midcentury homes'],
    incentives: 'Michigan Film and Digital Media Production Incentive: 25% on qualifying Michigan expenditures. Contact the Michigan Film Office for current program details.',
  },
  'savannah': {
    label: 'Savannah',
    state: 'GA',
    headline: 'Production locations in Savannah',
    description: "Historic squares, Spanish moss, and antebellum architecture — at a fraction of Atlanta's cost. Savannah is Georgia's most visually distinctive filming market.",
    bullets: [
      "Georgia's 30% base tax credit applies to Savannah productions",
      'Stunning antebellum architecture and Spanish moss-draped squares',
      'Lower production costs than Atlanta with equally strong Georgia incentives',
    ],
    propertyTypes: ['Antebellum mansions', 'Historic townhouses', 'Coastal estates', 'Garden homes', 'Waterfront properties'],
    incentives: 'Georgia Entertainment Industry Investment Act: 30% base tax credit on qualifying Georgia spend — same program as Atlanta, lower costs.',
  },
  'honolulu': {
    label: 'Honolulu',
    state: 'HI',
    headline: 'Production locations in Honolulu',
    description: "Paradise locations. Beach estates, tropical gardens, and ocean views — Hawaii's unique beauty has anchored productions from blockbusters to major brand campaigns.",
    bullets: [
      "Hawaii Film Production Tax Credit: 20–22% on qualifying Hawaii expenditures",
      'Breathtaking tropical landscapes, beaches, and volcanic terrain found nowhere else',
      'Year-round production-friendly weather with minimal rain on the leeward coast',
    ],
    propertyTypes: ['Beachfront estates', 'Tropical villas', 'Ocean-view homes', 'Resort properties', 'Tropical gardens'],
    incentives: 'Hawaii Film Production Tax Credit: 20% on Oahu, 22% on neighbor islands. Apply through the Hawaii Film Office.',
  },
  'salt-lake-city': {
    label: 'Salt Lake City',
    state: 'UT',
    headline: 'Production locations in Salt Lake City',
    description: "Mountain backdrop, outdoor adventure, and clean modern spaces. Salt Lake City offers dramatic natural scenery within minutes of urban production infrastructure.",
    bullets: [
      'Utah Motion Picture Incentive Program: up to 25% cash rebate on qualifying spend',
      'Dramatic mountain landscapes and outdoor terrain within 30 minutes of the city',
      'Lower production costs and growing film-friendly infrastructure',
    ],
    propertyTypes: ['Mountain cabins', 'Modern homes', 'Ranch estates', 'Urban lofts', 'Ski retreat properties'],
    incentives: 'Utah Motion Picture Incentive Program: 20–25% cash rebate on qualifying Utah expenditures. Apply through the Utah Film Commission.',
  },
  'portland': {
    label: 'Portland',
    state: 'OR',
    headline: 'Production locations in Portland',
    description: "Eclectic, creative, and distinctly Pacific Northwest. Portland's lofts, craftsman homes, and unique venues deliver visual character that's hard to fake.",
    bullets: [
      'Oregon Production Investment Fund: 20% cash rebate on qualifying Oregon spend',
      'Unique eclectic architecture — craftsman homes, industrial conversions, creative lofts',
      'Green, lush backdrops and dramatic Pacific Northwest scenery nearby',
    ],
    propertyTypes: ['Craftsman homes', 'Industrial lofts', 'Converted warehouses', 'Modern homes', 'Creative studios'],
    incentives: 'Oregon Production Investment Fund: 20% cash rebate on qualifying Oregon expenditures. Apply through Oregon Film.',
  },
  'seattle': {
    label: 'Seattle',
    state: 'WA',
    headline: 'Production locations in Seattle',
    description: "Pacific Northwest beauty meets tech-world sophistication. Seattle's modern architecture, waterfront views, and lush surroundings create a compelling visual backdrop.",
    bullets: [
      'Washington State Motion Picture Competitiveness Program incentives available',
      'Stunning waterfront, mountain views, and Pacific Northwest architecture',
      'Tech-meets-nature aesthetic with strong production infrastructure',
    ],
    propertyTypes: ['Waterfront homes', 'Modern architecture', 'Pacific Northwest cabins', 'Urban lofts', 'Hillside estates'],
    incentives: 'Washington State Motion Picture Competitiveness Program provides incentives for qualifying productions. Contact the Washington Filmworks office for current program details.',
  },
  'san-francisco': {
    label: 'San Francisco',
    state: 'CA',
    headline: 'Production locations in San Francisco',
    description: "Iconic views, Victorian homes, and urban sophistication. San Francisco's visual diversity — from the Golden Gate to the Mission — makes it endlessly compelling on screen.",
    bullets: [
      'Instantly recognizable skyline, bridges, and neighborhoods',
      'Victorian architecture (Painted Ladies, Edwardians) alongside modern glass towers',
      'California Film & Television Tax Credit applies to qualifying SF productions',
    ],
    propertyTypes: ['Victorian homes', 'Modern penthouses', 'Urban lofts', 'Bay-view estates', 'Edwardian townhouses'],
    incentives: 'California Film & Television Tax Credit: 20–25% on qualifying production spend. Apply through the CA Film Commission.',
  },
  'chicago': {
    label: 'Chicago',
    state: 'IL',
    headline: 'Production locations in Chicago',
    description: "Architecture capital of America. Chicago's lofts, rooftops, and lakefront estates offer a cinematic scale that competes with any city in the country.",
    bullets: [
      'Illinois Film Tax Credit: 30% on qualifying Illinois expenditures — among the best in the Midwest',
      'World-class architecture spanning every era from industrial to ultra-modern',
      'Strong local crew base and full-service production infrastructure',
    ],
    propertyTypes: ['Rooftop spaces', 'Industrial lofts', 'Lakefront estates', 'Historic brownstones', 'Gold Coast mansions'],
    incentives: 'Illinois Film Services Tax Credit: 30% on qualifying Illinois production expenditures. Apply through the Illinois Film Office.',
  },
  'wilmington': {
    label: 'Wilmington',
    state: 'NC',
    headline: 'Production locations in Wilmington',
    description: "Home to Screen Gems Studios — the largest studio outside of LA. Wilmington combines professional production infrastructure with coastal Southern charm.",
    bullets: [
      'North Carolina Film Grant: 25% on qualifying NC spend — active production market',
      'Screen Gems Studios provides world-class soundstage infrastructure',
      'Beach locations, antebellum homes, and Southern character within one city',
    ],
    propertyTypes: ['Beach estates', 'Antebellum homes', 'Waterfront properties', 'Studio-adjacent homes', 'Historic houses'],
    incentives: 'North Carolina Film Grant: 25% on qualifying North Carolina expenditures. Apply through the NC Film Office.',
  },
  'oklahoma-city': {
    label: 'Oklahoma City',
    state: 'OK',
    headline: 'Production locations in Oklahoma City',
    description: "New incentives, ranch estates, and wide open spaces. Oklahoma City is an emerging production market with some of the most compelling incentives in the country.",
    bullets: [
      'Oklahoma Film Enhancement Rebate: up to 37% on qualifying Oklahoma expenses — one of the highest in the US',
      'Vast ranch estates, prairie landscapes, and open spaces unique to the region',
      'Dramatically lower production costs than coastal markets',
    ],
    propertyTypes: ['Ranch estates', 'Prairie homes', 'Urban spaces', 'Industrial buildings', 'Western properties'],
    incentives: 'Oklahoma Film Enhancement Rebate: 37% on qualifying Oklahoma expenditures — one of the highest rebate programs in the country. Apply through the Oklahoma Film + Music Office.',
  },
  'philadelphia': {
    label: 'Philadelphia',
    state: 'PA',
    headline: 'Production locations in Philadelphia',
    description: "Historic brownstones, industrial spaces, and East Coast character. Philadelphia delivers the urban grit and historic richness of NYC at a fraction of the cost.",
    bullets: [
      'Pennsylvania 25% tax credit on qualifying PA production spend',
      'Iconic historic architecture — brownstones, row houses, and Independence-era buildings',
      'Lower costs than NYC with easy access to the same East Coast talent pool',
    ],
    propertyTypes: ['Historic brownstones', 'Industrial spaces', 'Row houses', 'Modern lofts', 'University-area homes'],
    incentives: 'Pennsylvania Film Production Tax Credit: 25% on qualifying Pennsylvania expenditures. Apply through the PA Film Office.',
  },
  'denver': {
    label: 'Denver',
    state: 'CO',
    headline: 'Production locations in Denver',
    description: "Mountain modern at its finest. Denver blends outdoor grandeur with urban sophistication — ranch properties, modern lofts, and dramatic Rocky Mountain backdrops.",
    bullets: [
      'Colorado Film Incentives Program provides support for qualifying productions',
      'Stunning Rocky Mountain backdrops accessible within 45 minutes of downtown',
      'Mountain-modern architecture — a unique aesthetic blend of rustic and contemporary',
    ],
    propertyTypes: ['Mountain ranches', 'Modern lofts', 'Urban spaces', 'Mountain cabins', 'Ski-adjacent properties'],
    incentives: 'Colorado Film Incentives Program provides rebates and incentives for qualifying productions. Contact the Colorado Office of Film, Television and Media for current program details.',
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
    twitter: {
      card: 'summary_large_image',
      title: `${hub.headline} | SetVenue`,
      description: hub.description,
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
          <Link href="/cities" className="inline-flex min-h-[44px] items-center text-sm text-black/60 hover:text-black">
            ← All cities
          </Link>
        </div>

        <section className="overflow-hidden rounded-[30px] border border-black bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[36px]">
          <div className="border-b border-black px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">{hub.label}, {hub.state}</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-black sm:text-5xl lg:text-6xl">
                {hub.headline}
              </h1>
              <p className="mt-5 text-base leading-7 text-black/70 sm:text-lg">{hub.description}</p>
            </div>
          </div>

          <div className="grid gap-0 border-b border-black lg:grid-cols-3">
            <div className="border-b border-black px-5 py-7 sm:px-8 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/50">Why film here</p>
              <ul className="mt-4 space-y-3">
                {hub.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-6 text-black/75">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                      {i + 1}
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-b border-black px-5 py-7 sm:px-8 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/50">Property types</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {hub.propertyTypes.map((type) => (
                  <span key={type} className="inline-flex items-center rounded-full border border-black/12 bg-slate-50 px-3 py-1 text-xs font-medium text-black/70">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="px-5 py-7 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/50">Film incentives</p>
              {hub.incentives ? (
                <p className="mt-4 text-sm leading-6 text-black/75">{hub.incentives}</p>
              ) : (
                <p className="mt-4 text-sm leading-6 text-black/50">Contact the local film office for current incentive information.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 px-5 py-6 sm:flex-row sm:px-8 lg:px-10">
            <Link
              href="/free-listing"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              List Your Property in {hub.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/find-location"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600"
            >
              Find a Location in {hub.label}
            </Link>
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
                  href="/free-listing"
                  className="inline-flex min-h-[48px] items-center rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600"
                >
                  List your property in {hub.label}
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
          <div className="mt-6">
            <Link href="/cities" className="text-sm font-medium text-blue-600 hover:underline">
              View all 22 cities →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
