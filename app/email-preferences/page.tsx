import type { Metadata } from 'next';
import NewsletterPreferencesManager from '@/components/NewsletterPreferencesManager';
import { findSubscriberByToken, getSubscriberPublicProfile } from '@/lib/newsletter';

export const metadata: Metadata = {
  title: 'Email Preferences | SetVenue',
  description: 'Manage your SetVenue newsletter categories, subscription status, and one-click unsubscribe settings.',
};

type PageProps = {
  searchParams?: Promise<{
    token?: string;
    unsubscribed?: string;
    error?: string;
  }>;
};

export default async function EmailPreferencesPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const token = params.token || '';
  const subscriber = token ? findSubscriberByToken(token) : null;

  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <NewsletterPreferencesManager
          initialSubscriber={subscriber ? getSubscriberPublicProfile(subscriber) : null}
          unsubscribed={params.unsubscribed === '1'}
          error={params.error}
        />
      </div>
    </main>
  );
}
