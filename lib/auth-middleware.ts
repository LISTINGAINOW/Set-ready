/**
 * Shared authentication middleware helpers.
 * - requireUserSession: validates ds-session cookie (custom user auth)
 * - requireAdminSession: validates admin-session cookie (admin auth)
 */
import { createHash, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ─── User session ────────────────────────────────────────────────────────────

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET environment variable is not set');
  return secret;
}

function signPayload(payload: string, secret: string): string {
  return createHash('sha256').update(`${payload}.${secret}`).digest('hex');
}

/**
 * Parses and verifies a ds-session cookie value.
 * Format: `${userId}.${issuedAt}.${nonce}.${signature}`
 * Returns the userId on success, null on failure.
 */
export function verifySessionCookie(cookieValue: string): string | null {
  try {
    const secret = getSessionSecret();
    const parts = cookieValue.split('.');
    if (parts.length < 4) return null;

    // Last part is the signature; everything before it is the payload
    const signature = parts[parts.length - 1];
    const payload = parts.slice(0, -1).join('.');
    const expected = signPayload(payload, secret);

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;

    // First segment is userId
    return parts[0];
  } catch {
    return null;
  }
}

/**
 * Requires an authenticated user session.
 * Returns the authenticated userId string, or a 401 NextResponse.
 */
export function requireUserSession(
  request: NextRequest
): string | NextResponse {
  const cookieValue = request.cookies.get('ds-session')?.value;
  if (!cookieValue) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const userId = verifySessionCookie(cookieValue);
  if (!userId) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }
  return userId;
}

// ─── Admin session ───────────────────────────────────────────────────────────

function getAdminSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('ADMIN_PASSWORD environment variable is not set');
  return secret;
}

function signAdminToken(nonce: string): string {
  const secret = getAdminSecret();
  return createHash('sha256').update(`admin.${nonce}.${secret}`).digest('hex');
}

/**
 * Creates a signed admin session token: `${nonce}.${signature}`
 */
export function createAdminSessionToken(): string {
  const { randomBytes } = require('crypto') as typeof import('crypto');
  const nonce = randomBytes(16).toString('hex');
  const sig = signAdminToken(nonce);
  return `${nonce}.${sig}`;
}

/**
 * Verifies an admin session token string.
 */
export function verifyAdminToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [nonce, signature] = parts;
    const expected = signAdminToken(nonce);
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return false;
    return timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * Requires an authenticated admin session cookie.
 * Returns true on success, or a 401 NextResponse.
 */
export function requireAdminSession(
  request: NextRequest
): true | NextResponse {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    // Fail-closed: if no ADMIN_PASSWORD is configured, deny all access
    return NextResponse.json({ error: 'Admin access not configured' }, { status: 503 });
  }

  const token = request.cookies.get('admin-session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
  }
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Invalid or expired admin session' }, { status: 401 });
  }
  return true;
}
