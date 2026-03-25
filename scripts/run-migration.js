#!/usr/bin/env node
/**
 * Run the initial Supabase database migration.
 *
 * Strategy (tried in order):
 *   1. Direct Postgres connection via DATABASE_URL env var
 *   2. Construct connection URL from Supabase project credentials
 *
 * Usage:
 *   node scripts/run-migration.js
 *
 * Required env (from .env.local or shell):
 *   NEXT_PUBLIC_SUPABASE_URL    — e.g. https://wvqarkjjjngzfkmtkxsa.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY   — service role key
 *   DATABASE_URL                — (optional) direct postgres connection string
 *                                 e.g. postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
 *                                 Find it at: Supabase Dashboard → Settings → Database → Connection string
 */

const fs   = require('fs');
const path = require('path');
const { Client } = require('pg');

// ---------------------------------------------------------------------------
// Load .env.local
// ---------------------------------------------------------------------------
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

const MIGRATION_FILE = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');

async function main() {
  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');

  // 1. Prefer an explicit DATABASE_URL
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectRef  = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

    if (!projectRef) {
      console.error('❌  Could not determine Supabase project ref from NEXT_PUBLIC_SUPABASE_URL');
      printManualInstructions(sql);
      process.exit(1);
    }

    // Supabase Transaction Pooler (port 6543) — works without IPv6
    // Password = your Supabase database password (Settings → Database)
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;
    if (!dbPassword) {
      console.error('❌  SUPABASE_DB_PASSWORD is not set.');
      console.error('   Find it at: Supabase Dashboard → Settings → Database → Database password');
      console.error('   Then re-run:  SUPABASE_DB_PASSWORD=<password> node scripts/run-migration.js');
      console.error('   Or set DATABASE_URL directly.\n');
      printManualInstructions(sql);
      process.exit(1);
    }

    connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;
  }

  console.log('Connecting to Supabase Postgres...');
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('Connected. Running migration 001_initial_schema.sql...');
    await client.query(sql);
    console.log('✅  Migration applied successfully!');
  } catch (err) {
    console.error('❌  Migration failed:', err.message);
    printManualInstructions(sql);
    process.exit(1);
  } finally {
    await client.end();
  }
}

function printManualInstructions(sql) {
  console.log('\n--- MANUAL FALLBACK ---');
  console.log('Run this SQL in the Supabase SQL Editor:');
  console.log('  https://supabase.com/dashboard/project/wvqarkjjjngzfkmtkxsa/sql/new\n');
  console.log('Or copy from: supabase/migrations/001_initial_schema.sql\n');
  console.log('SQL preview (first 500 chars):');
  console.log(sql.slice(0, 500) + '...');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
