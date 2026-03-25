import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { hashPassword, readUsers, sanitizeUser, UserRecord, writeUsers } from '@/lib/auth';
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

    const users = readUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
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
      verificationToken,
      verificationSentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);
    writeAuditLog('auth.register.success', { ip, email, userId: newUser.id });

    const verificationLink = `/verify-email?email=${encodeURIComponent(newUser.email)}&token=${verificationToken}`;

    try {
      await sendVerificationEmail(newUser.email, newUser.firstName, verificationLink);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    const response = NextResponse.json(
      {
        message: 'Verification email sent. Please check your inbox.',
        user: sanitizeUser(newUser),
        verificationLink,
      },
      { status: 201 }
    );
    response.cookies.set('ds-session', createSessionCookieValue(newUser.id), {
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
