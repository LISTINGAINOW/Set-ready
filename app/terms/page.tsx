import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | SetVenue',
  description: 'Terms of Service for using SetVenue, including booking rules, privacy tiers, and legal responsibilities.',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: [
      'By accessing or using SetVenue, you agree to be bound by these Terms of Service and any policies referenced here. If you do not agree, do not use the platform.',
      'These terms apply to all users, including hosts, producers, scouts, crew members, and anyone browsing or interacting with listings, bookings, or communications on the site.',
    ],
  },
  {
    title: '2. User Accounts',
    content: [
      'You may need to register for an account to access certain features. You agree to provide accurate, current, and complete information and to keep that information updated.',
      'We may require email verification, identity checks, age confirmation, or additional screening before enabling certain account functions, listings, or bookings.',
      'You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.',
    ],
  },
  {
    title: '3. User Conduct',
    content: [
      'You may use SetVenue only for lawful business purposes related to location discovery, booking, hosting, and production coordination.',
      'You may not misuse the platform, harass other users, submit false or misleading information, attempt unauthorized access, scrape protected data, evade safety controls, or use the service to facilitate illegal conduct.',
      'Users are responsible for acting professionally, respecting property rules, honoring agreed shoot terms, and complying with all applicable laws, permits, contracts, labor rules, zoning rules, and content regulations.',
    ],
  },
  {
    title: '4. Privacy Tiers',
    content: [
      'SetVenue offers privacy-based listing tiers to help users manage how much location information is shared before booking.',
      'Public listings may display broader location and property details. Private listings may limit identifying information and reveal fuller details only during the inquiry or approval process. NDA Required listings may require signed confidentiality terms before exact addresses, sensitive visuals, or other identifying details are shared.',
      'Hosts choose the privacy tier for their listings, and producers agree to respect any limits on sharing, recording, or disclosing location information provided through the platform.',
    ],
  },
  {
    title: '5. Booking & Payments',
    content: [
      'Bookings are not final until accepted or confirmed through the platform workflow and any required payment steps are completed.',
      'SetVenue currently charges hosts 0% and adds a 15% producer service fee at checkout. Unless otherwise stated, bookings are also subject to a $49 minimum before any separately disclosed refundable security deposit.',
      'Users agree to pay all quoted rates, fees, taxes, damage charges, overtime, and any other charges disclosed as part of the booking. Payment processing may be handled by third-party processors subject to their own terms.',
    ],
  },
  {
    title: '6. Cleaning & Property Condition',
    content: [
      'Guests are expected to leave the property in the same condition as found. Reasonable wear is expected, but excessive mess, damage, or unclean conditions will result in a cleaning fee charged to your payment method.',
      'Cleaning fees are determined by the host based on:',
      '• Time and materials required to restore the property',
      '• Documented before/after photos',
      '• Industry-standard cleaning rates',
      'Typical cleaning fees range from $100-$500 depending on property size and condition.',
    ],
  },
  {
    title: '7. Cancellation Policy',
    content: [
      'Unless a listing or booking states otherwise, cancellations should be made as early as possible through the platform or agreed communication channel.',
      'Hosts and producers are expected to use commercially reasonable efforts to communicate changes promptly, minimize disruption, and handle refunds or rescheduling in good faith according to the booking terms presented at the time of reservation.',
      'We may establish standard cancellation windows, credits, partial refunds, or exceptions for emergencies, safety concerns, suspected policy violations, or force majeure events.',
    ],
  },
  {
    title: '8. Content Restrictions',
    content: [
      'SetVenue serves users in the productions industry, but only for legal, consensual, and lawfully produced activity. All users must be at least 18 years old, or the legal age of majority in their jurisdiction, whichever is higher.',
      'You may not post, request, arrange, promote, or produce illegal content or activities through the platform, including trafficking, exploitation, non-consensual content, underage content, or any other unlawful conduct.',
      'Users are solely responsible for ensuring their productions, bookings, and use of any location comply with applicable laws, record-keeping rules, permitting requirements, and contractual obligations.',
    ],
  },
  {
    title: '9. Intellectual Property',
    content: [
      'SetVenue and its branding, site design, software, text, graphics, and platform content are owned by us or our licensors and are protected by intellectual property laws.',
      'Users retain ownership of the content they submit, such as listing descriptions, photos, or production-related materials, but grant us a limited license to host, display, reproduce, and use that content as needed to operate, improve, and promote the platform.',
      'You represent that you have the rights needed to upload or share any content you provide to the site.',
    ],
  },
  {
    title: '10. Disclaimers and Limitation of Liability',
    content: [
      'SetVenue provides a marketplace platform and does not guarantee the conduct, quality, legality, safety, suitability, availability, or accuracy of any listing, user, property, production, or third-party service.',
      'To the maximum extent permitted by law, the platform is provided “as is” and “as available” without warranties of any kind, express or implied.',
      'To the maximum extent permitted by law, SetVenue and its affiliates will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost data, business interruption, or reputational harm arising from or related to use of the platform.',
    ],
  },
  {
    title: '11. Governing Law',
    content: [
      'These Terms of Service are governed by the laws of the State of California, without regard to conflict of law principles.',
      'Any dispute arising out of or relating to these terms or the platform will be resolved in the state or federal courts located in California, unless applicable law requires otherwise.',
    ],
  },
  {
    title: '12. Contact Information',
    content: [
      'If you have questions about these Terms of Service, please contact us at support@setvenue.com.',
      'We may update these terms from time to time. Continued use of the platform after changes become effective constitutes acceptance of the revised terms.',
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-blue-100 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Legal</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">Terms of Service</h1>
          <p className="mt-5 text-base leading-8 text-black/70 sm:text-lg">
            These Terms of Service govern your use of SetVenue. They are written to set clear expectations for
            hosts, producers, and other users working in a privacy-sensitive booking marketplace, including users in
            the productions industry.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[24px] border border-blue-100 bg-blue-50/70 p-6 sm:p-7">
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
