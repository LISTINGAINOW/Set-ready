import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ExternalLink, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Film Permit Guides by City',
  description: 'City-specific filming permit guides for Los Angeles, Atlanta, New York, Austin, Miami, Nashville, New Orleans, and more. Know the rules before you book.',
};

const cities = [
  {
    name: 'Los Angeles',
    state: 'CA',
    emoji: '🎬',
    authority: 'FilmLA',
    authorityUrl: 'https://www.filmla.com',
    highlights: [
      'FilmLA is the one-stop permit office for the City and County of LA',
      'Permits required for most commercial filming on public and private property',
      'Standard permit: $625 for the first day of filming',
      'Apply at least 5 business days in advance',
      'Residential areas have additional neighbor notification requirements',
    ],
    tip: 'LA is the most permit-intensive market. Budget extra lead time and budget for the $625 base fee.',
    color: 'blue',
  },
  {
    name: 'Atlanta',
    state: 'GA',
    emoji: '🎥',
    authority: 'City of Atlanta Office of Film & Entertainment',
    authorityUrl: null,
    highlights: [
      'Georgia Film Office oversees statewide film activity',
      'City permits handled through Atlanta\'s Office of Film & Entertainment',
      'Georgia\'s 30% tax credit makes it the #2 filming market in the US',
      'Permit costs typically $100–$500 depending on scope and location',
    ],
    tip: "Georgia's tax incentives are unbeatable. Plan early — Atlanta productions are booking fast.",
    color: 'slate',
  },
  {
    name: 'New York City',
    state: 'NY',
    emoji: '🗽',
    authority: "Mayor's Office of Media and Entertainment (MOME)",
    authorityUrl: null,
    highlights: [
      "Managed by NYC's Mayor's Office of Media and Entertainment (MOME)",
      'Free permits for most filming on public property',
      'Apply at least 5 business days before your shoot date',
      'Each borough (Manhattan, Brooklyn, Queens, Bronx, Staten Island) has specific rules',
    ],
    tip: 'NYC permits are free but logistics are complex. Parking, noise ordinances, and neighbor relations require careful planning.',
    color: 'slate',
  },
  {
    name: 'Austin',
    state: 'TX',
    emoji: '🤠',
    authority: 'Austin Film Commission',
    authorityUrl: null,
    highlights: [
      'Austin Film Commission handles all city permitting inquiries',
      'Permits required for commercial filming on public property',
      'Private property filming generally does not require a city permit',
      'Texas has no state income tax — a significant production incentive',
    ],
    tip: "Austin's private property rules give you more flexibility than most major markets. Great for scout-and-go productions.",
    color: 'slate',
  },
  {
    name: 'Miami',
    state: 'FL',
    emoji: '🌴',
    authority: 'Miami-Dade Film Commission',
    authorityUrl: null,
    highlights: [
      'Miami-Dade Film Commission coordinates all film permits',
      'Permits required for filming in public spaces throughout the county',
      'Apply 5–10 business days in advance',
      'Beach and waterfront locations require additional permits from Parks & Recreation',
    ],
    tip: 'Weather is your biggest wildcard in Miami. Build buffer days into your schedule.',
    color: 'slate',
  },
  {
    name: 'Nashville',
    state: 'TN',
    emoji: '🎸',
    authority: 'Nashville Film Office',
    authorityUrl: null,
    highlights: [
      'Nashville Film Office is the single point of contact for city permits',
      'Permits required for filming on public property in Davidson County',
      "Tennessee's 25% incentive program applies to qualifying productions",
      'Music industry ties make Nashville uniquely well-equipped for music video shoots',
    ],
    tip: 'Nashville is an underrated filming market. Less competition for permits, strong local crew base.',
    color: 'slate',
  },
  {
    name: 'New Orleans',
    state: 'LA',
    emoji: '🎷',
    authority: 'Louisiana Entertainment Office',
    authorityUrl: null,
    highlights: [
      'Louisiana Entertainment Office administers permits and incentives statewide',
      'Louisiana Entertainment tax credit: 25–40% on qualifying production spend',
      'One of the most generous film incentive programs in the United States',
      'Permits for filming on public property managed through the City of New Orleans',
      'Historic districts (French Quarter, Garden District) may have additional requirements',
    ],
    tip: "Louisiana's 25–40% tax credit is among the best in the country. Apply through the Louisiana Entertainment office well in advance — productions book fast.",
    color: 'slate',
  },
];

export default function PermitsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <MapPin className="h-3.5 w-3.5" />
            Permit Guides
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Film Permit Guides by City
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-500 sm:text-xl">
            Know the rules before you book.
          </p>
        </div>
      </section>

      {/* City Sections */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {cities.map((city) => (
            <div
              key={city.name}
              className="flex flex-col rounded-[32px] border border-black/8 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{city.emoji}</span>
                    <h2 className="text-xl font-bold text-slate-950">
                      {city.name}
                      <span className="ml-2 text-base font-normal text-slate-400">{city.state}</span>
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {city.authorityUrl ? (
                      <a
                        href={city.authorityUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        {city.authority}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      city.authority
                    )}
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-2.5">
                {city.highlights.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-slate-100 text-center text-xs font-semibold leading-5 text-slate-500">
                      {i + 1}
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                <p className="text-sm font-medium text-blue-800">
                  <span className="font-semibold">Pro tip: </span>
                  {city.tip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-black/6 bg-slate-50 px-8 py-12 text-center">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">This is general guidance.</span>{' '}
            Always verify with your local film office — permit requirements change frequently.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Need help? Use our Location Concierge and we&apos;ll help navigate permits for your specific shoot.
          </p>
          <Link
            href="/find-location"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-slate-950 px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Talk to a Location Concierge
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
