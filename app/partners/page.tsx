import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, Handshake, Repeat, ShieldCheck, Sparkles, Users, Workflow } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Partner with SetVenue',
  description: 'Partnerships for production companies, talent agencies, and creators who need private, production-ready locations at scale.',
};

type PartnerPageProps = {
  searchParams?: Promise<{
    sent?: string;
  }>;
};

const partnerTypes = [
  {
    title: 'Production companies',
    description: 'For teams booking multiple shoot days, scouting across several cities, or needing a faster repeatable workflow.',
    icon: Building2,
  },
  {
    title: 'Talent agencies',
    description: 'For agencies coordinating recurring creator, campaign, and client shoots that need dependable location options.',
    icon: Users,
  },
  {
    title: 'Individual creators',
    description: 'For influencers and content teams who want elevated spaces, quicker booking paths, and better discretion.',
    icon: Sparkles,
  },
];

const benefits = [
  {
    title: 'Volume-friendly booking support',
    description: 'Create a cleaner path for repeat bookings, multi-day productions, and location shortlists that move faster.',
    icon: Repeat,
  },
  {
    title: 'Private, production-ready inventory',
    description: 'Access curated homes, lofts, studios, and specialty spaces that fit privacy-sensitive productions.',
    icon: ShieldCheck,
  },
  {
    title: 'Workflow and API access',
    description: 'Qualified partners can discuss API and operational integrations for internal sourcing, scouting, and booking workflows.',
    icon: Workflow,
  },
  {
    title: 'Strategic partnership support',
    description: 'Explore co-marketing, preferred partner relationships, and custom account support for recurring teams.',
    icon: Handshake,
  },
];

const apiPoints = [
  'Partner API access is available by request for qualified teams.',
  'Intended use cases include location discovery, availability syncing, partner referrals, and internal workflow integrations.',
  'Access is reviewed case-by-case to protect host privacy, listing quality, and platform integrity.',
];

export default async function PartnersPage({ searchParams }: PartnerPageProps) {
  const params = (await searchParams) ?? {};
  const isSent = params.sent === '1';

  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[36px] border border-black bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Partner with SetVenue</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl lg:text-6xl">
                A cleaner location pipeline for teams that book often.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-black/72 sm:text-lg">
                SetVenue works with production companies, talent agencies, and creators who need private, production-ready spaces without the usual marketplace noise. If your team books repeatedly, we can explore a more structured partnership.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#partner-form" className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
                  Start a partnership conversation
                </a>
                <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600">
                  General contact
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-black bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Best fit</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[22px] border border-black bg-[#FAFAFA] p-4">
                  <p className="text-base font-semibold text-black">High-volume production teams</p>
                  <p className="mt-2 text-sm leading-7 text-black/68">Recurring bookings, city-by-city scouting, or repeat campaign work.</p>
                </div>
                <div className="rounded-[22px] border border-black bg-[#FAFAFA] p-4">
                  <p className="text-base font-semibold text-black">Agency-led creator programs</p>
                  <p className="mt-2 text-sm leading-7 text-black/68">Reliable location sourcing for creator shoots, campaign content, and talent logistics.</p>
                </div>
                <div className="rounded-[22px] border border-black bg-[#FAFAFA] p-4">
                  <p className="text-base font-semibold text-black">Integration-minded operators</p>
                  <p className="mt-2 text-sm leading-7 text-black/68">Teams that want API discussions, referral pathways, or custom account support.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {partnerTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.title} className="rounded-[30px] border border-black bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500 bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-black">{type.title}</h2>
                <p className="mt-3 text-base leading-7 text-black/72">{type.description}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-[32px] border border-black bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Why partner</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-black sm:text-4xl">Built for recurring production needs, not one-off luck.</h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="rounded-[24px] border border-black bg-[#FAFAFA] p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500 bg-white text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-black">{benefit.title}</h3>
                  <p className="mt-3 text-base leading-7 text-black/72">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-black bg-[#FAFAFA] p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">API access</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-black">Operational access for qualified partners.</h2>
            <p className="mt-5 text-base leading-8 text-black/72">
              We can support partnership conversations around API access and workflow integrations when there is a clear business case, strong usage pattern, and privacy-safe implementation plan.
            </p>
            <ul className="mt-6 space-y-3">
              {apiPoints.map((point) => (
                <li key={point} className="flex gap-3 rounded-[22px] border border-black bg-white px-4 py-4 text-sm leading-7 text-black/72">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <section id="partner-form" className="rounded-[32px] border border-black bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">Tell us about your team</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-black/70">
              This is a partnership intake form only. It can be connected to a backend or CRM later.
            </p>

            <form action="/partners" method="GET" className="mt-8 space-y-5">
              <input type="hidden" name="sent" value="1" />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-black">Name</label>
                  <input id="name" name="name" type="text" placeholder="Your name" required className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-black outline-none placeholder:text-black/40 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="company" className="mb-2 block text-sm font-medium text-black">Company</label>
                  <input id="company" name="company" type="text" placeholder="Company or agency name" required className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-black outline-none placeholder:text-black/40 focus:border-blue-500" />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-black">Work email</label>
                  <input id="email" name="email" type="email" placeholder="you@company.com" required className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-black outline-none placeholder:text-black/40 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="partnerType" className="mb-2 block text-sm font-medium text-black">Partner type</label>
                  <select id="partnerType" name="partnerType" defaultValue="" required className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-black outline-none focus:border-blue-500">
                    <option value="" disabled>
                      Select one
                    </option>
                    <option value="production-company">Production company</option>
                    <option value="talent-agency">Talent agency</option>
                    <option value="content-creator">Individual creator</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="volume" className="mb-2 block text-sm font-medium text-black">Estimated booking volume</label>
                  <input id="volume" name="volume" type="text" placeholder="e.g. 3-5 shoots/month" className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-black outline-none placeholder:text-black/40 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="apiInterest" className="mb-2 block text-sm font-medium text-black">API interest</label>
                  <select id="apiInterest" name="apiInterest" defaultValue="" className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-black outline-none focus:border-blue-500">
                    <option value="">Not sure yet</option>
                    <option value="yes">Yes, we'd like to discuss API access</option>
                    <option value="no">No, standard partnership only</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-black">Partnership goals</label>
                <textarea id="message" name="message" rows={7} placeholder="Tell us what you're booking, how often, what markets matter, and whether you want referral or API discussions." required className="w-full rounded-[24px] border border-black bg-white px-4 py-3 text-black outline-none placeholder:text-black/40 focus:border-blue-500" />
              </div>

              {isSent ? (
                <div className="rounded-[24px] border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700">
                  Partnership inquiry captured. Follow-up messaging can be wired to your backend later.
                </div>
              ) : null}

              <button type="submit" className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
                Submit partnership inquiry
              </button>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}
