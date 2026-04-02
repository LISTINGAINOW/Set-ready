-- Migration: Add owner tracking fields to properties + host_sessions table
-- Run in Supabase SQL Editor

-- 1. Add owner fields to properties (safe if already exist)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_name TEXT;

-- 2. Index on owner_email for fast per-owner queries
CREATE INDEX IF NOT EXISTS idx_properties_owner_email ON properties(owner_email);

-- 3. Host sessions table (email + OTP-based auth, no passwords)
CREATE TABLE IF NOT EXISTS host_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_host_sessions_token ON host_sessions(token);
CREATE INDEX IF NOT EXISTS idx_host_sessions_email ON host_sessions(email);

-- 4. Host OTP codes table (one-time codes for login)
CREATE TABLE IF NOT EXISTS host_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_host_otps_email ON host_otps(email);

-- 5. RLS: host_sessions - deny all direct client access (server-only via service role)
ALTER TABLE host_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "host_sessions_no_anon" ON host_sessions FOR ALL USING (false);

ALTER TABLE host_otps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "host_otps_no_anon" ON host_otps FOR ALL USING (false);

-- 6. Cleanup function: purge expired sessions/otps (call periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_host_auth()
RETURNS void AS $$
BEGIN
  DELETE FROM host_sessions WHERE expires_at < now();
  DELETE FROM host_otps WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
