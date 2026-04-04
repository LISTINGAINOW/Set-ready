export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireUserSession } from '@/lib/auth-middleware';
import { sanitizeInput, writeAuditLog } from '@/lib/security';

/**
 * GET /api/conversations/[id]/messages
 * Fetch all messages in a conversation thread (must be participant).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userIdOrResponse = requireUserSession(request);
  if (typeof userIdOrResponse !== 'string') return userIdOrResponse;
  const userId = userIdOrResponse;

  const { id: conversationId } = await params;

  try {
    const supabase = createAdminClient();

    // Verify user is a participant
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id, property_id, property_name, host_id, guest_id, created_at, updated_at')
      .eq('id', conversationId)
      .maybeSingle();

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    if (conv.host_id !== userId && conv.guest_id !== userId) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('id, sender_id, body, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      writeAuditLog('messages.fetch.error', { userId, conversationId, error: msgError.message });
      return NextResponse.json({ error: 'Failed to load messages.' }, { status: 500 });
    }

    return NextResponse.json({
      conversation: conv,
      messages: messages || [],
      currentUserId: userId,
    });
  } catch (err) {
    writeAuditLog('messages.fetch.exception', { userId, conversationId, error: String(err) });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Send a message in a conversation (must be participant).
 * Body: { body }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userIdOrResponse = requireUserSession(request);
  if (typeof userIdOrResponse !== 'string') return userIdOrResponse;
  const userId = userIdOrResponse;

  const { id: conversationId } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const messageBody = sanitizeInput(String(body.body || '')).slice(0, 5000);

    if (!messageBody) {
      return NextResponse.json({ error: 'Message body is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify user is a participant
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id, host_id, guest_id')
      .eq('id', conversationId)
      .maybeSingle();

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    if (conv.host_id !== userId && conv.guest_id !== userId) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: userId, body: messageBody })
      .select('id, sender_id, body, created_at')
      .single();

    if (msgError || !message) {
      writeAuditLog('messages.send.error', { userId, conversationId, error: msgError?.message });
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    writeAuditLog('messages.sent', { userId, conversationId, messageId: message.id });
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    writeAuditLog('messages.send.exception', { userId, conversationId, error: String(err) });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
