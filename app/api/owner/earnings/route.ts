import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId    = searchParams.get('user_id');
  const startDate = searchParams.get('start');   // ISO date string, optional
  const endDate   = searchParams.get('end');     // ISO date string, optional

  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  let query = supabase
    .from('owner_earnings')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (startDate) query = query.gte('created_at', startDate);
  if (endDate)   query = query.lte('created_at', endDate);

  const { data: earnings, error } = await query;

  if (error) {
    console.error('Earnings fetch error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
  }

  const rows = earnings ?? [];

  const totalEarnings = rows.reduce((sum, r) => sum + Number(r.owner_payout), 0);
  const pendingAmount = rows
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.owner_payout), 0);
  const paidOut = rows
    .filter((r) => r.status === 'paid')
    .reduce((sum, r) => sum + Number(r.owner_payout), 0);

  return NextResponse.json({
    summary: {
      total_earnings: totalEarnings,
      pending_amount: pendingAmount,
      paid_out:       paidOut,
      current_balance: pendingAmount,
      booking_count:  rows.length,
    },
    earnings: rows,
  });
}
