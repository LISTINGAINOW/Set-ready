import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { NextRequest } from 'next/server';

const AUDIT_DIR = '/tmp/discreet-set-security';
const AUDIT_LOG_FILE = join(AUDIT_DIR, 'audit.log');
const RATE_LIMIT_FILE = join(AUDIT_DIR, 'rate-limit-store.json');
const CSRF_HEADER = 'x-csrf-token';
const SESSION_SECRET = process.env.SESSION_SECRET || 'discreet-set-session-secret';

export const PASSWORD_RULES_MESSAGE = 'Password must be at least 8 characters and include uppercase, lowercase, and a number.';

export function sanitizeInput(value: string) {
  return value
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeEmail(email: string) {
  return sanitizeInput(email).toLowerCase();
}

export function sanitizeObject<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (typeof value === 'string') return [key, sanitizeInput(value)];
      if (Array.isArray(value)) return [key, value.map((item) => (typeof item === 'string' ? sanitizeInput(item) : item))];
      if (value && typeof value === 'object') return [key, sanitizeObject(value as Record<string, unknown>)];
      return [key, value];
    })
  ) as T;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizeEmail(email));
}

export function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

export function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score, label: 'Weak' };
  if (score <= 4) return { score, label: 'Medium' };
  return { score, label: 'Strong' };
}

function ensureAuditDir() {
  if (!existsSync(AUDIT_DIR)) mkdirSync(AUDIT_DIR, { recursive: true });
}

export function writeAuditLog(action: string, details: Record<string, unknown> = {}) {
  ensureAuditDir();
  appendFileSync(
    AUDIT_LOG_FILE,
    JSON.stringify({ timestamp: new Date().toISOString(), action, ...details }) + '\n',
    'utf8'
  );
}

export function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function signSessionValue(value: string) {
  return createHash('sha256').update(`${value}.${SESSION_SECRET}`).digest('hex');
}

export function createSessionCookieValue(userId: string) {
  const issuedAt = Date.now().toString();
  const nonce = randomBytes(12).toString('hex');
  const payload = `${userId}.${issuedAt}.${nonce}`;
  const signature = signSessionValue(payload);
  return `${payload}.${signature}`;
}

export function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function validateCsrf(request: NextRequest) {
  const cookieToken = request.cookies.get('csrf-token')?.value;
  const headerToken = request.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken) return false;

  const a = Buffer.from(cookieToken);
  const b = Buffer.from(headerToken);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b) && isSameOriginRequest(request);
}

export function recordAuthRateLimit(ip: string, route: string) {
  ensureAuditDir();
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = route.includes('/login') ? 10 : 20;

  let store: Record<string, number[]> = {};
  if (existsSync(RATE_LIMIT_FILE)) {
    try {
      store = JSON.parse(readFileSync(RATE_LIMIT_FILE, 'utf8'));
    } catch {
      store = {};
    }
  }

  const key = `${route}:${ip}`;
  const recent = (store[key] || []).filter((ts) => now - ts < windowMs);
  recent.push(now);
  store[key] = recent;
  writeFileSync(RATE_LIMIT_FILE, JSON.stringify(store), 'utf8');

  return {
    blocked: recent.length > maxAttempts,
    remaining: Math.max(0, maxAttempts - recent.length),
    resetInMs: recent.length ? windowMs - (now - recent[0]) : windowMs,
  };
}
