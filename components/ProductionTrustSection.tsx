import { Headphones, LockKeyhole, MessageCircle, ShieldCheck } from 'lucide-react';

const trustItems = [
  {
    icon: ShieldCheck,
    title: 'Insured Productions',
    description: 'Properties verified for film and photo productions with proper insurance requirements.',
  },
  {
    icon: LockKeyhole,
    title: 'Secure Payments via Stripe',
    description: 'All transactions are processed through Stripe. Your payment info is never stored on our servers.',
  },
  {
    icon: Headphones,
    title: 'Location Concierge',
    description: 'Need help finding the perfect space? Our concierge team will shortlist options for your shoot.',
  },
  {
    icon: MessageCircle,
    title: 'Instant Communication',
    description: 'Message property owners directly. Get answers fast and lock in your date without the back-and-forth.',
  },
];

export default function ProductionTrustSection() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Built for productions</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-4xl">
            Trusted by production teams
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-start rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
