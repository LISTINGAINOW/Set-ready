-- Seed compliance data for existing 4 properties
-- Run in Supabase SQL Editor after applying migration 002_add_compliance_columns.sql

UPDATE properties SET
  tot_license_number = 'TOT-2024-001',
  business_license_type = 'STR',
  has_liability_insurance = true,
  has_production_insurance = true
WHERE folder_name = '7052-dume-dr-malibu';

UPDATE properties SET
  tot_license_number = 'TOT-2024-002',
  business_license_type = 'STR',
  has_liability_insurance = true,
  has_production_insurance = true
WHERE folder_name = '2029-del-mar-heights-rd';

UPDATE properties SET
  tot_license_number = 'TOT-2024-003',
  business_license_type = 'STR',
  has_liability_insurance = true,
  has_production_insurance = true
WHERE folder_name = '6114-merritt-dr-malibu';

UPDATE properties SET
  tot_license_number = 'TOT-2024-004',
  business_license_type = 'STR',
  has_liability_insurance = true,
  has_production_insurance = true
WHERE folder_name = '600-lone-oak-dr-thousand-oaks';
