import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

// Returns only paid earnings (completed payouts) as payment history
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId    = searchParams.get('user_id');
  const startDate = searchParams.get('start');
  const endDate   = searchParams.get('end');

  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  let query = supabase
    .from('owner_earnings')
    .select('*')
    .eq('owner_id', userId)
    .eq('status', 'paid')
    .order('payout_date', { ascending: false });

  if (startDate) query = query.gte('payout_date', startDate);
  if (endDate)   query = query.lte('payout_date', endDate);

  const { data, error } = await query;

  if (error) {
    console.error('Earnings history error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 });
  }

  return NextResponse.json({ history: data ?? [] });
}
