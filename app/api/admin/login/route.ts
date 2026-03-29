import { NextRequest, NextResponse } from 'next/server';
import { createAdminSessionToken } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ ok: false, error: 'Admin access not configured' }, { status: 503 });
    }
    const { password } = await request.json();
    if (password !== adminPassword) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const token = createAdminSessionToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set('admin-session', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
