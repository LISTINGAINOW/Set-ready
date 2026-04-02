import { NextRequest, NextResponse } from 'next/server';
import { requireHostSession } from '@/lib/host-auth';
import { createAdminClient } from '@/utils/supabase/admin';

// GET /api/host/inquiries - list inquiries for owner's properties
export async function GET(request: NextRequest) {
  const ownerEmail = await requireHostSession(request);
  if (typeof ownerEmail !== 'string') return ownerEmail;

  const supabase = createAdminClient();

  // Get owner's property IDs first
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('id, property_name')
    .eq('owner_email', ownerEmail);

  if (propError) {
    return NextResponse.json({ error: propError.message }, { status: 500 });
  }

  if (!properties || properties.length === 0) {
    return NextResponse.json({ inquiries: [] });
  }

  const propertyIds = properties.map((p) => p.id);
  const propertyMap = Object.fromEntries(properties.map((p) => [p.id, p.property_name]));

  // Get inquiries for those properties
  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('*')
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach property name to each inquiry
  const enriched = (inquiries ?? []).map((inq) => ({
    ...inq,
    property_name: propertyMap[inq.property_id] ?? 'Unknown property',
  }));

  return NextResponse.json({ inquiries: enriched });
}
