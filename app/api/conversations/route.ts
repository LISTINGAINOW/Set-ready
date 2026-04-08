export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireUserSession } from '@/lib/auth-middleware';
import { sendNewMessageNotification } from '@/lib/email';
import { sanitizeInput, writeAuditLog } from '@/lib/security';
import type { ConversationMessage, MessageConversation, MessageSenderRole } from '@/types/message';

interface ConversationRow {
  id: string;
  property_id: string | null;
  property_name: string | null;
  host_id: string;
  guest_id: string;
  created_at: string;
  updated_at: string;
  host_last_read_at?: string | null;
  guest_last_read_at?: string | null;
  messages: MessageRow[] | null;
}

interface MessageRow {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface UserRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

function buildDisplayName(user?: UserRow | null, fallback = 'SetVenue user') {
  if (!user) return fallback;
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  if (user.email) return user.email;
  return fallback;
}

function mapConversationMessage(
  conversation: ConversationRow,
  message: MessageRow,
  userMap: Map<string, UserRow>
): ConversationMessage {
  const sender: MessageSenderRole = message.sender_id === conversation.host_id ? 'host' : 'guest';

  return {
    id: message.id,
    sender,
    senderName: buildDisplayName(
      userMap.get(message.sender_id),
      sender === 'host' ? 'Host' : 'Guest'
    ),
    body: message.body,
    timestamp: message.created_at,
  };
}

function computeUnreadCount(conversation: ConversationRow, userId: string) {
  const messages = (conversation.messages || []).slice();
  const lastReadAt = userId === conversation.host_id
    ? conversation.host_last_read_at ?? null
    : conversation.guest_last_read_at ?? null;

  return messages.filter((message) => {
    if (message.sender_id === userId) return false;
    if (!lastReadAt) return true;
    return new Date(message.created_at).getTime() > new Date(lastReadAt).getTime();
  }).length;
}

async function loadUsers(supabase: ReturnType<typeof createAdminClient>, userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, UserRow>();
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, email')
    .in('id', userIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map((users || []).map((user) => [String(user.id), user as UserRow]));
}

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
        host_last_read_at,
        guest_last_read_at,
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

    const typedConversations = (conversations || []) as ConversationRow[];
    const userIds = Array.from(
      new Set(
        typedConversations.flatMap((conversation) => [conversation.host_id, conversation.guest_id])
      )
    );
    const userMap = await loadUsers(supabase, userIds);

    const result: MessageConversation[] = typedConversations
      .map((conversation) => {
        const sortedMessages = (conversation.messages || [])
          .slice()
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        const mappedMessages = sortedMessages.map((message) =>
          mapConversationMessage(conversation, message, userMap)
        );

        const lastMessageAt = mappedMessages[mappedMessages.length - 1]?.timestamp || conversation.updated_at;

        return {
          id: conversation.id,
          propertyId: String(conversation.property_id || ''),
          propertyTitle: conversation.property_name || 'Untitled property',
          guestName: buildDisplayName(userMap.get(conversation.guest_id), 'Guest'),
          hostName: buildDisplayName(userMap.get(conversation.host_id), 'Host'),
          unreadCount: computeUnreadCount({ ...conversation, messages: sortedMessages }, userId),
          lastMessageAt,
          messages: mappedMessages,
        };
      })
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

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
        .insert({
          property_id: propertyId,
          property_name: propertyName,
          host_id: hostId,
          guest_id: guestId,
        })
        .select('id')
        .single();

      if (convError || !newConv) {
        writeAuditLog('conversations.create.error', { guestId, propertyId, error: convError?.message });
        return NextResponse.json({ error: 'Failed to create conversation.' }, { status: 500 });
      }
      conversationId = newConv.id;
    }

    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: guestId, body: initialMessage })
      .select('id, sender_id, body, created_at')
      .single();

    if (msgError || !message) {
      writeAuditLog('conversations.initial_message.error', { guestId, conversationId, error: msgError?.message });
      return NextResponse.json({ error: 'Failed to send initial message.' }, { status: 500 });
    }

    const { error: readUpdateError } = await supabase
      .from('conversations')
      .update({ guest_last_read_at: message.created_at, updated_at: message.created_at })
      .eq('id', conversationId);

    if (readUpdateError) {
      writeAuditLog('conversations.read_marker.error', { guestId, conversationId, error: readUpdateError.message });
    }

    try {
      const userMap = await loadUsers(supabase, [guestId, hostId]);
      const host = userMap.get(hostId);
      const guest = userMap.get(guestId);

      if (host?.email) {
        void sendNewMessageNotification(host.email, {
          conversationId,
          propertyName: propertyName || 'your SetVenue property',
          senderName: buildDisplayName(guest, 'Guest'),
          senderEmail: guest?.email || undefined,
          recipientName: buildDisplayName(host, 'Host'),
          messagePreview: initialMessage.slice(0, 200),
        });
      }
    } catch (emailError) {
      writeAuditLog('conversations.initial_message.notification_error', {
        guestId,
        hostId,
        conversationId,
        error: String(emailError),
      });
    }

    writeAuditLog('conversations.created', { guestId, hostId, propertyId, conversationId });
    return NextResponse.json({ conversationId }, { status: 201 });
  } catch (err) {
    writeAuditLog('conversations.create.exception', { error: String(err) });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
