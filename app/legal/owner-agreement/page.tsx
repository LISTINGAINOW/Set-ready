import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Property Owner Agreement | SetVenue',
  description: 'Property Owner Agreement for listing on SetVenue — terms, pricing, insurance, and your rights as a host.',
};

const sections = [
  {
    title: 'Listing Terms',
    content: [
      'You retain full ownership rights while granting SetVenue a non-exclusive license to display your property information and photos for rental purposes.',
    ],
  },
  {
    title: 'Pricing',
    content: [
      'Owners set prices, which they retain in full. SetVenue charges guests a 10% booking fee.',
    ],
  },
  {
    title: 'Representations',
    content: [
      'By listing on SetVenue, you represent that you have the legal right to do so and comply with all relevant local laws and regulations.',
    ],
  },
  {
    title: 'Insurance Requirements',
    content: [
      'You must maintain adequate insurance coverage for your property during rental periods.',
    ],
  },
  {
    title: 'Cancellation Responsibilities',
    content: [
      'Cancellation terms are outlined in our separate cancellation policy document. You agree to follow these guidelines or face potential liability.',
    ],
  },
  {
    title: 'Photo Usage Rights',
    content: [
      'SetVenue retains the right to use photos of your property for promotional purposes, subject to applicable copyright laws.',
    ],
  },
  {
    title: 'Term and Termination',
    content: [
      'This agreement remains active until terminated by either party with notice.',
    ],
  },
  {
    title: 'Indemnification',
    content: [
      'You agree to indemnify SetVenue against any claims arising from your use or listing on the platform.',
    ],
  },
];

export default function OwnerAgreementPage() {
  return (
    <div className="rounded-[32px] border border-blue-100 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">
          Property Owner Agreement
        </h1>
        <p className="mt-3 text-sm text-black/50">Last updated: March 25, 2026</p>
        <p className="mt-5 text-base leading-8 text-black/70 sm:text-lg">
          This agreement governs the listing of property on SetVenue by owners.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="rounded-[24px] border border-blue-100 bg-blue-50/70 p-6 sm:p-7">
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-black sm:text-2xl">{section.title}</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-black/80 sm:text-base">
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
