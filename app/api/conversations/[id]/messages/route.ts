export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireUserSession } from '@/lib/auth-middleware';
import { sendNewMessageNotification } from '@/lib/email';
import { sanitizeInput, writeAuditLog } from '@/lib/security';
import type { ConversationMessage, MessageSenderRole } from '@/types/message';

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

function computeUnreadCount(
  conversation: ConversationRow,
  messages: MessageRow[],
  userId: string
) {
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

async function loadConversationOrError(supabase: ReturnType<typeof createAdminClient>, conversationId: string) {
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('id, property_id, property_name, host_id, guest_id, created_at, updated_at, host_last_read_at, guest_last_read_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (error || !conversation) {
    return { error: NextResponse.json({ error: 'Conversation not found.' }, { status: 404 }) };
  }

  return { conversation: conversation as ConversationRow };
}

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
    const conversationResult = await loadConversationOrError(supabase, conversationId);
    if (conversationResult.error) return conversationResult.error;
    const conv = conversationResult.conversation;

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

    const typedMessages = (messages || []) as MessageRow[];
    const userMap = await loadUsers(supabase, [conv.host_id, conv.guest_id]);

    return NextResponse.json({
      conversation: {
        id: conv.id,
        propertyId: String(conv.property_id || ''),
        propertyTitle: conv.property_name || 'Untitled property',
        guestName: buildDisplayName(userMap.get(conv.guest_id), 'Guest'),
        hostName: buildDisplayName(userMap.get(conv.host_id), 'Host'),
        unreadCount: computeUnreadCount(conv, typedMessages, userId),
        lastMessageAt: typedMessages[typedMessages.length - 1]?.created_at || conv.updated_at,
        hostId: conv.host_id,
        guestId: conv.guest_id,
      },
      messages: typedMessages.map((message) => mapConversationMessage(conv, message, userMap)),
      currentUserId: userId,
    });
  } catch (err) {
    writeAuditLog('messages.fetch.exception', { userId, conversationId, error: String(err) });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 * PATCH /api/conversations/[id]/messages
 * Mark a conversation as read for the current participant.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userIdOrResponse = requireUserSession(request);
  if (typeof userIdOrResponse !== 'string') return userIdOrResponse;
  const userId = userIdOrResponse;

  const { id: conversationId } = await params;

  try {
    const supabase = createAdminClient();
    const conversationResult = await loadConversationOrError(supabase, conversationId);
    if (conversationResult.error) return conversationResult.error;
    const conv = conversationResult.conversation;

    if (conv.host_id !== userId && conv.guest_id !== userId) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const fieldToUpdate = conv.host_id === userId ? 'host_last_read_at' : 'guest_last_read_at';
    const readAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('conversations')
      .update({ [fieldToUpdate]: readAt })
      .eq('id', conversationId);

    if (updateError) {
      writeAuditLog('messages.mark_read.error', { userId, conversationId, error: updateError.message });
      return NextResponse.json({ error: 'Failed to update read status.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, readAt, unreadCount: 0 });
  } catch (err) {
    writeAuditLog('messages.mark_read.exception', { userId, conversationId, error: String(err) });
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
    const conversationResult = await loadConversationOrError(supabase, conversationId);
    if (conversationResult.error) return conversationResult.error;
    const conv = conversationResult.conversation;

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

    const fieldToUpdate = conv.host_id === userId ? 'host_last_read_at' : 'guest_last_read_at';
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ [fieldToUpdate]: message.created_at, updated_at: message.created_at })
      .eq('id', conversationId);

    if (updateError) {
      writeAuditLog('messages.read_marker.error', { userId, conversationId, error: updateError.message });
    }

    try {
      const recipientId = conv.host_id === userId ? conv.guest_id : conv.host_id;
      const userMap = await loadUsers(supabase, [userId, recipientId]);
      const senderUser = userMap.get(userId);
      const recipientUser = userMap.get(recipientId);

      if (recipientUser?.email) {
        void sendNewMessageNotification(recipientUser.email, {
          conversationId,
          propertyName: conv.property_name || 'your SetVenue conversation',
          senderName: buildDisplayName(senderUser, userId === conv.host_id ? 'Host' : 'Guest'),
          senderEmail: senderUser?.email || undefined,
          recipientName: buildDisplayName(recipientUser, recipientId === conv.host_id ? 'Host' : 'Guest'),
          messagePreview: messageBody.slice(0, 200),
        });
      }
    } catch (emailError) {
      writeAuditLog('messages.notification.error', { userId, conversationId, error: String(emailError) });
    }

    const userMap = await loadUsers(supabase, [conv.host_id, conv.guest_id]);
    writeAuditLog('messages.sent', { userId, conversationId, messageId: message.id });
    return NextResponse.json({ message: mapConversationMessage(conv, message as MessageRow, userMap) }, { status: 201 });
  } catch (err) {
    writeAuditLog('messages.send.exception', { userId, conversationId, error: String(err) });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
