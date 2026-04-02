/**
 * Host (property owner) authentication helpers.
 * Uses email + OTP verification code flow.
 * Sessions stored in host_sessions table (server-only, service role).
 */
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

const SESSION_TTL_HOURS = 24 * 7; // 7 days
const OTP_TTL_MINUTES = 15;
const OTP_LENGTH = 6;

// ─── OTP helpers ─────────────────────────────────────────────────────────────

export function generateOtp(): string {
  // 6-digit numeric code
  const num = parseInt(randomBytes(3).toString('hex'), 16) % 1_000_000;
  return String(num).padStart(OTP_LENGTH, '0');
}

export async function createOtp(email: string): Promise<string> {
  const supabase = createAdminClient();
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  // Invalidate old codes for this email
  await supabase.from('host_otps').delete().eq('email', email.toLowerCase());

  await supabase.from('host_otps').insert({
    email: email.toLowerCase(),
    code,
    expires_at: expiresAt,
  });

  return code;
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('host_otps')
    .select('id, code, expires_at, used')
    .eq('email', email.toLowerCase())
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return false;
  if (new Date(data.expires_at) < new Date()) return false;

  // Timing-safe compare
  const a = Buffer.from(data.code);
  const b = Buffer.from(code);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;

  // Mark used
  await supabase.from('host_otps').update({ used: true }).eq('id', data.id);
  return true;
}

// ─── Session helpers ──────────────────────────────────────────────────────────

function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export async function createHostSession(email: string): Promise<string> {
  const supabase = createAdminClient();
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000).toISOString();

  await supabase.from('host_sessions').insert({
    email: email.toLowerCase(),
    token,
    expires_at: expiresAt,
  });

  return token;
}

export async function verifyHostSession(token: string): Promise<string | null> {
  if (!token) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('host_sessions')
    .select('email, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (error || !data) return null;
  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('host_sessions').delete().eq('token', token);
    return null;
  }
  return data.email as string;
}

export async function deleteHostSession(token: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from('host_sessions').delete().eq('token', token);
}

// ─── Request middleware ───────────────────────────────────────────────────────

/**
 * Requires a valid host session cookie.
 * Returns the owner email string, or a 401 NextResponse.
 */
export async function requireHostSession(
  request: NextRequest
): Promise<string | NextResponse> {
  const token = request.cookies.get('host-session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Host authentication required' }, { status: 401 });
  }
  const email = await verifyHostSession(token);
  if (!email) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }
  return email;
}

/**
 * Gets owner email from host-session cookie. Returns null if not authed.
 * For use in Server Components (via cookies()).
 */
export async function getHostEmailFromCookie(cookieValue: string | undefined): Promise<string | null> {
  if (!cookieValue) return null;
  return verifyHostSession(cookieValue);
}
