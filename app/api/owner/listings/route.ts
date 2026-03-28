import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireUserSession } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  // CRIT-2: user_id comes from the authenticated session, NOT from a query param
  const userId = requireUserSession(request);
  if (userId instanceof NextResponse) return userId;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('listing_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching listings:', error.message);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }

  return NextResponse.json({ listings: data ?? [] });
}
