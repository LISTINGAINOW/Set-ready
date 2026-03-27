import Link from 'next/link';

export default function ListingSubmittedPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-[24px] border border-slate-200 bg-white p-8 text-center sm:p-12">
        {/* Green checkmark */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <svg
            className="h-10 w-10 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-[#111111]">Listing Submitted for Review</h1>

        <p className="mb-8 text-base leading-relaxed text-black/65">
          Our team will review your listing and documents within 1–2 business days. You&apos;ll receive an email once your listing is approved.
        </p>

        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#3B82F6] px-8 py-3 font-semibold text-white transition hover:bg-blue-600"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
