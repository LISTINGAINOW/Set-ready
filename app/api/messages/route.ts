import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireUserSession } from '@/lib/auth-middleware';
import { sanitizeInput } from '@/lib/security';

export const dynamic = 'force-dynamic';

// GET /api/messages — list conversations for the current user
export async function GET(request: NextRequest) {
  const userId = requireUserSession(request);
  if (typeof userId !== 'string') return userId;

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
    console.error('messages GET error', error);
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 });
  }

  // Attach last message + unread count per conversation
  const result = (conversations ?? []).map((conv) => {
    const msgs: Array<{ id: string; sender_id: string; body: string; created_at: string }> =
      (conv.messages as unknown as Array<{ id: string; sender_id: string; body: string; created_at: string }>) ?? [];
    const sorted = [...msgs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastMessage = sorted[0] ?? null;
    return {
      id: conv.id,
      property_id: conv.property_id,
      property_name: conv.property_name,
      host_id: conv.host_id,
      guest_id: conv.guest_id,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      last_message: lastMessage,
      message_count: msgs.length,
    };
  });

  return NextResponse.json({ conversations: result });
}

// POST /api/messages — start a conversation OR send first message
// Body: { property_id, property_name, host_id, body }
export async function POST(request: NextRequest) {
  const userId = requireUserSession(request);
  if (typeof userId !== 'string') return userId;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const propertyId = sanitizeInput(String(body.property_id ?? '')).slice(0, 200);
  const propertyName = sanitizeInput(String(body.property_name ?? '')).slice(0, 300);
  const hostId = sanitizeInput(String(body.host_id ?? '')).slice(0, 200);
  const messageBody = sanitizeInput(String(body.body ?? '')).slice(0, 4000);

  if (!propertyId) return NextResponse.json({ error: 'property_id is required' }, { status: 400 });
  if (!hostId) return NextResponse.json({ error: 'host_id is required' }, { status: 400 });
  if (!messageBody) return NextResponse.json({ error: 'message body is required' }, { status: 400 });
  if (hostId === userId) {
    return NextResponse.json({ error: 'You cannot message yourself' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Reuse existing conversation between same guest + property
  let { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('property_id', propertyId)
    .eq('guest_id', userId)
    .maybeSingle();

  let conversationId: string;

  if (existing?.id) {
    conversationId = existing.id;
  } else {
    const { data: created, error: createError } = await supabase
      .from('conversations')
      .insert({ property_id: propertyId, property_name: propertyName, host_id: hostId, guest_id: userId })
      .select('id')
      .single();

    if (createError || !created) {
      console.error('conversations insert error', createError);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }
    conversationId = created.id;
  }

  const { data: message, error: msgError } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: userId, body: messageBody })
    .select('id, sender_id, body, created_at')
    .single();

  if (msgError || !message) {
    console.error('messages insert error', msgError);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({ conversation_id: conversationId, message }, { status: 201 });
}
