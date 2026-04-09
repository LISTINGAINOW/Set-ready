import { NextRequest, NextResponse } from 'next/server';
import { validateCsrf } from '@/lib/security';

export async function POST(request: NextRequest) {
  const csrfValid = validateCsrf(request);
  const response = csrfValid
    ? NextResponse.json({ success: true })
    : NextResponse.json(
        { error: 'Security validation failed. Refresh the page and try again.' },
        { status: 403 }
      );

  response.cookies.set('ds-session', '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  if (!csrfValid) {
    console.warn('[auth/logout] CSRF validation failed; cleared ds-session cookie anyway.');
  }

  return response;
}