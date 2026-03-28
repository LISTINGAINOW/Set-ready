import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

// Windows
const WINDOW_1MIN = 60 * 1000;
const WINDOW_15MIN = 15 * 60 * 1000;

// Limits
const FORM_SUBMISSION_LIMIT = 10;  // POST form endpoints — 10 per minute
const READ_LIMIT = 30;              // GET API endpoints — 30 per minute
const AUTH_API_LIMIT = 20;          // Auth endpoints — 20 per 15 minutes (brute-force protection)
const GENERAL_API_LIMIT = 120;      // Everything else — 120 per 15 minutes

const rateLimitStore = new Map<string, number[]>();

// Routes that accept form submissions (writes)
const FORM_ROUTES = [
  '/api/inquiries',
  '/api/bookings',
  '/api/newsletter',
  '/api/contact',
  '/api/owner/listings',
  '/api/payments',
  '/api/interest',
  '/api/bid',
];

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function getRateLimitConfig(request: NextRequest): { key: string; limit: number; windowMs: number } {
  const ip = getClientIp(request);
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  if (pathname.startsWith('/api/auth')) {
    return { key: `auth:${ip}`, limit: AUTH_API_LIMIT, windowMs: WINDOW_15MIN };
  }

  const isFormSubmission = method === 'POST' || method === 'PUT' || method === 'PATCH';
  const isFormRoute = FORM_ROUTES.some((route) => pathname.startsWith(route));

  if (isFormSubmission && isFormRoute) {
    return { key: `form:${pathname}:${ip}`, limit: FORM_SUBMISSION_LIMIT, windowMs: WINDOW_1MIN };
  }

  if (method === 'GET' && pathname.startsWith('/api/')) {
    return { key: `read:${pathname}:${ip}`, limit: READ_LIMIT, windowMs: WINDOW_1MIN };
  }

  return { key: `general:${pathname}:${ip}`, limit: GENERAL_API_LIMIT, windowMs: WINDOW_15MIN };
}

function applyRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (rateLimitStore.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  recent.push(now);
  rateLimitStore.set(key, recent);

  return {
    blocked: recent.length > limit,
    remaining: Math.max(0, limit - recent.length),
    reset: recent[0] ? recent[0] + windowMs : now + windowMs,
  };
}

function buildSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith('/api/');
  const { key, limit, windowMs } = getRateLimitConfig(request);
  const rateLimit = applyRateLimit(key, limit, windowMs);

  if (isApiRoute && rateLimit.blocked) {
    const retryAfter = Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000));
    const response = NextResponse.json(
      {
        error: 'Too many requests from this IP. Please slow down and try again shortly.',
        retryAfter,
      },
      { status: 429 }
    );
    response.headers.set('Retry-After', String(retryAfter));
    response.headers.set('X-RateLimit-Limit', String(limit));
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimit.reset / 1000)));
    return buildSecurityHeaders(response);
  }

  let response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimit.reset / 1000)));

  if (!request.cookies.get('csrf-token')) {
    const token = crypto.randomUUID().replace(/-/g, '');
    response.cookies.set('csrf-token', token, {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
  }

  response = await updateSession(request, response);

  return buildSecurityHeaders(response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)'],
};
