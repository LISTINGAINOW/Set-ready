-- SetVenue Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_name text UNIQUE,
  property_name text,
  address text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT 'CA',
  zip text DEFAULT '',
  beds int,
  baths int,
  property_type text,
  style text,
  amenities text[] DEFAULT '{}',
  vibe text,
  best_uses text[] DEFAULT '{}',
  description text,
  price_per_hour decimal,
  price_per_day decimal,
  approved boolean DEFAULT false,
  featured boolean DEFAULT false,
  status text DEFAULT 'draft',
  images text[] DEFAULT '{}',
  owner_name text,
  owner_email text,
  owner_phone text,
  confidence text,
  needs_address boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_price decimal,
  status text DEFAULT 'pending',
  stripe_payment_id text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 3. Inquiries table (leads from production companies)
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  name text,
  email text,
  company text,
  message text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- 4. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 5. RLS Policies

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Properties: anyone can read approved+active, authenticated can write
CREATE POLICY "Public can view approved properties"
  ON properties FOR SELECT
  USING (approved = true AND status = 'active');

CREATE POLICY "Authenticated users can insert properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (true);

-- Service role bypasses RLS, so admin imports work fine

-- Bookings: users see their own, authenticated can create
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Inquiries: anyone can create, authenticated can read
CREATE POLICY "Anyone can create inquiries"
  ON inquiries FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can create inquiries"
  ON inquiries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can view inquiries"
  ON inquiries FOR SELECT
  TO authenticated
  USING (true);

-- 6. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_properties_approved ON properties(approved, status);
CREATE INDEX IF NOT EXISTS idx_properties_style ON properties(style);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
