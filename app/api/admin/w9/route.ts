import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization') ?? '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  return token.length > 0 && token === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Fetch all W-9 forms joined with user info
  const { data: w9s, error: w9Error } = await supabase
    .from('w9_forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (w9Error) {
    console.error('Admin W-9 fetch error:', w9Error.message);
    return NextResponse.json({ error: 'Failed to fetch W-9 forms' }, { status: 500 });
  }

  // Fetch all users for name lookup
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, firstName, lastName');

  if (usersError) {
    console.error('Users fetch error:', usersError.message);
  }

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  // Fetch earnings totals per owner for 1099 threshold
  const { data: earningsData, error: earningsError } = await supabase
    .from('owner_earnings')
    .select('owner_id, owner_payout');

  if (earningsError) {
    console.error('Earnings fetch error:', earningsError.message);
  }

  const earningsByOwner: Record<string, number> = {};
  for (const row of earningsData ?? []) {
    earningsByOwner[row.owner_id] =
      (earningsByOwner[row.owner_id] ?? 0) + Number(row.owner_payout);
  }

  // Get all distinct owner_ids (from both w9s and earnings)
  const allOwnerIds = new Set([
    ...(w9s ?? []).map((w) => w.owner_id),
    ...Object.keys(earningsByOwner),
  ]);

  const w9ByOwner = new Map((w9s ?? []).map((w) => [w.owner_id, w]));

  const result = Array.from(allOwnerIds).map((ownerId) => {
    const user   = userMap.get(ownerId);
    const w9     = w9ByOwner.get(ownerId) ?? null;
    const total  = earningsByOwner[ownerId] ?? 0;
    return {
      owner_id:    ownerId,
      email:       user?.email ?? '—',
      name:        user ? `${user.firstName} ${user.lastName}` : '—',
      has_w9:      w9 !== null,
      w9_legal_name: w9?.legal_name ?? null,
      ssn_ein_last4: w9?.ssn_ein_last4 ?? null,
      w9_address:  w9 ? `${w9.address}, ${w9.city}, ${w9.state} ${w9.zip}` : null,
      w9_submitted_at: w9?.created_at ?? null,
      total_earnings: total,
      above_1099_threshold: total >= 600,
    };
  });

  // Sort: above threshold first, then by total earnings desc
  result.sort((a, b) => {
    if (a.above_1099_threshold !== b.above_1099_threshold)
      return a.above_1099_threshold ? -1 : 1;
    return b.total_earnings - a.total_earnings;
  });

  return NextResponse.json({ owners: result });
}
