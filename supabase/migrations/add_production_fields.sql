ALTER TABLE public.listing_submissions ADD COLUMN IF NOT EXISTS content_permissions TEXT[];
ALTER TABLE public.listing_submissions ADD COLUMN IF NOT EXISTS architectural_style TEXT;
ALTER TABLE public.listing_submissions ADD COLUMN IF NOT EXISTS location_setting TEXT[];
ALTER TABLE public.listing_submissions ADD COLUMN IF NOT EXISTS outdoor_features TEXT[];
ALTER TABLE public.listing_submissions ADD COLUMN IF NOT EXISTS interior_features TEXT[];
ALTER TABLE public.listing_submissions ADD COLUMN IF NOT EXISTS production_features TEXT[];
