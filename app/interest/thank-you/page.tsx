import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function InterestThankYouPage() {
  return (
    <div className="bg-[#F9FAFB] px-4 py-16 text-black sm:py-24">
      <div className="mx-auto max-w-2xl rounded-[28px] border-2 border-black bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Interest received
        </div>
        <h1 className="mt-5 text-4xl font-bold sm:text-5xl">Thanks for reaching out.</h1>
        <p className="mt-4 text-base leading-7 text-black/75 sm:text-lg">
          We logged your host interest and queued a confirmation email for review. Someone from the team can now follow up with the next steps.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/list-property"
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#3B82F6] px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            Start listing now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg border-2 border-black px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
