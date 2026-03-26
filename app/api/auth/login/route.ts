import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, sanitizeUser, verifyPassword } from '@/lib/auth';
import { createSessionCookieValue, getClientIp, isValidEmail, recordAuthRateLimit, sanitizeEmail, sanitizeObject, validateCsrf, writeAuditLog } from '@/lib/security';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (!validateCsrf(request)) {
      writeAuditLog('auth.login.csrf_failed', { ip });
      return NextResponse.json({ error: 'Security validation failed. Refresh the page and try again.' }, { status: 403 });
    }

    const rateLimit = recordAuthRateLimit(ip, '/api/auth/login');
    if (rateLimit.blocked) {
      writeAuditLog('auth.login.rate_limited', { ip, resetInMs: rateLimit.resetInMs });
      return NextResponse.json({ error: 'Too many login attempts. Please wait a few minutes and try again.' }, { status: 429 });
    }

    const body = sanitizeObject(await request.json());
    const email = sanitizeEmail(String(body.email || ''));
    const password = String(body.password || '');

    if (!email || !password) {
      writeAuditLog('auth.login.validation_failed', { ip, reason: 'missing_fields' });
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      writeAuditLog('auth.login.validation_failed', { ip, reason: 'invalid_email_format', email });
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      writeAuditLog('auth.login.failed', { ip, email, reason: 'unknown_user' });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!verifyPassword(password, user.passwordHash)) {
      writeAuditLog('auth.login.failed', { ip, email, userId: user.id, reason: 'bad_password' });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.emailVerified) {
      writeAuditLog('auth.login.unverified', { ip, email, userId: user.id });
      return NextResponse.json(
        {
          error: 'Please verify your email before accessing protected routes.',
          requiresVerification: true,
          verificationLink: user.verificationToken
            ? `/verify-email?email=${encodeURIComponent(user.email)}&token=${user.verificationToken}`
            : `/verify-email?email=${encodeURIComponent(user.email)}`,
          user: sanitizeUser(user),
        },
        { status: 403 }
      );
    }

    writeAuditLog('auth.login.success', { ip, email, userId: user.id });
    const response = NextResponse.json({
      message: 'Login successful',
      user: sanitizeUser(user),
    });
    response.cookies.set('ds-session', createSessionCookieValue(user.id), {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 30,
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    writeAuditLog('auth.login.error', { ip, error: error instanceof Error ? error.message : 'unknown_error' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
