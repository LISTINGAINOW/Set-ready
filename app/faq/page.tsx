import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | SetVenue',
  description: 'Answers to common booking, privacy, payment, cancellation, and host questions for SetVenue.',
};

const faqItems = [
  {
    question: 'How does booking work on SetVenue?',
    answer: 'Browse locations, review pricing and features, select available time, and complete checkout. For productions needing stays or events, you can book everything in one place — no need for multiple platforms.',
  },
  {
    question: 'What can I use SetVenue for?',
    answer: 'SetVenue supports three use cases: Locations (film shoots, photo shoots, commercials), Stays (crew housing, production accommodations), and Events (wrap parties, launches, corporate events). Book what you need, all in one place.',
  },
  {
    question: 'How do your fees compare to competitors?',
    answer: 'SetVenue charges a 10% guest fee with 0% host fees. Giggster charges 15-25%. Peerspace charges ~20%. We pass the savings directly to production teams.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards through Stripe. Payment is secure, fast, and reliable.',
  },
  {
    question: 'What is the cancellation policy?',
    answer: 'Cancellations should be made as early as possible. Refunds, credits, or rescheduling depend on the booking terms shown at checkout and the host policy. We recommend reviewing cancellation terms before booking.',
  },
  {
    question: 'How do privacy tiers work?',
    answer: 'Public listings share more upfront detail. Privacy-tier listings limit identifying information until a serious inquiry is made. NDA Required listings may require a signed confidentiality agreement before exact address details are released.',
  },
  {
    question: 'What are the requirements to host on SetVenue?',
    answer: 'Hosts should control the property or have permission to list it, provide accurate photos and rules, disclose access limitations, and set realistic expectations for production use. Hosts pay 0% fees — only guests pay the 10% platform fee.',
  },
  {
    question: 'Can I book both a shoot location AND crew housing?',
    answer: 'Yes! That\'s the SetVenue advantage. Book your shoot location and crew stay in one place. Production managers love this — one platform, one invoice, less coordination.',
  },
  {
    question: 'Can I book a location for multiple days or weeks?',
    answer: 'Absolutely. SetVenue supports single-day, multi-day, weekly, and monthly bookings. Use the multi-day calendar to select a date range. Many properties offer discounted daily or weekly rates for longer shoots.',
  },
  {
    question: 'Do I need a film permit?',
    answer: 'It depends on the location and production type. Most commercial shoots in Los Angeles require a permit from FilmLA. Small photo shoots on private property may be exempt. Check our city-specific permit guides for details, or contact us and we will help you figure it out.',
  },
  {
    question: 'Is insurance required?',
    answer: 'Yes. All productions must carry general liability insurance and name the property owner as additionally insured. Most productions already have this through their production insurance. If you need help, we can point you to providers who offer per-shoot coverage starting around $300.',
  },
  {
    question: 'How much does it cost to list my property?',
    answer: 'Nothing. SetVenue charges property owners zero fees — ever. You set your own rates and keep 100% of your rental income. The first 500 property owners get a free listing for 6 months with no strings attached.',
  },
];

function FAQJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <FAQJsonLd />
      <div className="mx-auto max-w-5xl rounded-[32px] border border-black bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">FAQ</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">Common questions, answered clearly.</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-black/70 sm:text-lg">
          SetVenue is built for productions — locations, stays, and events all in one place. Here are the questions we hear most.
        </p>

        <div className="mt-10 space-y-5">
          {faqItems.map((item, index) => (
            <section key={item.question} className="rounded-[28px] border border-black bg-[#FAFAFA] p-6 sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Question {index + 1}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">{item.question}</h2>
              <p className="mt-4 text-base leading-7 text-black/75">{item.answer}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
