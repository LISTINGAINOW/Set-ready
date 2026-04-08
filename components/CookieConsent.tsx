'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  buildCookieConsentState,
  defaultCookieConsentPreferences,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentPreferences,
} from '@/lib/cookie-consent';

type PreferenceKey = 'analytics' | 'marketing';

declare global {
  interface Window {
    plausible?: (...args: unknown[]) => void;
  }
}

const PLAUSIBLE_SCRIPT_ID = 'setvenue-plausible-script';
const PLAUSIBLE_DOMAIN = 'setvenue.com';

export default function CookieConsent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentPreferences>(defaultCookieConsentPreferences);
  const manageButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const storedConsent = readCookieConsent();
    if (storedConsent?.consentGiven) {
      setPreferences(storedConsent.preferences);
      setIsBannerVisible(false);
    } else {
      setPreferences(defaultCookieConsentPreferences());
      setIsBannerVisible(true);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof document === 'undefined') return;

    const existingScript = document.getElementById(PLAUSIBLE_SCRIPT_ID);

    if (preferences.analytics) {
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = PLAUSIBLE_SCRIPT_ID;
        script.defer = true;
        script.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
        script.src = 'https://plausible.io/js/script.js';
        document.head.appendChild(script);
      }
      return;
    }

    if (existingScript) {
      existingScript.remove();
    }

    delete window.plausible;
  }, [isLoaded, preferences.analytics]);

  useEffect(() => {
    if (!isPreferencesOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsPreferencesOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      manageButtonRef.current?.focus();
    };
  }, [isPreferencesOpen]);

  const canRender = isLoaded;
  const analyticsEnabled = preferences.analytics && !isBannerVisible;

  if (!canRender) {
    return null;
  }

  const savePreferences = (nextPreferences: CookieConsentPreferences) => {
    writeCookieConsent(
      buildCookieConsentState({
        analytics: nextPreferences.analytics,
        marketing: nextPreferences.marketing,
      })
    );
    setPreferences(nextPreferences);
    setIsBannerVisible(false);
    setIsPreferencesOpen(false);
  };

  const acceptAll = () => {
    savePreferences({ essential: true, analytics: true, marketing: true });
  };

  const updatePreference = (key: PreferenceKey, value: boolean) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <>
      {isBannerVisible ? (
        <section
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-20 z-[80] px-4 lg:bottom-6 lg:px-6"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="mx-auto max-w-3xl rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-sm lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Privacy</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">Cookie settings</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                  We use cookies to improve your experience. By continuing to use SetVenue, you agree to our use of cookies.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Read our{' '}
                  <Link href="/legal/privacy" className="font-semibold text-blue-600 underline underline-offset-4 hover:text-blue-700">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Accept All
                </button>
                <button
                  ref={manageButtonRef}
                  type="button"
                  onClick={() => setIsPreferencesOpen(true)}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Manage Preferences
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {isPreferencesOpen ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            aria-describedby="cookie-preferences-description"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Privacy</p>
                <h2 id="cookie-preferences-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                  Manage cookie preferences
                </h2>
                <p id="cookie-preferences-description" className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                  Choose which optional cookies SetVenue can use. Essential cookies are always on so the site can function securely.
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close cookie preferences"
                onClick={() => setIsPreferencesOpen(false)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              <PreferenceCard
                title="Essential"
                description="Required for security, session integrity, and core site functionality."
                checked
                disabled
                onChange={() => undefined}
              />
              <PreferenceCard
                title="Analytics"
                description="Helps us understand traffic and improve SetVenue. Plausible only loads after you allow analytics cookies."
                checked={preferences.analytics}
                onChange={(checked) => updatePreference('analytics', checked)}
              />
              <PreferenceCard
                title="Marketing"
                description="Stores your preference for future promotional or ad-related tools if they are added later."
                checked={preferences.marketing}
                onChange={(checked) => updatePreference('marketing', checked)}
              />
            </div>

            <div className="border-t border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => savePreferences({ essential: true, analytics: false, marketing: false })}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Save essentials only
                </button>
                <button
                  type="button"
                  onClick={() => savePreferences(preferences)}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {analyticsEnabled ? 'Analytics cookies enabled.' : 'Analytics cookies disabled.'}
      </span>
    </>
  );
}

type PreferenceCardProps = {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

function PreferenceCard({ title, description, checked, disabled = false, onChange }: PreferenceCardProps) {
  return (
    <label className="flex min-h-[44px] items-start gap-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="pt-1">
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          checked={checked}
          disabled={disabled}
          aria-label={`${title} cookies`}
          onChange={(event) => onChange(event.target.checked)}
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-950 sm:text-base">{title}</span>
          {disabled ? (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Always on
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </label>
  );
}
