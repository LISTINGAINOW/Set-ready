import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, FileText, AlertCircle, Users, Scale, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Adult Production Policy | SetVenue',
  description: 'SetVenue serves all legal professional productions. Learn how our content type opt-in system works, compliance requirements, and property owner rights.',
  alternates: { canonical: '/legal/adult-production-policy' },
};

const sections = [
  {
    icon: Scale,
    title: 'We serve all legal professional productions',
    body: `SetVenue is a marketplace for professional productions of all kinds. We do not discriminate based on content type. Film, television, commercial, photography, music video, adult entertainment, events — if it is legal and properly insured, it is welcome on this platform.

We believe productions should have access to quality locations without being turned away based on their content category. A professional adult entertainment production is entitled to the same booking experience as a feature film crew.`,
  },
  {
    icon: Users,
    title: 'Property owners opt in voluntarily',
    body: `No property owner is required to accept any particular content type. When listing a property, owners explicitly select which production types they are comfortable hosting. This includes a specific opt-in for adult entertainment.

The "All Productions Welcome" designation on a listing means the owner has affirmatively chosen to accept adult productions. Owners can update their content type preferences at any time from their listing settings. SetVenue does not pressure, incentivize, or default-enroll owners into accepting content they have not approved.`,
  },
  {
    icon: FileText,
    title: 'Insurance is required for all bookings',
    body: `All productions — regardless of content type — must carry valid production insurance. SetVenue may require proof of insurance prior to confirming a booking. The specific coverage minimums are detailed in the booking terms and may vary by property.

Property owners may require additional coverage. Insurance requirements are communicated clearly on each listing page and in the booking flow.`,
  },
  {
    icon: CheckCircle,
    title: 'Compliance with local laws',
    body: `Productions are responsible for ensuring their activities comply with all applicable federal, state, and local laws. This includes but is not limited to: zoning restrictions, noise ordinances, permit requirements, and content-specific regulations.

SetVenue provides permit guides for 22 major US production cities as a reference resource. These guides are informational only and do not constitute legal advice. Productions should consult legal counsel for jurisdiction-specific compliance questions.`,
  },
  {
    icon: FileText,
    title: 'Section 2257 compliance',
    body: `For productions involving adult content, compliance with 18 U.S.C. § 2257 (the Record-Keeping Requirements for sexually explicit depictions) is solely the responsibility of the production company. SetVenue is not a producer, primary producer, or secondary producer of any content created at properties listed on this platform.

Production companies are responsible for maintaining all required records, obtaining all required performer documentation, and displaying all required compliance statements in their content. SetVenue's role is limited to facilitating the location rental transaction.`,
  },
  {
    icon: AlertCircle,
    title: 'Zero tolerance: minors',
    body: `No explicit content of any kind may be created involving individuals under the age of 18. This is an absolute prohibition with no exceptions. Productions that violate this policy will be immediately removed from the platform, all funds will be held pending investigation, and the matter will be reported to appropriate law enforcement authorities.

All talent participating in adult productions must be 18 years of age or older, must provide valid government-issued identification confirming their age, and production companies must maintain these records in compliance with applicable law.`,
  },
  {
    icon: ShieldCheck,
    title: "SetVenue's role in content creation",
    body: `SetVenue is a location rental marketplace. We facilitate transactions between property owners and production companies. We are not a party to, participant in, or responsible for any content created at properties listed on our platform.

SetVenue does not review, approve, or take responsibility for any production content. Our obligations are limited to the location rental transaction itself. The content created during a booking is entirely the legal and creative responsibility of the production company.`,
  },
  {
    icon: Users,
    title: 'Professional conduct requirements',
    body: `All productions — regardless of content type — are required to maintain professional conduct on all properties. This includes:

• Treating property owners and their spaces with respect
• Adhering to the agreed booking hours and not exceeding them without prior approval
• Leaving the property in the same condition as found, including cleaning and gear removal
• Not exceeding the approved crew size or bringing unregistered guests
• Following all house rules specified in the listing
• Providing accurate information about the production in booking requests

Violations of professional conduct standards may result in account suspension, forfeiture of security deposits, and removal from the platform.`,
  },
];

export default function AdultProductionPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            Legal Policy
          </div>
          <h1 className="text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            Adult Production Policy
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            SetVenue operates as a neutral marketplace serving all legal professional productions.
            This policy describes how we handle adult entertainment productions, property owner opt-in,
            compliance requirements, and our obligations as a platform.
          </p>
          <p className="mt-4 text-sm text-slate-500">Last updated: March 2026</p>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-5 flex items-start gap-4">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Section {index + 1}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">{section.title}</h2>
                  </div>
                </div>
                <div className="text-base leading-8 text-slate-700 whitespace-pre-line">
                  {section.body}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-[24px] border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-bold text-slate-950">Questions about this policy?</h2>
          <p className="mt-3 text-base text-slate-600">
            Contact our policy team at{' '}
            <a href="mailto:legal@setvenue.com" className="font-medium text-blue-600 underline hover:text-blue-800">
              legal@setvenue.com
            </a>
            . For general support, visit our{' '}
            <Link href="/support" className="font-medium text-blue-600 underline hover:text-blue-800">
              Help Center
            </Link>
            .
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-500">
          <Link href="/legal/terms" className="hover:text-blue-600">Terms of Service</Link>
          <Link href="/legal/privacy" className="hover:text-blue-600">Privacy Policy</Link>
          <Link href="/locations" className="hover:text-blue-600">Browse Locations</Link>
          <Link href="/list-property" className="hover:text-blue-600">List Your Property</Link>
        </div>
      </div>
    </main>
  );
}
