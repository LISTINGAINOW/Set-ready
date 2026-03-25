import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works | SetVenue',
  description: 'How booking works on SetVenue from browsing to payment and production day.',
};

const steps = [
  {
    step: 'Step 1',
    title: 'Browse locations',
    description: 'Search by city, property type, price, and privacy tier to find spaces that fit your shoot and your level of discretion.',
  },
  {
    step: 'Step 2',
    title: 'Check availability',
    description: 'Review listing details, booking minimums, and available dates. For tighter privacy tiers, some details unlock later in the inquiry process.',
  },
  {
    step: 'Step 3',
    title: 'Insurance',
    description: 'Upload a PDF certificate or use a partner link for short-term coverage. Minimum $1M general liability required before the booking is fully buttoned up.',
  },
  {
    step: 'Step 4',
    title: 'Confirm booking',
    description: 'Review the final booking details, host contact info, and next steps once the request is approved and the insurance checkpoint is handled.',
  },
  {
    step: 'Step 5',
    title: 'Create',
    description: 'Show up with the right expectations, follow the house rules, and use a location that was actually built for your production needs.',
  }
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[36px] border border-black bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">How it works</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl lg:text-6xl">
            Straightforward booking for a category that usually isn’t.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-black/72 sm:text-lg">
            SetVenue is meant to compress the scouting process without flattening the privacy needs that make this market different.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {steps.map((item) => (
            <div key={item.step} className="rounded-[30px] border border-black bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">{item.step}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-black">{item.title}</h2>
              <p className="mt-4 text-base leading-8 text-black/72">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[32px] border border-black bg-[#FAFAFA] p-8 sm:p-10">
          <h2 className="text-3xl font-semibold tracking-[-0.05em] text-black">What stays consistent</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              'Transparent hourly pricing and booking minimums',
              'Privacy tiers that explain what gets shared and when',
              'A cleaner path from scouting to confirmed production day',
            ].map((point) => (
              <div key={point} className="rounded-[24px] border border-black bg-white p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-600" />
                  <p className="text-base leading-7 text-black/75">{point}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/locations" className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
              Browse locations
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/list-property" className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600">
              List your property
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
