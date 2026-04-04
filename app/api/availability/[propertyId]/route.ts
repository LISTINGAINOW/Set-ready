import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ propertyId: string }> };

// GET /api/availability/[propertyId]
// Returns all blocked date ranges for the property.
// Optional query params:
//   ?from=YYYY-MM-DD&to=YYYY-MM-DD  — filter to a date window
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { propertyId } = await params;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const supabase = createAdminClient();

  let query = supabase
    .from('blocked_dates')
    .select('id, property_id, start_date, end_date, reason, created_at')
    .eq('property_id', propertyId)
    .order('start_date', { ascending: true });

  if (from) {
    // Include ranges that overlap with the window: end_date >= from
    query = query.gte('end_date', from);
  }
  if (to) {
    // Include ranges that overlap with the window: start_date <= to
    query = query.lte('start_date', to);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[availability GET]', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }

  return NextResponse.json({ blockedDates: data ?? [] });
}

// PUT /api/availability/[propertyId]
// Body: { action: 'block' | 'unblock', startDate: string, endDate: string, reason?: string, id?: string }
//   action='block'   → insert a new blocked range
//   action='unblock' → delete by id (or all ranges overlapping startDate..endDate)
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { propertyId } = await params;

  // Require auth for writes
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { action: string; startDate?: string; endDate?: string; reason?: string; id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action, startDate, endDate, reason, id } = body;

  if (!action) {
    return NextResponse.json({ error: 'Missing action' }, { status: 400 });
  }

  // Use admin client for writes (service role bypasses RLS)
  // We manually enforce ownership below.
  const adminSupabase = createAdminClient();

  // Verify this user owns the property
  const { data: property, error: propertyError } = await adminSupabase
    .from('properties')
    .select('folder_name, owner_id')
    .eq('folder_name', propertyId)
    .single();

  if (propertyError || !property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  if (property.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden — you do not own this property' }, { status: 403 });
  }

  if (action === 'block') {
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate required for block' }, { status: 400 });
    }
    if (startDate > endDate) {
      return NextResponse.json({ error: 'startDate must be <= endDate' }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from('blocked_dates')
      .insert({ property_id: propertyId, start_date: startDate, end_date: endDate, reason: reason ?? null })
      .select()
      .single();

    if (error) {
      console.error('[availability PUT block]', error);
      return NextResponse.json({ error: 'Failed to block dates' }, { status: 500 });
    }

    return NextResponse.json({ success: true, blockedDate: data });
  }

  if (action === 'unblock') {
    if (id) {
      // Delete by specific ID
      const { error } = await adminSupabase
        .from('blocked_dates')
        .delete()
        .eq('id', id)
        .eq('property_id', propertyId);

      if (error) {
        console.error('[availability PUT unblock by id]', error);
        return NextResponse.json({ error: 'Failed to unblock dates' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (startDate && endDate) {
      // Delete all ranges that overlap with the given range
      const { error } = await adminSupabase
        .from('blocked_dates')
        .delete()
        .eq('property_id', propertyId)
        .lte('start_date', endDate)
        .gte('end_date', startDate);

      if (error) {
        console.error('[availability PUT unblock by range]', error);
        return NextResponse.json({ error: 'Failed to unblock dates' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Provide id or startDate+endDate to unblock' }, { status: 400 });
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
}
