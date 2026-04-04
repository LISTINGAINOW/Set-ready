-- In-platform messaging: conversations + messages
-- Requires: users table with id (uuid or text)

-- ─── Conversations ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT NOT NULL,
  property_name TEXT NOT NULL DEFAULT '',
  host_id     TEXT NOT NULL,   -- user id of the property host
  guest_id    TEXT NOT NULL,   -- user id of the person inquiring
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversations_host_id_idx  ON conversations (host_id);
CREATE INDEX IF NOT EXISTS conversations_guest_id_idx ON conversations (guest_id);
CREATE INDEX IF NOT EXISTS conversations_property_idx ON conversations (property_id);

-- ─── Messages ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       TEXT NOT NULL,   -- user id of sender
  body            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages (conversation_id);

-- Keep conversations.updated_at fresh on new message
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_update_conversation_updated_at ON messages;
CREATE TRIGGER messages_update_conversation_updated_at
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- Conversations: visible to host or guest only
CREATE POLICY conversations_select ON conversations
  FOR SELECT USING (
    auth.uid()::text = host_id OR auth.uid()::text = guest_id
  );

CREATE POLICY conversations_insert ON conversations
  FOR INSERT WITH CHECK (
    auth.uid()::text = guest_id
  );

CREATE POLICY conversations_update ON conversations
  FOR UPDATE USING (
    auth.uid()::text = host_id OR auth.uid()::text = guest_id
  );

-- Messages: participants only
CREATE POLICY messages_select ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (auth.uid()::text = c.host_id OR auth.uid()::text = c.guest_id)
    )
  );

CREATE POLICY messages_insert ON messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (auth.uid()::text = c.host_id OR auth.uid()::text = c.guest_id)
    )
  );
