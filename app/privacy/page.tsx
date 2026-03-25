import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | SetVenue',
  description: 'Privacy Policy for SetVenue, including data collection, privacy tiers, security, and user rights.',
};

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      'We may collect information you provide directly, including your name, email address, phone number, business details, account credentials, listing details, communications, and booking information.',
      'We may also collect payment-related information through our payment processors, location-related information connected to listings or searches, device and browser information, log data, and usage analytics.',
      'Because SetVenue serves privacy-sensitive productions, some information may relate to listing privacy preferences, approximate or exact property location, and booking verification details.',
    ],
  },
  {
    title: '2. How We Use Information',
    content: [
      'We use information to operate the platform, create and manage accounts, process bookings, facilitate communication between users, verify eligibility, detect misuse, and provide customer support.',
      'We may also use information to improve platform performance, analyze trends, develop new features, personalize user experience, and enforce our terms, policies, and legal obligations.',
      'Where permitted, we may send service-related notices, verification messages, transactional communications, and limited product updates relevant to your account or activity.',
    ],
  },
  {
    title: '3. Privacy Tiers and Location Privacy',
    content: [
      'SetVenue supports privacy tiers such as Public, Private, and NDA Required to give hosts more control over how location details are exposed during discovery and booking.',
      'Depending on the selected tier, users may see broad location information, limited identifying details, or only partial listing content until inquiry, approval, or confidentiality steps are completed.',
      'Users who receive restricted listing information agree to use it only for legitimate booking evaluation and not to copy, publish, or disclose that information outside the intended transaction process.',
    ],
  },
  {
    title: '4. Data Protection',
    content: [
      'We use reasonable administrative, technical, and organizational safeguards designed to protect personal information against unauthorized access, disclosure, alteration, or destruction.',
      'These safeguards may include access controls, encrypted transmission where appropriate, service-provider security controls, account verification tools, and internal limitations on who can access sensitive data.',
      'No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
    ],
  },
  {
    title: '5. Cookies and Tracking',
    content: [
      'We may use cookies, local storage, session technologies, and similar tools to keep users signed in, remember preferences, maintain session integrity, understand traffic patterns, and improve site functionality.',
      'We may also use analytics tools to measure usage, diagnose issues, and understand which features are most useful. You can often control cookies through your browser settings, though some features may not function properly if disabled.',
    ],
  },
  {
    title: '6. Third-Party Services',
    content: [
      'We may rely on third-party providers for services such as payment processing, hosting, analytics, mapping, communications, identity or fraud checks, and customer support tools.',
      'Those providers may process personal information on our behalf or under their own privacy terms, depending on the service involved. We encourage users to review the privacy practices of relevant third-party providers where appropriate.',
    ],
  },
  {
    title: '7. User Rights',
    content: [
      'Subject to applicable law, you may have the right to request access to personal information we hold about you, request correction of inaccurate information, request deletion of certain data, or object to or limit certain processing.',
      'You may also request account closure, though we may retain certain information where required for legal, security, fraud-prevention, accounting, dispute-resolution, or contractual reasons.',
      'To exercise privacy-related rights, contact us at support@setvenue.com.',
    ],
  },
  {
    title: '8. Data Retention',
    content: [
      'We retain personal information for as long as reasonably necessary to provide the platform, maintain business records, resolve disputes, enforce agreements, comply with legal obligations, and protect platform integrity.',
      'Retention periods may vary depending on the type of information, the nature of the booking or listing, payment and tax requirements, legal compliance needs, and safety or fraud concerns.',
    ],
  },
  {
    title: '9. Production Use and Legal Compliance',
    content: [
      'SetVenue is designed for professional productions including film, photo shoots, events, and crew stays. All users must be 18 years old or older, or the age of majority in their jurisdiction.',
      'Users are responsible for ensuring that all content, productions, bookings, and location use are legal, properly permitted, and compliant with applicable law. We do not permit illegal or unauthorized activities on the platform.',
    ],
  },
  {
    title: '10. Contact for Privacy Issues',
    content: [
      'If you have questions, requests, or complaints related to this Privacy Policy or your personal information, contact support@setvenue.com.',
      'We may update this Privacy Policy from time to time. When we do, we will post the updated version on this page, and your continued use of the platform will be subject to the revised policy.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-blue-100 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Legal</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">Privacy Policy</h1>
          <p className="mt-5 text-base leading-8 text-black/70 sm:text-lg">
            This Privacy Policy explains what information SetVenue collects, how we use it, and how privacy is
            handled on a platform designed for sensitive location bookings and production-industry workflows.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
              className="rounded-[24px] border border-blue-100 bg-blue-50/70 p-6 sm:p-7"
            >
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-black">{section.title}</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-black/80 sm:text-base">
                {section.content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
