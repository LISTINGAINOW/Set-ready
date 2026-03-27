import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Get user email to find their properties
  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();

  if (userError || !userRow) {
    return NextResponse.json({ inquiries: [] });
  }

  // Find properties owned by this user's email
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('id, property_name')
    .eq('owner_email', userRow.email);

  if (propError || !properties || properties.length === 0) {
    return NextResponse.json({ inquiries: [] });
  }

  const propertyIds = properties.map((p) => String(p.id));
  const propertyNameMap: Record<string, string> = {};
  properties.forEach((p) => {
    propertyNameMap[String(p.id)] = p.property_name ?? 'Unknown Property';
  });

  // Fetch inquiries for those properties
  const { data: inquiries, error: inqError } = await supabase
    .from('inquiries')
    .select('*')
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false })
    .limit(50);

  if (inqError) {
    console.error('Error fetching inquiries:', inqError.message);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }

  const enriched = (inquiries ?? []).map((inq) => ({
    ...inq,
    property_name: propertyNameMap[inq.property_id] ?? 'Unknown Property',
  }));

  return NextResponse.json({ inquiries: enriched });
}
