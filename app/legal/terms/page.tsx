import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | SetVenue',
  description: 'Terms of Service for SetVenue — the platform connecting property owners with renters for film locations, photo shoots, events, and crew housing.',
};

const sections = [
  {
    title: 'Platform Overview',
    content: [
      'The SetVenue platform is a marketplace that connects property owners with potential renters (guests). We do not participate in the rental agreements between users; we merely provide a space for these interactions to take place.',
    ],
  },
  {
    title: 'User Accounts and Content Policies',
    content: [
      'To use our services, you must create an account and agree to use our platform legally. You are responsible for your own actions on SetVenue and any content you post.',
      'Prohibited uses include but are not limited to harassment, spamming, illegal activities, or copyright infringement.',
    ],
  },
  {
    title: 'Booking Fee',
    content: [
      'SetVenue charges a 10% booking fee from guests/production companies for each booking made through our platform.',
    ],
  },
  {
    title: 'Limitation of Liability',
    content: [
      'We do not guarantee the accuracy, completeness, reliability, or usefulness of any information on SetVenue and shall not be held responsible for any errors or omissions in such information. You agree that your use of the service is at your sole risk.',
    ],
  },
  {
    title: 'Dispute Resolution',
    content: [
      'Any disputes arising from our services will be resolved through binding arbitration administered by JAMS under its rules, with judgment entered in a court of competent jurisdiction. California law governs these terms without regard to conflict-of-law principles.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="rounded-[32px] border border-blue-100 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-black/50">Last updated: March 25, 2026</p>
        <p className="mt-5 text-base leading-8 text-black/70 sm:text-lg">
          Welcome to SetVenue, the premier platform for connecting property owners with renters for film locations,
          photo shoots, events, and crew housing. By accessing or using our services, you agree to be bound by
          these terms.
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
