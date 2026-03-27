-- listing_submissions: holds property listing submissions pending admin review
CREATE TABLE IF NOT EXISTS public.listing_submissions (
  id                        TEXT PRIMARY KEY,
  user_id                   TEXT REFERENCES public.users(id) ON DELETE SET NULL,

  -- Status
  status                    TEXT NOT NULL DEFAULT 'pending_review'
                              CHECK (status IN ('pending_review', 'approved', 'rejected', 'changes_requested')),

  -- Property fields
  title                     TEXT,
  property_type             TEXT,
  address                   TEXT,
  city                      TEXT,
  state                     TEXT,
  zip                       TEXT,
  description               TEXT,
  bedrooms                  INT,
  bathrooms                 INT,
  max_capacity              INT,
  amenities                 TEXT[],
  privacy_level             TEXT,
  booking_mode              TEXT,
  base_rate                 DECIMAL(10, 2),
  cleaning_fee              DECIMAL(10, 2),
  security_deposit          DECIMAL(10, 2),
  available_days            TEXT[],

  -- Compliance
  tot_license_number        TEXT,
  business_license_number   TEXT,
  has_liability_insurance   BOOLEAN,
  has_production_insurance  BOOLEAN,

  -- Legal agreements
  ownership_certified       BOOLEAN NOT NULL DEFAULT false,
  owner_agreement_accepted  BOOLEAN NOT NULL DEFAULT false,
  insurance_confirmed       BOOLEAN NOT NULL DEFAULT false,
  indemnification_accepted  BOOLEAN NOT NULL DEFAULT false,
  review_acknowledged       BOOLEAN NOT NULL DEFAULT false,

  -- Document URLs (stored in Supabase Storage)
  government_id_url         TEXT,
  ownership_proof_url       TEXT,
  insurance_cert_url        TEXT,
  hoa_approval_url          TEXT,
  w9_url                    TEXT,

  -- Photo URLs
  photo_urls                TEXT[],

  -- Admin review fields
  reviewer_notes            TEXT,
  reviewed_at               TIMESTAMPTZ,
  reviewed_by               TEXT,

  -- Timestamps
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listing_submissions_updated_at
  BEFORE UPDATE ON public.listing_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.listing_submissions ENABLE ROW LEVEL SECURITY;

-- Owners can read their own submissions
CREATE POLICY "listing_submissions_select_own"
  ON public.listing_submissions
  FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

-- Authenticated users can insert their own submissions
CREATE POLICY "listing_submissions_insert_own"
  ON public.listing_submissions
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

-- Owners can update their own submissions (e.g. when changes_requested)
CREATE POLICY "listing_submissions_update_own"
  ON public.listing_submissions
  FOR UPDATE
  USING (user_id = current_setting('app.user_id', true));
