import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp, createHostSession } from '@/lib/host-auth';

const SESSION_TTL_DAYS = 7;

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const valid = await verifyOtp(normalizedEmail, code.trim());

    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired code. Please try again.' }, { status: 401 });
    }

    const token = await createHostSession(normalizedEmail);
    const response = NextResponse.json({ ok: true });

    response.cookies.set('host-session', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * SESSION_TTL_DAYS,
    });

    return response;
  } catch (err) {
    console.error('Host verify-otp error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
