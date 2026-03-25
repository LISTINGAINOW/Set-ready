'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';

type PreferenceKey = 'new-locations' | 'deals' | 'production-tips';

type SubscriberProfile = {
  email: string;
  source: string;
  preferences: PreferenceKey[];
  active: boolean;
  status: 'pending' | 'active' | 'unsubscribed';
  signupDate: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  unsubscribeToken: string;
  doubleOptInToken: string;
};

const preferenceOptions: Array<{ key: PreferenceKey; label: string; description: string }> = [
  { key: 'new-locations', label: 'New locations', description: 'Fresh listings and newly available spaces.' },
  { key: 'deals', label: 'Deals', description: 'Promotions, booking discounts, and first-look offers.' },
  { key: 'production-tips', label: 'Production tips', description: 'Useful notes for scouting, hosting, and booking smoothly.' },
];

export default function NewsletterPreferencesManager({
  initialSubscriber,
  unsubscribed,
  error,
}: {
  initialSubscriber: SubscriberProfile | null;
  unsubscribed?: boolean;
  error?: string;
}) {
  const [subscriber, setSubscriber] = useState(initialSubscriber);
  const [selected, setSelected] = useState<PreferenceKey[]>(initialSubscriber?.preferences || ['new-locations', 'deals']);
  const [active, setActive] = useState(initialSubscriber?.active ?? true);
  const [status, setStatus] = useState<string>(unsubscribed ? 'You’ve been unsubscribed.' : '');
  const [isSaving, setIsSaving] = useState(false);

  const token = useMemo(() => subscriber?.unsubscribeToken || subscriber?.doubleOptInToken || '', [subscriber]);

  const togglePreference = (value: PreferenceKey) => {
    setSelected((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  const savePreferences = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setStatus('');

    const response = await fetch('/api/newsletter', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, preferences: selected, active }),
    });

    const payload = (await response.json()) as { error?: string; subscriber?: SubscriberProfile };

    setIsSaving(false);
    if (!response.ok || !payload.subscriber) {
      setStatus(payload.error || 'Could not update preferences.');
      return;
    }

    setSubscriber(payload.subscriber);
    setActive(payload.subscriber.active);
    setSelected(payload.subscriber.preferences);
    setStatus(payload.subscriber.active ? 'Preferences updated.' : 'You’ve been unsubscribed.');
  };

  const unsubscribeNow = async () => {
    if (!subscriber?.unsubscribeToken) return;
    setIsSaving(true);
    setStatus('');

    const response = await fetch('/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: subscriber.unsubscribeToken }),
    });

    const payload = (await response.json()) as { error?: string; subscriber?: SubscriberProfile };
    setIsSaving(false);

    if (!response.ok || !payload.subscriber) {
      setStatus(payload.error || 'Could not unsubscribe.');
      return;
    }

    setSubscriber(payload.subscriber);
    setActive(false);
    setStatus('You’ve been unsubscribed.');
  };

  if (!subscriber) {
    return (
      <div className="rounded-[28px] border border-black bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Email preferences</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-black sm:text-4xl">Manage your newsletter settings</h1>
        <p className="mt-5 text-base leading-7 text-black/70">
          {error === 'invalid-token' || error === 'missing-token'
            ? 'That subscription link is missing or invalid.'
            : 'Open this page from your email preferences link to manage your subscription.'}
        </p>
        <div className="mt-6 text-sm text-black/65">
          Need help? <Link href="/contact" className="font-semibold text-blue-600">Contact support</Link>.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-black bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Email preferences</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">Control what lands in your inbox</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-black/72 sm:text-lg">
        Update categories, pause emails, or unsubscribe in one click. We do not sell your email, and you can leave anytime.
      </p>

      <div className="mt-8 rounded-[24px] border border-blue-100 bg-blue-50/70 p-5 text-sm text-black/70">
        <p><span className="font-semibold text-black">Subscriber:</span> {subscriber.email}</p>
        <p className="mt-2"><span className="font-semibold text-black">Source:</span> {subscriber.source}</p>
        <p className="mt-2"><span className="font-semibold text-black">Status:</span> {subscriber.status}</p>
      </div>

      <form onSubmit={savePreferences} className="mt-8 space-y-5">
        <div className="space-y-4">
          {preferenceOptions.map((option) => (
            <label key={option.key} className="flex cursor-pointer items-start gap-4 rounded-[24px] border border-black bg-[#FAFAFA] p-5">
              <input
                type="checkbox"
                checked={selected.includes(option.key)}
                onChange={() => togglePreference(option.key)}
                className="mt-1 h-4 w-4 rounded border-black text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-base font-semibold text-black">{option.label}</div>
                <div className="mt-1 text-sm leading-6 text-black/65">{option.description}</div>
              </div>
            </label>
          ))}
        </div>

        <label className="flex items-start gap-3 rounded-[24px] border border-black bg-white p-5">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-black text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="text-base font-semibold text-black">Keep me subscribed</div>
            <div className="mt-1 text-sm leading-6 text-black/65">
              Turn this off to stop all newsletter emails without deleting your preferences.
            </div>
          </div>
        </label>

        {status ? (
          <div className={`rounded-[20px] px-4 py-3 text-sm font-medium ${status.toLowerCase().includes('could not') || status.toLowerCase().includes('invalid') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
            {status}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save preferences'}
          </button>
          <button
            type="button"
            onClick={unsubscribeNow}
            disabled={isSaving}
            className="rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            One-click unsubscribe
          </button>
        </div>
      </form>
    </div>
  );
}
