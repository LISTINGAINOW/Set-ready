-- ============================================================
-- W-9 Forms & Owner Earnings
-- ============================================================

-- ── W-9 forms ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS w9_forms (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  legal_name            TEXT    NOT NULL,
  -- Store full SSN/EIN encrypted; separately keep last-4 for display
  ssn_ein               TEXT    NOT NULL,
  ssn_ein_last4         TEXT    NOT NULL,
  address               TEXT    NOT NULL,
  city                  TEXT    NOT NULL,
  state                 TEXT    NOT NULL,
  zip                   TEXT    NOT NULL,
  signature_accepted_at TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One W-9 per owner (upsert pattern)
CREATE UNIQUE INDEX IF NOT EXISTS w9_forms_owner_id_idx ON w9_forms (owner_id);

-- ── Owner earnings ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS owner_earnings (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id       TEXT,
  property_id      TEXT,
  property_name    TEXT,
  renter_name      TEXT,
  renter_email     TEXT,
  booking_date     DATE,
  booking_amount   NUMERIC(10, 2) NOT NULL,
  setvenue_fee     NUMERIC(10, 2) NOT NULL,   -- 10 % of booking_amount
  owner_payout     NUMERIC(10, 2) NOT NULL,   -- 90 % of booking_amount
  status           TEXT    NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'paid')),
  payout_date      DATE,
  transaction_id   TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS owner_earnings_owner_id_idx   ON owner_earnings (owner_id);
CREATE INDEX IF NOT EXISTS owner_earnings_status_idx     ON owner_earnings (status);
CREATE INDEX IF NOT EXISTS owner_earnings_created_at_idx ON owner_earnings (created_at DESC);

-- ── Auto-update triggers ───────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER w9_forms_updated_at
  BEFORE UPDATE ON w9_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER owner_earnings_updated_at
  BEFORE UPDATE ON owner_earnings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── RLS ────────────────────────────────────────────────────

ALTER TABLE w9_forms     ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_earnings ENABLE ROW LEVEL SECURITY;

-- w9_forms: owners see only their own row
CREATE POLICY "Owners can view own W-9"
  ON w9_forms FOR SELECT
  USING (owner_id = current_setting('app.user_id', true));

CREATE POLICY "Owners can insert own W-9"
  ON w9_forms FOR INSERT
  WITH CHECK (owner_id = current_setting('app.user_id', true));

CREATE POLICY "Owners can update own W-9"
  ON w9_forms FOR UPDATE
  USING (owner_id = current_setting('app.user_id', true));

-- Service role bypasses RLS (admin API routes use service role key)
CREATE POLICY "Service role full access to w9_forms"
  ON w9_forms FOR ALL
  USING (auth.role() = 'service_role');

-- owner_earnings: owners see only their own rows
CREATE POLICY "Owners can view own earnings"
  ON owner_earnings FOR SELECT
  USING (owner_id = current_setting('app.user_id', true));

-- Service role full access (admin API routes + webhook handlers)
CREATE POLICY "Service role full access to owner_earnings"
  ON owner_earnings FOR ALL
  USING (auth.role() = 'service_role');
