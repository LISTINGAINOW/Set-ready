-- reviews: stores guest reviews for properties
-- Supports both file-based (legacy) and DB-backed review flows.
-- File-based API route (app/api/reviews/route.ts) can be migrated to read/write here.

CREATE TABLE IF NOT EXISTS public.reviews (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id       TEXT NOT NULL,
  reviewer_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Core review fields
  rating            INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text       TEXT NOT NULL CHECK (char_length(review_text) BETWEEN 10 AND 2000),
  reviewer_name     TEXT NOT NULL CHECK (char_length(reviewer_name) BETWEEN 2 AND 80),
  guest_name        TEXT,

  -- Dates
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  stay_date         DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Trust signals
  verified          BOOLEAN NOT NULL DEFAULT FALSE,
  booking_id        TEXT,            -- links to a completed booking for verified badge
  booking_completed BOOLEAN NOT NULL DEFAULT FALSE,
  featured          BOOLEAN NOT NULL DEFAULT FALSE,

  -- Host response
  host_response      TEXT,
  host_response_name TEXT
);

-- Index for fast per-property lookups
CREATE INDEX IF NOT EXISTS reviews_property_id_idx ON public.reviews (property_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx  ON public.reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_reviewer_id_idx ON public.reviews (reviewer_id);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reviews_set_updated_at ON public.reviews;
CREATE TRIGGER reviews_set_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read all reviews (the browse + detail pages are public)
CREATE POLICY "reviews_public_select"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Authenticated users can submit reviews (one per booking recommended but not enforced here)
CREATE POLICY "reviews_authenticated_insert"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can update any review (moderation, featuring, host responses)
CREATE POLICY "reviews_admin_update"
  ON public.reviews
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Admins can delete reviews
CREATE POLICY "reviews_admin_delete"
  ON public.reviews
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Hosts can add a response to reviews on their own property
-- (requires a properties table with host_user_id; adjust if schema differs)
CREATE POLICY "reviews_host_response_update"
  ON public.reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = reviews.property_id
        AND p.host_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = reviews.property_id
        AND p.host_user_id = auth.uid()
    )
  );

-- Reviewers can update/delete their own reviews (unverified only)
CREATE POLICY "reviews_own_update"
  ON public.reviews
  FOR UPDATE
  USING (reviewer_id = auth.uid() AND verified = FALSE)
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "reviews_own_delete"
  ON public.reviews
  FOR DELETE
  USING (reviewer_id = auth.uid() AND verified = FALSE);
