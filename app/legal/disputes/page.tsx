import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dispute Resolution | SetVenue',
  description: 'SetVenue dispute resolution process — direct communication, mediation, and binding arbitration steps.',
};

const sections = [
  {
    title: 'Step 1: Direct Communication (48-Hour Window)',
    content: [
      'When a dispute arises, the parties involved have 48 hours to attempt direct communication and resolution. This includes discussions about booking issues, property damage, payment disputes, or cancellations.',
    ],
  },
  {
    title: 'Step 2: SetVenue Mediation (5 Business Days)',
    content: [
      'If direct communication fails, either party may request SetVenue mediation. SetVenue will:',
      '• Review evidence provided by both parties (photos, messages, booking details)',
      '• Investigate the claim thoroughly',
      '• Render a decision within 5 business days',
      '• Communicate the decision to both parties',
    ],
  },
  {
    title: 'Step 3: Binding Arbitration (JAMS)',
    content: [
      'If SetVenue mediation does not resolve the dispute, the parties agree to submit to binding arbitration with JAMS (Judicial Arbitration and Mediation Services) under California law. The arbitrator\'s decision is final and binding.',
    ],
  },
  {
    title: 'Damage Claims Process',
    content: [
      'Property damage claims must be submitted with:',
      '• Clear photographic or video evidence',
      '• Detailed description of damage',
      '• Repair or replacement cost estimates',
      '• Proof of pre-existing condition (if applicable)',
    ],
  },
  {
    title: 'Security Deposit Handling',
    content: [
      'Security deposits (if applicable) are held by SetVenue and released according to the cancellation policy and damage assessment.',
    ],
  },
  {
    title: 'Photo/Video Documentation',
    content: [
      'Both property owners and guests are encouraged to document the property condition before and after each rental using photos or video.',
    ],
  },
];

export default function DisputesPage() {
  return (
    <div className="rounded-[32px] border border-blue-100 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">
          Dispute Resolution
        </h1>
        <p className="mt-3 text-sm text-black/50">Last updated: March 25, 2026</p>
        <p className="mt-5 text-base leading-8 text-black/70 sm:text-lg">
          Our three-step process for resolving disputes between guests and property owners — from direct
          communication through binding arbitration.
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
