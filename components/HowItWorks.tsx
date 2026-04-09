import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const steps = [
  { number: '01', title: 'Browse Locations', description: 'Find your perfect space' },
  { number: '02', title: 'Check Availability', description: 'Pick your dates' },
  { number: '03', title: 'Book Instantly', description: 'Secure your spot' },
  { number: '04', title: 'Create', description: 'Bring your vision to life' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-black bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_42%,#f8fafc_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:rounded-[36px]">
        <div className="relative isolate p-6 sm:p-10 lg:p-14">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_62%)] lg:block" />

          <div className="relative z-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">
                From scouting to shoot day in four clean steps.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-black/70 sm:text-lg sm:leading-8">
                A simpler booking flow for producers who want fewer emails, faster decisions, and a location that is ready when the crew arrives.
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-4">
              {steps.map((step, index) => {
                return (
                  <div
                    key={step.number}
                    className="relative rounded-[24px] border border-black bg-white/85 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_40px_rgba(59,130,246,0.10)] sm:rounded-[28px]"
                  >
                    {index < steps.length - 1 && (
                      <div className="absolute left-[calc(100%_-_12px)] top-1/2 hidden h-px w-8 -translate-y-1/2 bg-gradient-to-r from-blue-300 to-transparent lg:block" />
                    )}

                    <div className="flex items-start gap-4">
                      <span className="text-4xl font-bold tracking-[0.1em] text-blue-600">{step.number}</span>
                      <div>
                        <h3 className="text-lg font-semibold tracking-[-0.03em] text-black">{step.title}</h3>
                        <p className="mt-1 text-sm text-black/70">{step.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex justify-start">
              <Link
                href="/locations"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-blue-500 px-7 py-4 font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:bg-blue-600"
              >
                Browse Locations
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
