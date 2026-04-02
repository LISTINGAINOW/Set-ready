import { NextRequest, NextResponse } from 'next/server';
import { requireHostSession } from '@/lib/host-auth';
import { createAdminClient } from '@/utils/supabase/admin';

// GET /api/host/properties - list owner's properties
export async function GET(request: NextRequest) {
  const ownerEmail = await requireHostSession(request);
  if (typeof ownerEmail !== 'string') return ownerEmail;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('properties')
    .select('id, property_name, city, state, status, images, price_per_hour, price_per_day, approved, created_at, updated_at')
    .eq('owner_email', ownerEmail)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ properties: data ?? [] });
}
