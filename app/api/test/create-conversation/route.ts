import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

// Temporary test endpoint — remove before production launch
export async function POST() {
  const supabase = createAdminClient();

  const { data: users } = await supabase
    .from('users')
    .select('id, email, first_name, last_name')
    .limit(2);

  if (!users || users.length === 0) {
    return NextResponse.json({ error: 'No users found in database' }, { status: 404 });
  }

  const hostId = users[0].id;
  const guestId = users.length > 1 ? users[1].id : users[0].id;

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      property_id: 'test-property-1',
      property_name: 'Malibu Beach House — Test Conversation',
      host_id: hostId,
      guest_id: guestId,
    })
    .select()
    .single();

  if (convError) {
    return NextResponse.json({ error: convError.message }, { status: 500 });
  }

  const messages = [
    { conversation_id: conversation.id, sender_id: guestId, body: 'Hi! I\'m interested in booking your Malibu Beach House for a photo shoot next month. Is it available on the 15th?' },
    { conversation_id: conversation.id, sender_id: hostId, body: 'Thanks for reaching out! Yes, the 15th is available. How many people in your crew? We can accommodate up to 20.' },
    { conversation_id: conversation.id, sender_id: guestId, body: 'Great! We\'d have about 8 people — photographer, 2 assistants, makeup artist, stylist, and 3 models. Would that work?' },
  ];

  const { error: msgError } = await supabase
    .from('messages')
    .insert(messages);

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    conversation: conversation,
    participants: { host: users[0], guest: users.length > 1 ? users[1] : users[0] },
    messageCount: messages.length,
    note: 'Log in as either participant to see this conversation at /messages'
  });
}
