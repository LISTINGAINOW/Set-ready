import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { NextRequest } from 'next/server';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set. Set it to a strong random value.');
  }
  return secret;
}

const RATE_LIMIT_DIR = '/tmp/discreet-set-security';
const RATE_LIMIT_FILE = join(RATE_LIMIT_DIR, 'rate-limit-store.json');
const CSRF_HEADER = 'x-csrf-token';

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

export function writeAuditLog(action: string, details: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), action, ...details }));
}

export function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function signSessionValue(value: string) {
  return createHash('sha256').update(`${value}.${getSessionSecret()}`).digest('hex');
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

function ensureRateLimitDir() {
  if (!existsSync(RATE_LIMIT_DIR)) mkdirSync(RATE_LIMIT_DIR, { recursive: true });
}

function loadRateLimitStore() {
  ensureRateLimitDir();

  if (!existsSync(RATE_LIMIT_FILE)) {
    return {} as Record<string, number[]>;
  }

  try {
    return JSON.parse(readFileSync(RATE_LIMIT_FILE, 'utf8')) as Record<string, number[]>;
  } catch {
    return {} as Record<string, number[]>;
  }
}

function saveRateLimitStore(store: Record<string, number[]>) {
  ensureRateLimitDir();
  writeFileSync(RATE_LIMIT_FILE, JSON.stringify(store), 'utf8');
}

export function recordRateLimit(key: string, maxAttempts: number, windowMs: number) {
  const now = Date.now();
  const store = loadRateLimitStore();
  const recent = (store[key] || []).filter((ts) => now - ts < windowMs);
  recent.push(now);
  store[key] = recent;
  saveRateLimitStore(store);

  return {
    blocked: recent.length > maxAttempts,
    remaining: Math.max(0, maxAttempts - recent.length),
    resetInMs: recent.length ? windowMs - (now - recent[0]) : windowMs,
  };
}

export function recordAuthRateLimit(ip: string, route: string) {
  const isLogin = route.includes('/login');
  const windowMs = isLogin ? 15 * 60 * 1000 : 60 * 60 * 1000;
  const maxAttempts = isLogin ? 5 : 3;
  return recordRateLimit(`${route}:${ip}`, maxAttempts, windowMs);
}

export function recordEmailRateLimit(email: string, route: string, maxAttempts = 3, windowMs = 60 * 60 * 1000) {
  return recordRateLimit(`${route}:email:${sanitizeEmail(email)}`, maxAttempts, windowMs);
}
