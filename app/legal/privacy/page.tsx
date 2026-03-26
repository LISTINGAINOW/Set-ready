import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | SetVenue',
  description: 'Privacy Policy for SetVenue — how we collect, use, and protect your personal data.',
};

const sections = [
  {
    title: 'Data Collected',
    content: [
      'We collect name, email address, phone number, payment information, property details, and photos for the purpose of platform operation, communication, and analytics.',
    ],
  },
  {
    title: 'Third Parties',
    content: [
      'SetVenue works with Stripe (payments), Supabase (data storage), Resend (email services), and Vercel (web hosting). These third parties assist us in operating our website and fulfilling your requests.',
    ],
  },
  {
    title: 'CCPA Compliance',
    content: [
      'Under the California Consumer Privacy Act (CCPA), California residents have specific rights regarding their personal information, including the right to request deletion or access of such data.',
    ],
  },
  {
    title: 'Data Retention and Deletion Rights',
    content: [
      'Personal data will be retained as necessary for the services provided. You may request deletion by contacting us at privacy@setvenue.com.',
    ],
  },
  {
    title: 'Cookie Policy',
    content: [
      'We use cookies to enhance user experience on our website. By using SetVenue, you consent to these cookie uses.',
    ],
  },
  {
    title: 'Contact Information',
    content: [
      'For any questions or requests regarding your data, contact us at support@setvenue.com.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="rounded-[32px] border border-blue-100 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-black/50">Last updated: March 25, 2026</p>
        <p className="mt-5 text-base leading-8 text-black/70 sm:text-lg">
          This policy explains how SetVenue collects, uses, and protects your personal data.
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
