import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createUser, findUserByEmail, hashPassword, sanitizeUser, UserRecord } from '@/lib/auth';
import { PASSWORD_RULES_MESSAGE, createSessionCookieValue, getClientIp, isStrongPassword, isValidEmail, recordAuthRateLimit, sanitizeEmail, sanitizeInput, sanitizeObject, validateCsrf, writeAuditLog } from '@/lib/security';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (!validateCsrf(request)) {
      writeAuditLog('auth.register.csrf_failed', { ip });
      return NextResponse.json({ error: 'Security validation failed. Refresh the page and try again.' }, { status: 403 });
    }

    const rateLimit = recordAuthRateLimit(ip, '/api/auth/register');
    if (rateLimit.blocked) {
      writeAuditLog('auth.register.rate_limited', { ip, resetInMs: rateLimit.resetInMs });
      return NextResponse.json({ error: 'Too many registration attempts. Please wait a few minutes and try again.' }, { status: 429 });
    }

    const body = sanitizeObject(await request.json());
    const firstName = sanitizeInput(String(body.firstName || ''));
    const lastName = sanitizeInput(String(body.lastName || ''));
    const email = sanitizeEmail(String(body.email || ''));
    const password = String(body.password || '');
    const confirmPassword = String(body.confirmPassword || '');

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      writeAuditLog('auth.register.validation_failed', { ip, reason: 'missing_fields', email });
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      writeAuditLog('auth.register.validation_failed', { ip, reason: 'invalid_email_format', email });
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: PASSWORD_RULES_MESSAGE }, { status: 400 });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      writeAuditLog('auth.register.duplicate', { ip, email });
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const verificationToken = randomBytes(24).toString('hex');
    const newUser: UserRecord = {
      id: randomBytes(16).toString('hex'),
      firstName,
      lastName,
      email,
      passwordHash: hashPassword(password),
      emailVerified: false,
      sessionVersion: 1,
      verificationToken,
      verificationSentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await createUser(newUser);
    writeAuditLog('auth.register.success', { ip, email, userId: newUser.id });

    // LOW-2: Use absolute URL with NEXT_PUBLIC_SITE_URL
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
    const verificationLink = `${siteUrl}/verify-email?email=${encodeURIComponent(newUser.email)}&token=${verificationToken}`;

    try {
      await sendVerificationEmail(newUser.email, newUser.firstName, verificationLink);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // CRIT-7: verificationLink is intentionally NOT included in the response —
    // it is only sent via email to prevent token leakage.
    const response = NextResponse.json(
      {
        message: 'Verification email sent. Please check your inbox.',
        user: sanitizeUser(newUser),
      },
      { status: 201 }
    );
    response.cookies.set('ds-session', createSessionCookieValue(newUser.id, newUser.sessionVersion), {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 30,
    });
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    writeAuditLog('auth.register.error', { ip, error: error instanceof Error ? error.message : 'unknown_error' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
