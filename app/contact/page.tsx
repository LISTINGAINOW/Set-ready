import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | SetVenue',
  description: 'Contact SetVenue support for booking help, privacy questions, and host assistance.',
};

type ContactPageProps = {
  searchParams?: Promise<{
    sent?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = (await searchParams) ?? {};
  const isSent = params.sent === '1';

  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[32px] border border-black bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Contact us</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">Support that stays professional.</h1>
          <p className="mt-5 text-base leading-7 text-black/70 sm:text-lg">
            If you need help with bookings, privacy tiers, host onboarding, or account access, email the SetVenue team directly.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-[24px] border border-black bg-[#FAFAFA] p-5">
              <div className="flex items-center gap-3 text-black">
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">support@setvenue.com</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-black/65">Email-only business support. No business phone line is published.</p>
            </div>
            <div className="rounded-[24px] border border-black bg-[#FAFAFA] p-5">
              <div className="flex items-center gap-3 text-black">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Response time: 24–48 hours</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-black/65">Urgent booking changes should include your listing name, booking date, and account email.</p>
            </div>
            <div className="rounded-[24px] border border-black bg-[#FAFAFA] p-5">
              <div className="flex items-center gap-3 text-black">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Privacy-sensitive requests welcome</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-black/65">For NDA, discretion, or restricted-address questions, tell us the listing and tier involved so we can route it correctly.</p>
            </div>
          </div>

          <Link href="/faq" className="mt-8 inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600">
            Read the FAQ
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="rounded-[32px] border border-black bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">Send a message</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-black/70">
            This form is set up for support intake and can be connected to your backend or help desk later.
          </p>

          <form action="/contact" method="GET" className="mt-8 space-y-5">
            <input type="hidden" name="sent" value="1" />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-black">Name</label>
                <input id="name" name="name" type="text" placeholder="Your name" required className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-black outline-none placeholder:text-black/40 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-black">Email</label>
                <input id="email" name="email" type="email" placeholder="you@company.com" required className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-black outline-none placeholder:text-black/40 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="mb-2 block text-sm font-medium text-black">Subject</label>
              <input id="subject" name="subject" type="text" placeholder="Booking help, NDA request, host onboarding..." required className="w-full rounded-2xl border border-black bg-white px-4 py-3 text-black outline-none placeholder:text-black/40 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-black">Message</label>
              <textarea id="message" name="message" rows={7} placeholder="Tell us what you need and include any booking or listing context." required className="w-full rounded-[24px] border border-black bg-white px-4 py-3 text-black outline-none placeholder:text-black/40 focus:border-blue-500" />
            </div>
            {isSent ? (
              <div className="rounded-[24px] border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700">
                Message sent! We'll respond within 24-48 hours.
              </div>
            ) : null}

            <button type="submit" className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
              Submit inquiry
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
