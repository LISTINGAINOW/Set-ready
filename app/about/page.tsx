import type { Metadata } from 'next';
import { BadgeCheck, DollarSign, MapPin, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About | SetVenue',
  description: 'SetVenue is a production marketplace for locations, stays, and events. One platform, lower fees.',
};

const values = [
  {
    title: 'One platform, three uses',
    description: 'Locations to shoot, places to stay, venues for events. Book everything in one place instead of juggling multiple platforms.',
    icon: MapPin,
  },
  {
    title: 'Lower fees than competitors',
    description: '10% guest fee vs Giggster\'s 15-25%. We pass the savings directly to production teams. Hosts pay 0%.',
    icon: DollarSign,
  },
  {
    title: 'Production-first design',
    description: 'Built for production workflows — not generic rentals. Features that actually help film teams book faster.',
    icon: BadgeCheck,
  },
  {
    title: 'Built for both sides',
    description: 'Hosts get 0% fees and quality bookings. Production teams get lower costs and better tools. Everyone wins.',
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[36px] border border-black bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">About SetVenue</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl lg:text-6xl">
            Locations. Stays. Events. One platform.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-black/72 sm:text-lg">
            SetVenue is a production marketplace that brings together everything a production team needs — locations to shoot, places for the crew to stay, and venues for events. One platform instead of three.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[32px] border border-black bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">What is SetVenue?</p>
            <p className="mt-4 text-base leading-8 text-black/75">
              A curated marketplace for homes, studios, lofts, warehouses, and venues that are open to productions. Whether you need a location for a film shoot, housing for your crew, or a venue for a wrap party — book it here.
            </p>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Mission</p>
            <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-black">
              Make production bookings simpler and cheaper.
            </p>
            <p className="mt-4 text-base leading-8 text-black/75">
              Production managers shouldn't have to book three different platforms for one project. Hosts shouldn't pay 15-25% in fees. SetVenue fixes both.
            </p>
          </div>

          <div className="rounded-[32px] border border-black bg-[#FAFAFA] p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Team</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-black">Lean team. Production focus.</h2>
            <p className="mt-5 text-base leading-8 text-black/72">
              SetVenue is built by operators who understand production workflows. We know that production managers need speed, clarity, and reliable hosts — not cluttered listings and hidden fees.
            </p>
            <p className="mt-5 text-base leading-8 text-black/72">
              Our goal is simple: be the platform we'd want to use ourselves.
            </p>
          </div>
        </section>

        <section className="rounded-[32px] border border-black bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Why choose SetVenue</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="rounded-[24px] border border-black bg-[#FAFAFA] p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500 bg-white text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-black">{value.title}</h3>
                  <p className="mt-3 text-base leading-7 text-black/72">{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
