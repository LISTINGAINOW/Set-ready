import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { findUserByEmail, hashAuthToken, setUserPasswordResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { getClientIp, isValidEmail, recordAuthRateLimit, recordEmailRateLimit, sanitizeEmail, sanitizeObject, validateCsrf, writeAuditLog } from '@/lib/security';

const GENERIC_SUCCESS_MESSAGE = 'If an account exists for that email, we’ve sent password reset instructions.';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (!validateCsrf(request)) {
      writeAuditLog('auth.forgot_password.csrf_failed', { ip });
      return NextResponse.json({ error: 'Security validation failed. Refresh the page and try again.' }, { status: 403 });
    }

    const ipRateLimit = recordAuthRateLimit(ip, '/api/auth/forgot-password');
    if (ipRateLimit.blocked) {
      writeAuditLog('auth.forgot_password.rate_limited_ip', { ip, resetInMs: ipRateLimit.resetInMs });
      return NextResponse.json({ error: 'Too many reset requests. Please wait and try again.' }, { status: 429 });
    }

    const body = sanitizeObject(await request.json());
    const email = sanitizeEmail(String(body.email || ''));

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const emailRateLimit = recordEmailRateLimit(email, '/api/auth/forgot-password');
    if (emailRateLimit.blocked) {
      writeAuditLog('auth.forgot_password.rate_limited_email', { ip, email, resetInMs: emailRateLimit.resetInMs });
      return NextResponse.json({ error: 'Too many reset requests. Please wait and try again.' }, { status: 429 });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      writeAuditLog('auth.forgot_password.requested_unknown_email', { ip, email });
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await setUserPasswordResetToken(user.id, hashAuthToken(token), expiresAt);

    try {
      await sendPasswordResetEmail(user.email, user.firstName, `/reset-password?token=${encodeURIComponent(token)}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      writeAuditLog('auth.forgot_password.email_send_failed', {
        ip,
        email,
        userId: user.id,
        error: emailError instanceof Error ? emailError.message : 'unknown_error',
      });
    }

    writeAuditLog('auth.forgot_password.requested', { ip, email, userId: user.id });
    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
  } catch (error) {
    console.error('Forgot password error:', error);
    writeAuditLog('auth.forgot_password.error', { ip, error: error instanceof Error ? error.message : 'unknown_error' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
