import Link from 'next/link';
import { ArrowRight, DollarSign } from 'lucide-react';

export default function FreeListingCTA() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#0f2850_0%,#1d4ed8_100%)] p-8 shadow-[0_24px_70px_rgba(29,78,216,0.25)] sm:p-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">For property owners</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              Own a filmable property?
            </h2>
            <p className="mt-3 text-base leading-7 text-blue-100">
              List for free. Keep 100% of your rental income. We only charge guests 10% — never the host.
            </p>
            <ul className="mt-4 flex flex-wrap gap-3 text-sm font-medium text-blue-100">
              <li className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-blue-300" /> Free to list
              </li>
              <li className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-blue-300" /> 0% host fee
              </li>
              <li className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-blue-300" /> Keep every dollar
              </li>
            </ul>
          </div>
          <div className="shrink-0">
            <Link
              href="/free-listing"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              List your property — free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
