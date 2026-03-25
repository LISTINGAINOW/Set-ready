import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createHash, randomUUID } from 'crypto';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIp,
  isValidEmail,
  sanitizeEmail,
  sanitizeInput,
  validateCsrf,
  writeAuditLog,
} from '@/lib/security';

const LEADS_FILE = join(process.cwd(), 'data', 'leads.json');
const RATE_LIMIT_FILE = '/tmp/discreet-set-security/lead-rate-limit.json';
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_SUBMISSIONS_PER_HOUR = 5;
const PROPERTY_TYPES = ['House', 'Loft', 'Studio', 'Penthouse', 'Apartment', 'Villa', 'Warehouse', 'Outdoor', 'Other'] as const;

interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  propertyAddress: string;
  message: string;
  ownsOrManagesProperty: boolean;
  createdAt: string;
  submittedIpHash: string;
}

function ensureRateLimitDir() {
  const dir = RATE_LIMIT_FILE.split('/').slice(0, -1).join('/');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function hashIp(ip: string) {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'redacted';
  return `${local.slice(0, 2)}***@${domain}`;
}

function readLeadStore(): { leads: LeadRecord[] } {
  if (!existsSync(LEADS_FILE)) {
    return { leads: [] };
  }

  try {
    const parsed = JSON.parse(readFileSync(LEADS_FILE, 'utf8')) as { leads?: LeadRecord[] };
    return { leads: parsed.leads || [] };
  } catch {
    return { leads: [] };
  }
}

function writeLeadStore(store: { leads: LeadRecord[] }) {
  writeFileSync(LEADS_FILE, JSON.stringify(store, null, 2) + '\n', 'utf8');
}

function applyLeadRateLimit(ip: string) {
  ensureRateLimitDir();
  const now = Date.now();

  let store: Record<string, number[]> = {};
  if (existsSync(RATE_LIMIT_FILE)) {
    try {
      store = JSON.parse(readFileSync(RATE_LIMIT_FILE, 'utf8')) as Record<string, number[]>;
    } catch {
      store = {};
    }
  }

  const key = hashIp(ip);
  const recent = (store[key] || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  store[key] = recent;
  writeFileSync(RATE_LIMIT_FILE, JSON.stringify(store), 'utf8');

  return {
    blocked: recent.length > MAX_SUBMISSIONS_PER_HOUR,
    remaining: Math.max(0, MAX_SUBMISSIONS_PER_HOUR - recent.length),
    resetInMs: recent[0] ? RATE_LIMIT_WINDOW_MS - (now - recent[0]) : RATE_LIMIT_WINDOW_MS,
  };
}

function sanitizePhone(value: string) {
  return sanitizeInput(value).replace(/[^\d+()\-\s]/g, '').slice(0, 32);
}

function sanitizeAddress(value: string) {
  return sanitizeInput(value).replace(/[^\w\s#.,'\-/]/g, '').slice(0, 200);
}

function sanitizeMessage(value: string) {
  return sanitizeInput(value).replace(/[{}$`]/g, '').slice(0, 1000);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (!validateCsrf(request)) {
      writeAuditLog('lead.csrf_failed', { ip });
      return NextResponse.json({ error: 'Security validation failed. Refresh the page and try again.' }, { status: 403 });
    }

    const rateLimit = applyLeadRateLimit(ip);
    if (rateLimit.blocked) {
      writeAuditLog('lead.rate_limited', { ipHash: hashIp(ip), resetInMs: rateLimit.resetInMs });
      return NextResponse.json(
        { error: 'Too many submissions from this IP. Please wait and try again later.' },
        { status: 429 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const name = sanitizeInput(String(body.name || '')).slice(0, 120);
    const email = sanitizeEmail(String(body.email || ''));
    const phone = sanitizePhone(String(body.phone || ''));
    const propertyType = sanitizeInput(String(body.propertyType || '')).slice(0, 40);
    const propertyAddress = sanitizeAddress(String(body.propertyAddress || ''));
    const message = sanitizeMessage(String(body.message || ''));
    const ownsOrManagesProperty = Boolean(body.ownsOrManagesProperty);

    if (!name || !email || !propertyType) {
      return NextResponse.json({ error: 'Name, email, and property type are required.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!PROPERTY_TYPES.includes(propertyType as (typeof PROPERTY_TYPES)[number])) {
      return NextResponse.json({ error: 'Please select a valid property type.' }, { status: 400 });
    }

    const lead: LeadRecord = {
      id: `lead_${randomUUID().slice(0, 8)}`,
      name,
      email,
      phone,
      propertyType,
      propertyAddress,
      message,
      ownsOrManagesProperty,
      createdAt: new Date().toISOString(),
      submittedIpHash: hashIp(ip),
    };

    const store = readLeadStore();
    store.leads.push(lead);
    writeLeadStore(store);

    writeAuditLog('lead.created', {
      leadId: lead.id,
      ipHash: lead.submittedIpHash,
      propertyType: lead.propertyType,
      contact: maskEmail(lead.email),
      ownsOrManagesProperty: lead.ownsOrManagesProperty,
    });

    writeAuditLog('lead.confirmation_email.logged', {
      leadId: lead.id,
      contact: maskEmail(lead.email),
      template: 'host-interest-confirmation',
    });

    return NextResponse.json({ ok: true, redirectTo: '/interest/thank-you' }, { status: 201 });
  } catch (error) {
    console.error('Lead capture error:', error);
    writeAuditLog('lead.error', { ipHash: hashIp(ip), error: error instanceof Error ? error.message : 'unknown_error' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
