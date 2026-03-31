import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-middleware';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
  const authResult = requireAdminSession(request);
  if (authResult !== true) return authResult;

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('property_bids')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch bids:', error);
      return NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 });
    }

    return NextResponse.json({ bids: data || [] });
  } catch (error: any) {
    console.error('Admin bids error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
