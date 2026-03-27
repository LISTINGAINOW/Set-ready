-- email_logs: audit table for tracking all booking-related email sends
CREATE TABLE IF NOT EXISTS public.email_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID REFERENCES public.booking_requests(id) ON DELETE SET NULL,
  email_type      TEXT NOT NULL,
  recipient       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'sent'
                    CHECK (status IN ('sent', 'failed')),
  error_message   TEXT,
  resend_id       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_booking_id ON public.email_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write email logs
CREATE POLICY "email_logs_service_only"
  ON public.email_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);
