import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, sanitizeUser, verifyUserEmail } from '@/lib/auth';
import { createSessionCookieValue, getClientIp, sanitizeEmail, sanitizeObject, validateCsrf, writeAuditLog } from '@/lib/security';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (!validateCsrf(request)) {
      writeAuditLog('auth.verify.csrf_failed', { ip });
      return NextResponse.json({ error: 'Security validation failed. Refresh the page and try again.' }, { status: 403 });
    }

    const body = sanitizeObject(await request.json());
    const email = sanitizeEmail(String(body.email || ''));
    const token = String(body.token || '').trim();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      writeAuditLog('auth.verify.failed', { ip, email, reason: 'user_not_found' });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      const response = NextResponse.json({ message: 'Email already verified', user: sanitizeUser(user) });
      response.cookies.set('ds-session', createSessionCookieValue(user.id), {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 30,
      });
      return response;
    }

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    if (user.verificationToken !== token) {
      writeAuditLog('auth.verify.failed', { ip, email, userId: user.id, reason: 'bad_token' });
      return NextResponse.json({ error: 'Invalid verification link' }, { status: 400 });
    }

    const updatedUser = await verifyUserEmail(email);
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
    }

    writeAuditLog('auth.verify.success', { ip, email, userId: user.id });

    const response = NextResponse.json({
      message: 'Email verified successfully. You now have access to protected routes.',
      user: sanitizeUser(updatedUser),
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
    console.error('Verify email error:', error);
    writeAuditLog('auth.verify.error', { ip, error: error instanceof Error ? error.message : 'unknown_error' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
