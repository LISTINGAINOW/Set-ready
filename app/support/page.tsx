import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Mail, ShieldCheck, CircleHelp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Support | SetVenue',
  description: 'SetVenue support resources, contact details, and help center guidance.',
};

const supportLinks = [
  {
    title: 'Booking help',
    description: 'Need help with availability, booking flow, pricing, or guest fees?',
    href: '/how-it-works',
    icon: BookOpen,
  },
  {
    title: 'Privacy and NDA questions',
    description: 'Understand Public, Private, and NDA Required workflows before you book.',
    href: '/faq',
    icon: ShieldCheck,
  },
  {
    title: 'Contact support',
    description: 'Email support@setvenue.com for account, host, or production support.',
    href: '/contact',
    icon: Mail,
  },
  {
    title: 'General answers',
    description: 'Read the most common producer and host questions in one place.',
    href: '/faq',
    icon: CircleHelp,
  },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl rounded-[32px] border border-black bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Support</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">Help center for a privacy-first marketplace.</h1>
          <p className="mt-5 text-base leading-7 text-black/70 sm:text-lg">
            Use these support paths if you’re troubleshooting a booking, onboarding a property, or trying to understand how discretion works inside the platform.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {supportLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className="group rounded-[28px] border border-black bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(59,130,246,0.12)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500 bg-white text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-black">{item.title}</h2>
                <p className="mt-3 text-base leading-7 text-black/70">{item.description}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                  Open
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        <section className="mt-8 rounded-[32px] border border-black bg-[#FAFAFA] p-8 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-black">Common issues</h2>
          <ul className="mt-5 space-y-3 text-base leading-7 text-black/72">
            <li>• Booking request still pending and you need next steps</li>
            <li>• You need clarification on address visibility before approval</li>
            <li>• A host needs help presenting rules, amenities, or access details clearly</li>
            <li>• You want to understand platform fees before confirming a production day</li>
          </ul>
          <p className="mt-6 text-sm text-black/60">Business support is email-only: support@setvenue.com</p>
        </section>
      </div>
    </main>
  );
}
