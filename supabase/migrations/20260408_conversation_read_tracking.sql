ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS host_last_read_at timestamptz,
  ADD COLUMN IF NOT EXISTS guest_last_read_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created_at
  ON public.messages (conversation_id, created_at DESC);

WITH latest_messages AS (
  SELECT conversation_id, MAX(created_at) AS last_message_at
  FROM public.messages
  GROUP BY conversation_id
)
UPDATE public.conversations AS conversations
SET
  host_last_read_at = COALESCE(conversations.host_last_read_at, latest_messages.last_message_at),
  guest_last_read_at = COALESCE(conversations.guest_last_read_at, latest_messages.last_message_at)
FROM latest_messages
WHERE latest_messages.conversation_id = conversations.id;
