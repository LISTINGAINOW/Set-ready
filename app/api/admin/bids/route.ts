import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { requireAdminSession } from '@/lib/auth-middleware';

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  const authResult = requireAdminSession(request);
  if (authResult !== true) return authResult;

  try {
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
