import { NextRequest, NextResponse } from 'next/server';
import { deleteHostSession } from '@/lib/host-auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('host-session')?.value;
  if (token) {
    await deleteHostSession(token);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set('host-session', '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
