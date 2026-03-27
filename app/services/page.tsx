import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, Home, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Production Services | SetVenue',
  description: 'More than a marketplace. SetVenue helps productions find the perfect space with our Location Concierge, Crew Housing bundles, and Permit Guidance.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Production Services | SetVenue',
    description: 'Location Concierge, Crew Housing bundles, and Permit Guidance — all in one place.',
    url: 'https://setvenue.com/services',
    type: 'website',
  },
};

const services = [
  {
    icon: MapPin,
    title: 'Location Concierge',
    tagline: 'Tell us what you need. We personally match you with 3–5 properties within 24 hours.',
    body: 'No browsing. No guessing. Just the right space for your production.',
    cta: 'Find My Location',
    href: '/find-location',
    accent: 'bg-blue-50 text-blue-600 border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'Most popular',
  },
  {
    icon: Home,
    title: 'Crew Housing',
    tagline: 'Need a place for your team to stay during extended shoots? We bundle location rentals with nearby crew accommodations.',
    body: 'One platform for your shoot location AND crew housing.',
    cta: 'Request Crew Housing',
    href: '/find-location',
    accent: 'bg-slate-50 text-slate-600 border-slate-100',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    badge: null,
  },
  {
    icon: FileText,
    title: 'Permit Guidance',
    tagline: 'Filming permits are complicated. We provide city-specific guides to help you navigate the process.',
    body: 'LA, Atlanta, NYC, Austin, Miami, Nashville — we know the rules.',
    cta: 'View Permit Guides',
    href: '/permits',
    accent: 'bg-slate-50 text-slate-600 border-slate-100',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    badge: null,
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            SetVenue Services
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            More than a marketplace.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-500 sm:text-xl">
            We help productions find the perfect space.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="relative flex flex-col rounded-[32px] border border-black/8 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.05)] transition hover:shadow-[0_24px_70px_rgba(15,23,42,0.09)]"
              >
                {service.badge ? (
                  <span className="absolute right-6 top-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    {service.badge}
                  </span>
                ) : null}

                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${service.iconBg}`}>
                  <Icon className={`h-6 w-6 ${service.iconColor}`} />
                </div>

                <h2 className="text-xl font-bold text-slate-950">{service.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{service.tagline}</p>
                <p className="mt-2 text-sm font-medium text-slate-800">{service.body}</p>

                <div className="mt-auto pt-8">
                  <Link
                    href={service.href}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-blue-600 hover:text-white hover:border-blue-600"
                  >
                    {service.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-slate-200 bg-slate-50 px-8 py-14 text-center shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Ready to find your next location?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
            Tell us what you need and our team will personally curate the best options for your production — within 24 hours.
          </p>
          <Link
            href="/find-location"
            className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Get Started — It&apos;s Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
