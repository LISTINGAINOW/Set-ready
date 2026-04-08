import { NextRequest, NextResponse } from 'next/server';
import { findUserByPasswordResetToken, hashPassword, updateUserPassword } from '@/lib/auth';
import { PASSWORD_RULES_MESSAGE, getClientIp, isStrongPassword, recordAuthRateLimit, sanitizeInput, validateCsrf, writeAuditLog } from '@/lib/security';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (!validateCsrf(request)) {
      writeAuditLog('auth.reset_password.csrf_failed', { ip });
      return NextResponse.json({ error: 'Security validation failed. Refresh the page and try again.' }, { status: 403 });
    }

    const rateLimit = recordAuthRateLimit(ip, '/api/auth/reset-password');
    if (rateLimit.blocked) {
      writeAuditLog('auth.reset_password.rate_limited', { ip, resetInMs: rateLimit.resetInMs });
      return NextResponse.json({ error: 'Too many reset attempts. Please wait and try again.' }, { status: 429 });
    }

    const body = await request.json();
    const token = sanitizeInput(String(body.token || ''));
    const newPassword = String(body.newPassword || '');

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    if (!isStrongPassword(newPassword)) {
      return NextResponse.json({ error: PASSWORD_RULES_MESSAGE }, { status: 400 });
    }

    const user = await findUserByPasswordResetToken(token);
    if (!user || !user.resetPasswordExpiresAt) {
      writeAuditLog('auth.reset_password.failed', { ip, reason: 'invalid_token' });
      return NextResponse.json({ error: 'This password reset link is invalid or has expired.' }, { status: 400 });
    }

    if (new Date(user.resetPasswordExpiresAt).getTime() < Date.now()) {
      writeAuditLog('auth.reset_password.failed', { ip, userId: user.id, reason: 'expired_token' });
      return NextResponse.json({ error: 'This password reset link is invalid or has expired.' }, { status: 400 });
    }

    await updateUserPassword(user.id, hashPassword(newPassword));
    writeAuditLog('auth.reset_password.success', { ip, userId: user.id, email: user.email });

    return NextResponse.json({ message: 'Your password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    writeAuditLog('auth.reset_password.error', { ip, error: error instanceof Error ? error.message : 'unknown_error' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
