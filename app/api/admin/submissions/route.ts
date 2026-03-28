import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireAdminSession } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  const authResult = requireAdminSession(request);
  if (authResult !== true) return authResult;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const supabase = createAdminClient();
  let query = supabase
    .from('listing_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Admin submissions fetch error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data ?? [] });
}
