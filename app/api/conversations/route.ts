export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireUserSession } from '@/lib/auth-middleware';
import { sanitizeInput, writeAuditLog } from '@/lib/security';

/**
 * GET /api/conversations
 * List all conversations for the current user (as host or guest).
 */
export async function GET(request: NextRequest) {
  const userIdOrResponse = requireUserSession(request);
  if (typeof userIdOrResponse !== 'string') return userIdOrResponse;
  const userId = userIdOrResponse;

  try {
    const supabase = createAdminClient();

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        property_id,
        property_name,
        host_id,
        guest_id,
        created_at,
        updated_at,
        messages (
          id,
          sender_id,
          body,
          created_at
        )
      `)
      .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      writeAuditLog('conversations.list.error', { userId, error: error.message });
      return NextResponse.json({ error: 'Failed to load conversations.' }, { status: 500 });
    }

    // Sort messages within each conversation
    const result = (conversations || []).map((conv) => ({
      ...conv,
      messages: (conv.messages || []).sort(
        (a: { created_at: string }, b: { created_at: string }) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
      unreadCount: 0, // TODO: implement read receipts
    }));

    return NextResponse.json({ conversations: result });
  } catch (err) {
    writeAuditLog('conversations.list.exception', { userId, error: String(err) });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 * POST /api/conversations
 * Create a new conversation (guest initiates with a host re: a property).
 * Body: { propertyId, propertyName, hostId, initialMessage }
 */
export async function POST(request: NextRequest) {
  const userIdOrResponse = requireUserSession(request);
  if (typeof userIdOrResponse !== 'string') return userIdOrResponse;
  const guestId = userIdOrResponse;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const propertyId = sanitizeInput(String(body.propertyId || '')).slice(0, 200);
    const propertyName = sanitizeInput(String(body.propertyName || '')).slice(0, 300);
    const hostId = sanitizeInput(String(body.hostId || '')).slice(0, 200);
    const initialMessage = sanitizeInput(String(body.initialMessage || '')).slice(0, 5000);

    if (!propertyId) return NextResponse.json({ error: 'propertyId is required.' }, { status: 400 });
    if (!hostId) return NextResponse.json({ error: 'hostId is required.' }, { status: 400 });
    if (!initialMessage) return NextResponse.json({ error: 'initialMessage is required.' }, { status: 400 });
    if (hostId === guestId) return NextResponse.json({ error: 'Cannot message yourself.' }, { status: 400 });

    const supabase = createAdminClient();

    // Check if conversation already exists for this guest+property
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('property_id', propertyId)
      .eq('guest_id', guestId)
      .eq('host_id', hostId)
      .maybeSingle();

    let conversationId: string;

    if (existing) {
      conversationId = existing.id;
    } else {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ property_id: propertyId, property_name: propertyName, host_id: hostId, guest_id: guestId })
        .select('id')
        .single();

      if (convError || !newConv) {
        writeAuditLog('conversations.create.error', { guestId, propertyId, error: convError?.message });
        return NextResponse.json({ error: 'Failed to create conversation.' }, { status: 500 });
      }
      conversationId = newConv.id;
    }

    // Insert the initial message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: guestId, body: initialMessage });

    if (msgError) {
      writeAuditLog('conversations.initial_message.error', { guestId, conversationId, error: msgError.message });
      return NextResponse.json({ error: 'Failed to send initial message.' }, { status: 500 });
    }

    writeAuditLog('conversations.created', { guestId, hostId, propertyId, conversationId });
    return NextResponse.json({ conversationId }, { status: 201 });
  } catch (err) {
    writeAuditLog('conversations.create.exception', { error: String(err) });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
