ALTER TABLE public.booking_requests
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS base_rate NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS service_fee NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS selected_time_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_failed_reason TEXT;

ALTER TABLE public.booking_requests DROP CONSTRAINT IF EXISTS booking_requests_status_check;
ALTER TABLE public.booking_requests
  ADD CONSTRAINT booking_requests_status_check
  CHECK (status IN ('pending', 'pending_payment', 'approved', 'confirmed', 'rejected', 'completed', 'cancelled'));

ALTER TABLE public.booking_requests DROP CONSTRAINT IF EXISTS booking_requests_payment_status_check;
ALTER TABLE public.booking_requests
  ADD CONSTRAINT booking_requests_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled', 'expired', 'refunded'));

CREATE INDEX IF NOT EXISTS idx_booking_requests_checkout_session_id
  ON public.booking_requests(stripe_checkout_session_id);
