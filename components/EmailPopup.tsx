'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, ShieldCheck, X } from 'lucide-react';
import { isValidEmail, sanitizeEmail } from '@/lib/client-security';

const POPUP_DISMISSED_KEY = 'email-popup-dismissed';
const POPUP_SUBMITTED_KEY = 'email-popup-submitted';

const defaultPreferences = ['new-locations', 'deals'];

export default function EmailPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(POPUP_DISMISSED_KEY) === 'true' || window.localStorage.getItem(POPUP_SUBMITTED_KEY) === 'true') {
      return;
    }

    let opened = false;
    const openPopup = () => {
      if (opened) return;
      opened = true;
      setIsOpen(true);
      window.localStorage.setItem(POPUP_DISMISSED_KEY, 'true');
      window.removeEventListener('mouseout', onExitIntent);
      window.removeEventListener('scroll', onScroll);
    };

    const onExitIntent = (event: MouseEvent) => {
      if (event.clientY <= 12) {
        openPopup();
      }
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = window.scrollY / scrollable;
      if (progress >= 0.5) {
        openPopup();
      }
    };

    window.addEventListener('mouseout', onExitIntent);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('mouseout', onExitIntent);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const closePopup = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(POPUP_DISMISSED_KEY, 'true');
    }
    setIsOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = sanitizeEmail(email.trim()).toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!gdprConsent) {
      setError('Please confirm you want to receive newsletter emails.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          source: 'popup',
          preferences: defaultPreferences,
          gdprConsent: true,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error || 'Unable to subscribe right now.');
        setIsLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(POPUP_SUBMITTED_KEY, 'true');
      }
      setIsSubmitted(true);
      setEmail('');
    } catch {
      setError('Unable to subscribe right now.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const popupContent = isSubmitted ? (
    <div className="mt-6 space-y-4">
      <h2 className="text-3xl font-semibold tracking-[-0.05em] text-black">You’re almost in.</h2>
      <p className="text-sm leading-7 text-black/70 sm:text-base">
        We logged your signup and generated a double opt-in token server-side. Hook that into email delivery later, and you’re done.
      </p>
      <button
        type="button"
        onClick={closePopup}
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
      >
        Keep browsing
      </button>
    </div>
  ) : (
    <>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Newsletter</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black">Get new locations + exclusive deals</h2>
      <p className="mt-4 text-sm leading-7 text-black/70 sm:text-base">
        Join the list for fresh spaces, selective promos, and useful production tips. No spam. No selling your email.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label htmlFor="email-popup" className="sr-only">Email address</label>
        <input
          id="email-popup"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          className="min-h-[52px] w-full rounded-2xl border border-black/10 bg-[#FAFAFA] px-4 text-base text-black outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <label className="flex items-start gap-3 rounded-[22px] border border-black/10 bg-[#FAFAFA] p-4 text-sm text-black/70">
          <input
            type="checkbox"
            checked={gdprConsent}
            onChange={(event) => setGdprConsent(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-500"
          />
          <span>
            I agree to receive newsletter emails about new locations, deals, and production tips, and I understand I can unsubscribe anytime.
          </span>
        </label>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Saving…' : 'Join the newsletter'}
        </button>
      </form>

      <div className="mt-4 flex items-start gap-2 text-xs text-black/55">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p>
          GDPR-style consent required. Double opt-in token is logged, unsubscribe is one click, and preferences can be managed on the{' '}
          <Link href="/email-preferences" className="font-semibold text-blue-600 underline underline-offset-2">
            email preferences page
          </Link>
          .
        </p>
      </div>
    </>
  );

  return (
    <div className="email-popup-overlay fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/55 p-4 sm:items-center">
      <div className="email-popup-panel w-full max-w-md rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Mail className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={closePopup}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/60 transition hover:border-blue-200 hover:text-blue-600"
            aria-label="Close email signup popup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {popupContent}
      </div>
    </div>
  );
}
