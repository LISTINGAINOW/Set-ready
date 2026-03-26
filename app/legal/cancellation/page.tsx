import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation Policy | SetVenue',
  description: "SetVenue's cancellation policy — flexible, moderate, and strict booking tiers, production bookings, and force majeure.",
};

const sections = [
  {
    title: 'Flexible Booking',
    content: [
      'Full refund if cancelled more than 24 hours before the rental.',
      '50% refund for cancellations within 24 hours.',
    ],
  },
  {
    title: 'Moderate Booking',
    content: [
      'Full refund if cancelled at least 5 days in advance.',
      '50% refund if cancelled between 1 to 5 days of booking date.',
    ],
  },
  {
    title: 'Strict Booking',
    content: [
      'Full refund if cancelled more than 14 days before the rental.',
      '50% refund for cancellations within 7 to 14 days.',
      'No refunds for cancellations within 48 hours.',
    ],
  },
  {
    title: 'Production Bookings',
    content: [
      'Custom cancellation terms apply to production company bookings. Terms are negotiated on a case-by-case basis.',
    ],
  },
  {
    title: 'Force Majeure',
    content: [
      'In the event of circumstances beyond reasonable control (natural disasters, pandemics, government actions), SetVenue may modify or refund bookings at its discretion.',
    ],
  },
  {
    title: 'Non-Refundable Fee',
    content: [
      'The SetVenue booking fee (10%) is non-refundable regardless of cancellation reason.',
    ],
  },
];

export default function CancellationPage() {
  return (
    <div className="rounded-[32px] border border-blue-100 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">
          Cancellation Policy
        </h1>
        <p className="mt-3 text-sm text-black/50">Last updated: March 25, 2026</p>
        <p className="mt-5 text-base leading-8 text-black/70 sm:text-lg">
          Our cancellation policy varies based on type of booking. Please review the applicable tier for your
          reservation.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="rounded-[24px] border border-blue-100 bg-blue-50/70 p-6 sm:p-7">
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-black sm:text-2xl">{section.title}</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-black/80 sm:text-base">
              {section.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
