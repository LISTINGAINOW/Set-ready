-- Compliance / regulatory columns for properties
-- VRBO/Airbnb-style STR compliance fields

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS tot_license_number        text,
  ADD COLUMN IF NOT EXISTS business_license_number   text,
  ADD COLUMN IF NOT EXISTS business_license_type     text,
  ADD COLUMN IF NOT EXISTS has_liability_insurance   boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_production_insurance  boolean DEFAULT false;
