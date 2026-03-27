-- Update inquiries table with additional fields for property booking inquiries
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS hear_about_us TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS booked_at TIMESTAMPTZ;
