import { createHash, randomBytes, randomUUID } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { isValidEmail, sanitizeEmail, sanitizeInput } from '@/lib/security';

export const NEWSLETTER_FILE = join(process.cwd(), 'data', 'newsletter-subscribers.json');
export const EMAIL_TEMPLATES_FILE = join(process.cwd(), 'data', 'email-templates.json');

export const NEWSLETTER_CATEGORIES = ['new-locations', 'deals', 'production-tips'] as const;
export type NewsletterPreference = (typeof NEWSLETTER_CATEGORIES)[number];

export interface NewsletterSubscriber {
  id: string;
  email: string;
  signupDate: string;
  source: string;
  preferences: NewsletterPreference[];
  active: boolean;
  gdprConsent: boolean;
  status: 'pending' | 'active' | 'unsubscribed';
  doubleOptInToken: string;
  unsubscribeToken: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  updatedAt: string;
}

interface NewsletterStore {
  subscribers: NewsletterSubscriber[];
}

function uniqueToken() {
  return randomBytes(24).toString('hex');
}

function nowIso() {
  return new Date().toISOString();
}

export function sanitizePreferences(input: unknown): NewsletterPreference[] {
  if (!Array.isArray(input)) return ['new-locations', 'deals'];

  const unique = Array.from(
    new Set(
      input
        .map((value) => sanitizeInput(String(value || '')).toLowerCase())
        .filter((value): value is NewsletterPreference => NEWSLETTER_CATEGORIES.includes(value as NewsletterPreference))
    )
  );

  return unique.length ? unique : ['new-locations', 'deals'];
}

export function readNewsletterStore(): NewsletterStore {
  if (!existsSync(NEWSLETTER_FILE)) {
    return { subscribers: [] };
  }

  try {
    const parsed = JSON.parse(readFileSync(NEWSLETTER_FILE, 'utf8')) as Partial<NewsletterStore>;
    return { subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers as NewsletterSubscriber[] : [] };
  } catch {
    return { subscribers: [] };
  }
}

export function writeNewsletterStore(store: NewsletterStore) {
  writeFileSync(NEWSLETTER_FILE, JSON.stringify(store, null, 2) + '\n', 'utf8');
}

export function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'redacted';
  return `${local.slice(0, 2)}***@${domain}`;
}

export function createSubscriber(input: {
  email: string;
  source: string;
  preferences: unknown;
  gdprConsent: boolean;
}) {
  const email = sanitizeEmail(input.email);
  if (!isValidEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!input.gdprConsent) {
    throw new Error('GDPR consent is required to subscribe.');
  }

  const timestamp = nowIso();
  return {
    id: `sub_${randomUUID().slice(0, 8)}`,
    email,
    signupDate: timestamp,
    source: sanitizeInput(input.source).slice(0, 60) || 'unknown',
    preferences: sanitizePreferences(input.preferences),
    active: false,
    gdprConsent: true,
    status: 'pending' as const,
    doubleOptInToken: uniqueToken(),
    unsubscribeToken: uniqueToken(),
    confirmedAt: null,
    unsubscribedAt: null,
    updatedAt: timestamp,
  } satisfies NewsletterSubscriber;
}

export function findSubscriberByToken(token: string) {
  const cleanToken = sanitizeInput(token).trim();
  if (!cleanToken) return null;
  const store = readNewsletterStore();
  return store.subscribers.find(
    (subscriber) => subscriber.doubleOptInToken === cleanToken || subscriber.unsubscribeToken === cleanToken
  ) || null;
}

export function getSubscriberPublicProfile(subscriber: NewsletterSubscriber) {
  return {
    email: subscriber.email,
    source: subscriber.source,
    preferences: subscriber.preferences,
    active: subscriber.active,
    status: subscriber.status,
    signupDate: subscriber.signupDate,
    confirmedAt: subscriber.confirmedAt,
    unsubscribedAt: subscriber.unsubscribedAt,
    unsubscribeToken: subscriber.unsubscribeToken,
    doubleOptInToken: subscriber.doubleOptInToken,
  };
}

export function confirmSubscriber(token: string) {
  const cleanToken = sanitizeInput(token).trim();
  const store = readNewsletterStore();
  const subscriber = store.subscribers.find((entry) => entry.doubleOptInToken === cleanToken);
  if (!subscriber) return null;

  subscriber.active = true;
  subscriber.status = 'active';
  subscriber.confirmedAt = subscriber.confirmedAt || nowIso();
  subscriber.unsubscribedAt = null;
  subscriber.updatedAt = nowIso();
  writeNewsletterStore(store);
  return subscriber;
}

export function updateSubscriberByToken(token: string, updates: { preferences?: unknown; active?: boolean }) {
  const cleanToken = sanitizeInput(token).trim();
  const store = readNewsletterStore();
  const subscriber = store.subscribers.find((entry) => entry.unsubscribeToken === cleanToken || entry.doubleOptInToken === cleanToken);
  if (!subscriber) return null;

  if (updates.preferences !== undefined) {
    subscriber.preferences = sanitizePreferences(updates.preferences);
  }

  if (typeof updates.active === 'boolean') {
    subscriber.active = updates.active;
    subscriber.status = updates.active ? 'active' : 'unsubscribed';
    subscriber.confirmedAt = updates.active ? subscriber.confirmedAt || nowIso() : subscriber.confirmedAt;
    subscriber.unsubscribedAt = updates.active ? null : nowIso();
  }

  subscriber.updatedAt = nowIso();
  writeNewsletterStore(store);
  return subscriber;
}

export function upsertSubscriber(input: {
  email: string;
  source: string;
  preferences: unknown;
  gdprConsent: boolean;
}) {
  const email = sanitizeEmail(input.email);
  const store = readNewsletterStore();
  const existing = store.subscribers.find((subscriber) => subscriber.email === email);

  if (existing) {
    if (!input.gdprConsent) {
      throw new Error('GDPR consent is required to subscribe.');
    }

    existing.source = sanitizeInput(input.source).slice(0, 60) || existing.source;
    existing.preferences = sanitizePreferences(input.preferences);
    existing.gdprConsent = true;
    existing.updatedAt = nowIso();
    if (existing.status === 'unsubscribed') {
      existing.status = 'pending';
      existing.active = false;
      existing.unsubscribedAt = null;
      existing.doubleOptInToken = uniqueToken();
    }
    writeNewsletterStore(store);
    return { subscriber: existing, created: false };
  }

  const subscriber = createSubscriber(input);
  store.subscribers.push(subscriber);
  writeNewsletterStore(store);
  return { subscriber, created: true };
}

export function createOneClickUnsubscribeUrl(token: string) {
  return `/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex').slice(0, 16);
}
