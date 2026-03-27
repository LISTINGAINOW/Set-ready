-- ============================================================
-- SetVenue Booking Protection System
-- Migration: booking_protection.sql
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- booking_requests table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.booking_requests (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id               TEXT NOT NULL,
  renter_id                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Renter details
  company_name              TEXT NOT NULL,
  contact_name              TEXT NOT NULL,
  contact_email             TEXT NOT NULL,
  contact_phone             TEXT NOT NULL,
  production_type           TEXT NOT NULL,

  -- Document verification
  id_document_url           TEXT,
  coi_document_url          TEXT,
  coi_expiry_date           DATE,

  -- Financial
  damage_deposit_amount     NUMERIC(10, 2) DEFAULT 0,
  stripe_payment_intent_id  TEXT,

  -- Legal agreements
  hold_harmless_accepted    BOOLEAN NOT NULL DEFAULT FALSE,
  hold_harmless_accepted_at TIMESTAMPTZ,
  hold_harmless_ip          TEXT,

  tos_accepted              BOOLEAN NOT NULL DEFAULT FALSE,
  tos_accepted_at           TIMESTAMPTZ,
  tos_ip                    TEXT,

  content_permission_accepted    BOOLEAN NOT NULL DEFAULT FALSE,
  content_permission_accepted_at TIMESTAMPTZ,

  permit_confirmed          BOOLEAN NOT NULL DEFAULT FALSE,

  -- Status & admin
  status                    TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  admin_notes               TEXT,
  reviewed_by               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at               TIMESTAMPTZ,

  -- Booking dates
  booking_start             TIMESTAMPTZ,
  booking_end               TIMESTAMPTZ,
  notes                     TEXT,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_booking_requests_property_id  ON public.booking_requests(property_id);
CREATE INDEX idx_booking_requests_renter_id    ON public.booking_requests(renter_id);
CREATE INDEX idx_booking_requests_status       ON public.booking_requests(status);
CREATE INDEX idx_booking_requests_created_at   ON public.booking_requests(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_requests_updated_at
  BEFORE UPDATE ON public.booking_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Renters can see their own bookings
CREATE POLICY "renters_select_own" ON public.booking_requests
  FOR SELECT
  USING (auth.uid() = renter_id);

-- Renters can insert their own bookings
CREATE POLICY "renters_insert_own" ON public.booking_requests
  FOR INSERT
  WITH CHECK (auth.uid() = renter_id);

-- Renters can update their own bookings (only while pending)
CREATE POLICY "renters_update_own_pending" ON public.booking_requests
  FOR UPDATE
  USING (auth.uid() = renter_id AND status = 'pending')
  WITH CHECK (auth.uid() = renter_id);

-- Owners can view bookings for their properties
-- Requires a properties table with owner_id; adjust if your schema differs
CREATE POLICY "owners_select_their_properties" ON public.booking_requests
  FOR SELECT
  USING (
    property_id IN (
      SELECT id::text FROM public.properties WHERE owner_id = auth.uid()
    )
  );

-- Service role / admins bypass RLS (service role key always bypasses)
-- Additionally create an explicit admin policy using a custom claim or role:
CREATE POLICY "service_role_all" ON public.booking_requests
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- booking_documents table (audit trail for uploads)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.booking_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL REFERENCES public.booking_requests(id) ON DELETE CASCADE,
  document_type   TEXT NOT NULL CHECK (document_type IN ('government_id', 'coi', 'permit', 'other')),
  storage_path    TEXT NOT NULL,
  file_name       TEXT,
  file_size       BIGINT,
  mime_type       TEXT,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.booking_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_doc_owner_select" ON public.booking_documents
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM public.booking_requests WHERE renter_id = auth.uid()
    )
  );

CREATE POLICY "booking_doc_owner_insert" ON public.booking_documents
  FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM public.booking_requests WHERE renter_id = auth.uid()
    )
  );

CREATE POLICY "service_role_docs_all" ON public.booking_documents
  FOR ALL
  USING (auth.role() = 'service_role');
