import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { sanitizeInput } from '@/lib/security';

export const EMAIL_CAMPAIGNS_FILE = join(process.cwd(), 'data', 'email-campaigns.json');
const EMAIL_CAMPAIGN_RATE_LIMIT_FILE = '/tmp/discreet-set-security/email-campaign-rate-limit.json';
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

export const EMAIL_CAMPAIGN_TYPES = [
  'guest_welcome',
  'host_onboarding',
  'abandoned_booking_recovery',
] as const;

export type EmailCampaignType = (typeof EMAIL_CAMPAIGN_TYPES)[number];

export interface EmailCampaignTemplate {
  campaign: EmailCampaignType;
  sequence: number;
  subject: string;
  body: string;
  sendDelay: string;
  active: boolean;
}

interface EmailCampaignStore {
  campaigns: EmailCampaignTemplate[];
}

function ensureRateLimitDir() {
  const dir = EMAIL_CAMPAIGN_RATE_LIMIT_FILE.split('/').slice(0, -1).join('/');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function hashIp(ip: string) {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export function sanitizeCampaignName(value: string) {
  const sanitized = sanitizeInput(value).toLowerCase();
  return EMAIL_CAMPAIGN_TYPES.includes(sanitized as EmailCampaignType)
    ? (sanitized as EmailCampaignType)
    : null;
}

export function sanitizeEmailCampaignTemplate(input: {
  campaign?: unknown;
  sequence?: unknown;
  subject?: unknown;
  body?: unknown;
  sendDelay?: unknown;
  active?: unknown;
}) {
  const campaign = sanitizeCampaignName(String(input.campaign || ''));
  const sequence = Number(input.sequence || 0);
  const subject = sanitizeInput(String(input.subject || '')).slice(0, 160);
  const body = sanitizeInput(String(input.body || '')).slice(0, 5000);
  const sendDelay = sanitizeInput(String(input.sendDelay || '')).slice(0, 60);
  const active = typeof input.active === 'boolean' ? input.active : true;

  if (!campaign) throw new Error('Invalid campaign name.');
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 20) throw new Error('Sequence must be an integer between 1 and 20.');
  if (!subject) throw new Error('Subject is required.');
  if (!body) throw new Error('Body is required.');
  if (!sendDelay) throw new Error('Send delay is required.');

  return {
    campaign,
    sequence,
    subject,
    body,
    sendDelay,
    active,
  } satisfies EmailCampaignTemplate;
}

export function readEmailCampaignStore(): EmailCampaignStore {
  if (!existsSync(EMAIL_CAMPAIGNS_FILE)) {
    return { campaigns: [] };
  }

  try {
    const parsed = JSON.parse(readFileSync(EMAIL_CAMPAIGNS_FILE, 'utf8')) as Partial<EmailCampaignStore>;
    return {
      campaigns: Array.isArray(parsed.campaigns) ? (parsed.campaigns as EmailCampaignTemplate[]) : [],
    };
  } catch {
    return { campaigns: [] };
  }
}

export function writeEmailCampaignStore(store: EmailCampaignStore) {
  writeFileSync(EMAIL_CAMPAIGNS_FILE, JSON.stringify(store, null, 2) + '\n', 'utf8');
}

export function getAllCampaignTemplates() {
  return readEmailCampaignStore().campaigns.sort((a, b) => {
    if (a.campaign === b.campaign) return a.sequence - b.sequence;
    return a.campaign.localeCompare(b.campaign);
  });
}

export function getCampaignTemplates(campaign: EmailCampaignType, activeOnly = false) {
  return getAllCampaignTemplates().filter(
    (template) => template.campaign === campaign && (!activeOnly || template.active)
  );
}

export function upsertCampaignTemplate(input: {
  campaign?: unknown;
  sequence?: unknown;
  subject?: unknown;
  body?: unknown;
  sendDelay?: unknown;
  active?: unknown;
}) {
  const template = sanitizeEmailCampaignTemplate(input);
  const store = readEmailCampaignStore();
  const existingIndex = store.campaigns.findIndex(
    (entry) => entry.campaign === template.campaign && entry.sequence === template.sequence
  );

  if (existingIndex >= 0) {
    store.campaigns[existingIndex] = template;
  } else {
    store.campaigns.push(template);
  }

  writeEmailCampaignStore(store);
  return template;
}

export function applyEmailCampaignRateLimit(ip: string) {
  ensureRateLimitDir();
  const now = Date.now();

  let store: Record<string, number[]> = {};
  if (existsSync(EMAIL_CAMPAIGN_RATE_LIMIT_FILE)) {
    try {
      store = JSON.parse(readFileSync(EMAIL_CAMPAIGN_RATE_LIMIT_FILE, 'utf8')) as Record<string, number[]>;
    } catch {
      store = {};
    }
  }

  const key = hashIp(ip);
  const recent = (store[key] || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  store[key] = recent;
  writeFileSync(EMAIL_CAMPAIGN_RATE_LIMIT_FILE, JSON.stringify(store), 'utf8');

  return {
    blocked: recent.length > MAX_REQUESTS_PER_WINDOW,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - recent.length),
    resetInMs: recent[0] ? RATE_LIMIT_WINDOW_MS - (now - recent[0]) : RATE_LIMIT_WINDOW_MS,
  };
}
