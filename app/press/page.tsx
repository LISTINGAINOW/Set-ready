import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Download, ImageIcon, Mail, Newspaper, ShieldCheck, UserRound } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Press | SetVenue',
  description: 'Press resources, company information, founder background, and media contacts for SetVenue.',
};

const highlights = [
  {
    title: 'Privacy-first marketplace',
    description: 'SetVenue is built for productions that need a more controlled and privacy-conscious location booking process.',
    icon: ShieldCheck,
  },
  {
    title: 'Creator-focused workflow',
    description: 'The platform supports creators, producers, and small teams who need to source viable locations without unnecessary friction.',
    icon: Newspaper,
  },
  {
    title: 'Professional production-ready positioning',
    description: 'The brand and product are designed for a category that is often underserved by generic marketplaces.',
    icon: ImageIcon,
  },
];

const mediaAssets = [
  'Primary logo pack (placeholder)',
  'Monochrome logo pack (placeholder)',
  'Homepage screenshots (placeholder)',
  'Product UI screenshots (placeholder)',
  'Founder headshot (placeholder)',
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[36px] border border-black bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Press</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl lg:text-6xl">
            Resources for media covering SetVenue.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-black/72 sm:text-lg">
            SetVenue is a production marketplace built for producers, creators, and hosts who need a streamlined way to book locations, stays, and events.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="mailto:press@setvenue.com"
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Contact press team
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600"
            >
              General contact
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-black bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Company overview</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-black">A marketplace built for productions.</h2>
            <p className="mt-5 text-base leading-8 text-black/72">
              SetVenue helps producers, filmmakers, and event planners find and book locations, crew stays, and event venues. The platform is designed around real production workflows, with an emphasis on clarity, speed, and better host control.
            </p>
            <p className="mt-5 text-base leading-8 text-black/72">
              Rather than juggling multiple platforms for locations, housing, and events, SetVenue offers one unified marketplace for everything a production team needs.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[24px] border border-black bg-[#FAFAFA] p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500 bg-white text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-black">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-black/72">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-black bg-[#FAFAFA] p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Founder bio</p>
            <div className="mt-4 flex items-center gap-3 text-black">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black bg-white">
                <UserRound className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-black">[Founder Name Placeholder]</h2>
                <p className="text-sm text-black/65">Founder, SetVenue</p>
              </div>
            </div>
            <p className="mt-5 text-base leading-8 text-black/72">
              [Founder Name Placeholder] built SetVenue after seeing how production teams struggled with multiple platforms for locations, housing, and events — none designed specifically for production workflows.
            </p>
            <p className="mt-5 text-base leading-8 text-black/72">
              The founder story centers on building a marketplace that treats production needs — speed, reliability, clear pricing — as core product requirements instead of afterthoughts.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-black bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-10">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Media assets</p>
            </div>
            <p className="mt-4 text-base leading-8 text-black/72">
              Approved logos, product screenshots, and founder assets can be made available for media use. Replace the placeholders below with downloadable files before launch.
            </p>
            <div className="mt-6 space-y-3">
              {mediaAssets.map((asset) => (
                <div key={asset} className="rounded-[20px] border border-black bg-[#FAFAFA] px-5 py-4 text-sm text-black/75">
                  {asset}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-black bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-10">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Press inquiries</p>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-black">Need background, assets, or a quote?</h2>
            <p className="mt-5 text-base leading-8 text-black/72">
              For interviews, launch coverage, founder commentary, or image requests, contact the SetVenue press team.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-black bg-[#FAFAFA] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Email</p>
                <p className="mt-2 text-base font-semibold text-black">press@setvenue.com</p>
              </div>
              <div className="rounded-[24px] border border-black bg-[#FAFAFA] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Contact name</p>
                <p className="mt-2 text-base font-semibold text-black">[Press Contact Placeholder]</p>
              </div>
              <div className="rounded-[24px] border border-black bg-[#FAFAFA] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Press kit URL</p>
                <p className="mt-2 text-base font-semibold text-black">[Press Kit URL Placeholder]</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
