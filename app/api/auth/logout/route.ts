import { NextRequest, NextResponse } from 'next/server';
import { validateCsrf } from '@/lib/security';

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: 'Security validation failed. Refresh the page and try again.' }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('ds-session', '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}