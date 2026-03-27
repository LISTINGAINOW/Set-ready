import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
  const userId = new URL(request.url).searchParams.get('user_id');
  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('w9_forms')
    .select('id, legal_name, ssn_ein_last4, created_at')
    .eq('owner_id', userId)
    .maybeSingle();

  if (error) {
    console.error('W-9 status error:', error.message);
    return NextResponse.json({ error: 'Failed to check W-9 status' }, { status: 500 });
  }

  return NextResponse.json({ w9: data ?? null });
}
