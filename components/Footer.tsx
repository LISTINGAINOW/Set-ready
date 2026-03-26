'use client';

import Link from 'next/link';
import { Instagram, Linkedin, Twitter } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { isValidEmail, sanitizeEmail } from '@/lib/client-security';
import Logo from '@/components/Logo';

const footerSections = [
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/list-property', label: 'List Your Property' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/support', label: 'Help Center' },
      { href: '/contact', label: 'Contact Us' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/legal/privacy', label: 'Privacy Policy' },
      { href: '/legal/terms', label: 'Terms of Service' },
      { href: '/legal/privacy', label: 'Cookie Policy' },
    ],
  },
];

const socialLinks = [
  { href: 'https://instagram.com/setvenue', label: 'Instagram', icon: Instagram },
  { href: 'https://x.com/SetVenueHQ', label: 'Twitter', icon: Twitter },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: Linkedin },
];

const defaultPreferences = ['new-locations', 'deals', 'production-tips'];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'invalid' | 'error'>('idle');
  const [message, setMessage] = useState('No spam. Just new locations, exclusive deals, and useful production updates.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanEmail = sanitizeEmail(email).toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setStatus('invalid');
      setMessage('Enter a valid email address.');
      return;
    }

    if (!gdprConsent) {
      setStatus('error');
      setMessage('Please confirm consent before subscribing.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          source: 'footer',
          preferences: defaultPreferences,
          gdprConsent: true,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus('error');
        setMessage(payload.error || 'Unable to subscribe right now.');
        setIsSubmitting(false);
        return;
      }

      setStatus('success');
      setMessage('Almost done — your signup is saved and waiting for double opt-in confirmation.');
      setEmail('');
      setGdprConsent(false);
    } catch {
      setStatus('error');
      setMessage('Unable to subscribe right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="space-y-8">
            <div>
              <Logo href="/" size="md" showTagline />
              <p className="mt-5 max-w-xl text-sm leading-7 text-black/72 sm:text-base">
                A cleaner marketplace for productions — built to help producers scout faster, hosts present better,
                and every booking start with clearer expectations.
              </p>
              <p className="mt-4 text-sm text-black/60">Business support: support@setvenue.com</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl rounded-[32px] border border-slate-200 bg-[#FAFAFA] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Newsletter</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black">Stay in the loop</h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-black/68 sm:text-base">
                    Get new locations, exclusive deals, and production tips.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(sanitizeEmail(event.target.value));
                    if (status !== 'idle') {
                      setStatus('idle');
                      setMessage('No spam. Just new locations, exclusive deals, and useful production updates.');
                    }
                  }}
                  placeholder="Enter your email"
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving…' : 'Subscribe'}
                </button>
              </div>
              <label className="mt-4 flex items-start gap-3 rounded-[22px] border border-black/10 bg-white p-4 text-sm text-black/70">
                <input
                  type="checkbox"
                  checked={gdprConsent}
                  onChange={(event) => setGdprConsent(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I agree to receive newsletter emails and understand I can update preferences or unsubscribe at any time.
                </span>
              </label>
              <p className={`mt-3 text-sm ${status === 'success' ? 'text-blue-600' : status === 'invalid' || status === 'error' ? 'text-red-600' : 'text-black/60'}`}>
                {message}
              </p>
              <p className="mt-2 text-xs text-black/50">
                Double opt-in is enabled. We don’t sell emails. Preferences live at <span className="font-semibold">/email-preferences</span>.
              </p>
            </form>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">{section.title}</h2>
                <div className="mt-4 flex flex-col gap-3 text-sm text-black/72">
                  {section.links.map((link) => {
                    const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto:');

                    return isExternal ? (
                      <a
                        key={link.label}
                        href={link.href}
                        className="transition hover:text-blue-600"
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link key={link.label} href={link.href} className="transition hover:text-blue-600">
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Connect</h2>
              <div className="mt-4 flex flex-col gap-3 text-sm text-black/72">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-3 transition hover:text-blue-600"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-[#FAFAFA] text-black transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-black/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SetVenue. All rights reserved.</p>
          <p>Professional use only. Bookings subject to host approval and platform terms.</p>
        </div>
      </div>
    </footer>
  );
}
