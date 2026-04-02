import { NextRequest, NextResponse } from 'next/server';
import { requireHostSession } from '@/lib/host-auth';
import { createAdminClient } from '@/utils/supabase/admin';

// GET /api/host/properties/[id] - fetch single property (owner only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ownerEmail = await requireHostSession(request);
  if (typeof ownerEmail !== 'string') return ownerEmail;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .eq('owner_email', ownerEmail) // Security: enforce ownership
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  return NextResponse.json({ property: data });
}

// PATCH /api/host/properties/[id] - update property (limited fields, owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ownerEmail = await requireHostSession(request);
  if (typeof ownerEmail !== 'string') return ownerEmail;

  const supabase = createAdminClient();

  // Verify ownership first
  const { data: existing } = await supabase
    .from('properties')
    .select('id, owner_email')
    .eq('id', params.id)
    .eq('owner_email', ownerEmail)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Property not found or access denied' }, { status: 404 });
  }

  const body = await request.json();

  // Whitelist: only these fields can be updated by owners
  const allowedFields = [
    'property_name',
    'description',
    'price_per_hour',
    'price_per_day',
    'amenities',
    'best_uses',
    'images',
    'status',
    'owner_name',
    'owner_phone',
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  // Owners cannot set approved/featured/deleted — admin only
  // status can only be set to 'active' or 'hidden' by owner
  if ('status' in updates && !['active', 'hidden'].includes(updates.status as string)) {
    delete updates.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', params.id)
    .eq('owner_email', ownerEmail) // Double-check ownership on update
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ property: data });
}
