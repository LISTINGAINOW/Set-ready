-- ============================================================
-- Property Bids / Name Your Price System
-- ============================================================

CREATE TABLE IF NOT EXISTS property_bids (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id           TEXT NOT NULL,
  production_type       TEXT NOT NULL CHECK (production_type IN ('adult', 'events', 'mainstream', 'photo', 'other')),
  company_name          TEXT NOT NULL,
  contact_name          TEXT NOT NULL,
  contact_email         TEXT NOT NULL,
  contact_phone         TEXT NOT NULL,
  proposed_price        NUMERIC(10, 2) NOT NULL,
  price_type            TEXT NOT NULL DEFAULT 'hourly' CHECK (price_type IN ('hourly', 'flat')),
  estimated_hours       INTEGER DEFAULT 0,
  preferred_dates       TEXT,
  crew_size             INTEGER DEFAULT 0,
  description           TEXT NOT NULL,
  special_requirements  TEXT,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'countered', 'declined', 'expired', 'withdrawn')),
  counter_price         NUMERIC(10, 2),
  owner_message         TEXT,
  responded_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS property_bids_property_id_idx ON property_bids (property_id);
CREATE INDEX IF NOT EXISTS property_bids_status_idx ON property_bids (status);
CREATE INDEX IF NOT EXISTS property_bids_created_at_idx ON property_bids (created_at DESC);

ALTER TABLE property_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to property_bids"
  ON property_bids FOR ALL
  USING (auth.role() = 'service_role');

SELECT pg_notify('pgrst', 'reload schema');
