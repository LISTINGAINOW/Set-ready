import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-middleware';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const MESSAGES_FILE = join(process.cwd(), 'data', 'messages.json');

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAdminSession(request);
  if (auth !== true) return auth;

  try {
    const data = JSON.parse(readFileSync(MESSAGES_FILE, 'utf-8'));
    const idx = data.conversations.findIndex((c: { id: string }) => c.id === params.id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    data.conversations[idx].unreadCount = 0;
    writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ conversation: data.conversations[idx] });
  } catch (err) {
    console.error('Message update error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
