'use client';

import { ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import InsuranceManager from '@/components/InsuranceManager';

const steps = [
  { label: 'Booking details', state: 'complete' },
  { label: 'Pricing review', state: 'complete' },
  { label: 'Insurance', state: 'current' },
  { label: 'Confirmation', state: 'upcoming' },
] as const;

export default function BookingInsuranceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const continueToConfirmation = (payload: { insuranceStatus: 'uploaded' | 'partner-link' | 'skipped'; insuranceExpiry?: string }) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('insuranceStatus', payload.insuranceStatus);
    if (payload.insuranceExpiry) next.set('insuranceExpiry', payload.insuranceExpiry);
    router.push(`/booking/confirmation?${next.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[36px] border border-black bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Step 3: Insurance</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-black sm:text-5xl">One last checkpoint before confirmation.</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-black/72 sm:text-lg">
            Production insurance protects everyone. Upload your certificate now or use a partner link if you need quick same-day coverage.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.label} className={`rounded-[24px] border p-4 ${step.state === 'current' ? 'border-blue-500 bg-blue-50' : step.state === 'complete' ? 'border-black bg-[#fafafa]' : 'border-black/20 bg-white'}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Step {index + 1}</p>
                <p className="mt-2 font-semibold text-black">{step.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <InsuranceManager mode="booking" onContinue={continueToConfirmation} />
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-black bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <div className="flex items-start gap-3">
                <Shield className="mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Requirement</p>
                  <h2 className="mt-3 text-2xl font-bold text-black">Minimum $1M general liability required</h2>
                  <p className="mt-4 text-sm leading-6 text-black/68">This is a lightweight trust and risk step for now. Verification can get more rigorous later without redesigning the flow.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-black bg-[#fafafa] p-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-black">What happens next</h2>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-black/68">
                    <p>• Upload a PDF certificate now, or continue after opening a partner link.</p>
                    <p>• Your booking confirmation page will reflect whether insurance was uploaded or still pending.</p>
                    <p>• You can manage certificates later from your producer dashboard.</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/insurance" className="inline-flex items-center gap-2 rounded-full border border-black px-4 py-2 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600">
                      View full insurance page
                    </Link>
                    <button type="button" onClick={() => continueToConfirmation({ insuranceStatus: 'skipped' })} className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">
                      Skip for now
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
