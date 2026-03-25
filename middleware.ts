import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const GENERAL_API_LIMIT = 120;
const AUTH_API_LIMIT = 20;
const rateLimitStore = new Map<string, number[]>();

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function getRateLimitKey(request: NextRequest) {
  const ip = getClientIp(request);
  const scope = request.nextUrl.pathname.startsWith('/api/auth') ? 'auth' : request.nextUrl.pathname;
  return `${scope}:${ip}`;
}

function applyRateLimit(key: string, limit: number) {
  const now = Date.now();
  const recent = (rateLimitStore.get(key) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateLimitStore.set(key, recent);

  return {
    blocked: recent.length > limit,
    remaining: Math.max(0, limit - recent.length),
    reset: recent[0] ? recent[0] + RATE_LIMIT_WINDOW_MS : now + RATE_LIMIT_WINDOW_MS,
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
  const limit = pathname.startsWith('/api/auth') ? AUTH_API_LIMIT : GENERAL_API_LIMIT;
  const rateLimit = applyRateLimit(getRateLimitKey(request), limit);

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
