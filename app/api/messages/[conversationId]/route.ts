import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireUserSession } from '@/lib/auth-middleware';
import { sanitizeInput } from '@/lib/security';

export const dynamic = 'force-dynamic';

// GET /api/messages/[conversationId] — fetch thread
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const userId = requireUserSession(request);
  if (typeof userId !== 'string') return userId;

  const { conversationId } = await params;
  const supabase = createAdminClient();

  // Verify user is a participant
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('id, property_id, property_name, host_id, guest_id, created_at, updated_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (convError || !conv) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  if (conv.host_id !== userId && conv.guest_id !== userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { data: messages, error: msgsError } = await supabase
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (msgsError) {
    console.error('messages fetch error', msgsError);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }

  return NextResponse.json({ conversation: conv, messages: messages ?? [] });
}

// POST /api/messages/[conversationId] — reply to thread
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const userId = requireUserSession(request);
  if (typeof userId !== 'string') return userId;

  const { conversationId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const messageBody = sanitizeInput(String(body.body ?? '')).slice(0, 4000);
  if (!messageBody) return NextResponse.json({ error: 'message body is required' }, { status: 400 });

  const supabase = createAdminClient();

  // Verify participant
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, host_id, guest_id')
    .eq('id', conversationId)
    .maybeSingle();

  if (!conv) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  if (conv.host_id !== userId && conv.guest_id !== userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { data: message, error: msgError } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: userId, body: messageBody })
    .select('id, sender_id, body, created_at')
    .single();

  if (msgError || !message) {
    console.error('messages reply error', msgError);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({ message }, { status: 201 });
}
