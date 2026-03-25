import type { Metadata } from 'next';
import { CheckCircle2, ExternalLink, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Insurance Requirements | SetVenue',
  description: 'Production insurance requirements, partner links, and FAQ for producers booking through SetVenue.',
};

const faqs = [
  {
    question: 'Why do I need production insurance?',
    answer: 'Production insurance protects everyone. It helps cover liability exposure, property damage, and the kinds of on-set surprises that can turn a normal booking into a mess fast.',
  },
  {
    question: 'What coverage minimum do you require?',
    answer: 'Minimum $1M general liability required. Some hosts or higher-risk productions may require more, but $1M is the baseline for the current workflow.',
  },
  {
    question: 'Can I book without uploading a certificate right away?',
    answer: 'For now, yes. You can continue through the booking flow and use a partner link if you need same-day coverage. Verification can get stricter later.',
  },
  {
    question: 'What file format should I upload?',
    answer: 'PDF only for now. A certificate of insurance or general liability proof is the simplest starting point.',
  },
];

export default function InsurancePage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[36px] border border-black bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Insurance</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl lg:text-6xl">
            Insurance keeps the booking clean before anything gets expensive.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-black/72 sm:text-lg">
            Production insurance protects everyone. SetVenue currently asks producers to carry at least <span className="font-semibold text-black">$1M general liability</span> coverage before or during the booking process.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book/insurance" className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
              Go to insurance step
            </Link>
            <Link href="/locations" className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600">
              Browse locations
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            'Minimum $1M general liability required',
            'PDF certificate upload supported now',
            'Short-term partner coverage available if you need it fast',
          ].map((item) => (
            <div key={item} className="rounded-[28px] border border-black bg-[#fafafa] p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-600" />
                <p className="text-base leading-7 text-black/75">{item}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[32px] border border-black bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <Shield className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Coverage partners</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black">Don’t have insurance? Get instant coverage in minutes.</h2>
                <p className="mt-4 text-base leading-8 text-black/72">These are simple starting points for on-demand production coverage. Links open in a new tab.</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <a href="https://www.thimble.com" target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-4 rounded-[24px] border border-black bg-[#fafafa] p-5 transition hover:border-blue-500 hover:bg-blue-50">
                <div>
                  <p className="text-lg font-semibold text-black">Thimble</p>
                  <p className="mt-2 text-sm leading-6 text-black/65">On-demand production insurance with a fast online purchase flow for short-term needs.</p>
                </div>
                <ExternalLink className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
              </a>

              <a href="https://produce911.com" target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-4 rounded-[24px] border border-black bg-[#fafafa] p-5 transition hover:border-blue-500 hover:bg-blue-50">
                <div>
                  <p className="text-lg font-semibold text-black">Produce911</p>
                  <p className="mt-2 text-sm leading-6 text-black/65">Short-term production coverage aimed at crews that need quick proof of insurance before a shoot.</p>
                </div>
                <ExternalLink className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
              </a>
            </div>
          </div>

          <div className="rounded-[32px] border border-black bg-[#fafafa] p-8">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">What hosts care about</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black">Fewer surprises. Cleaner trust.</h2>
                <div className="mt-6 space-y-4 text-base leading-8 text-black/72">
                  <p>Insurance is one of the simplest signals that a producer is serious, organized, and not treating the property like a disposable set.</p>
                  <p>It also reduces friction when a host is deciding whether to approve a booking for a private or higher-risk production.</p>
                  <p>The current flow is intentionally simple: upload a PDF now, verify more deeply later.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-black bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">FAQ</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-[24px] border border-black bg-[#fafafa] p-5">
                <h3 className="text-lg font-semibold text-black">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-black/68">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
