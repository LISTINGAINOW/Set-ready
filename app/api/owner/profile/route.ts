import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireUserSession } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  // CRIT-2: user_id comes from the authenticated session, NOT from a query param
  const userId = requireUserSession(request);
  if (typeof userId !== 'string') return userId;

  const supabase = createAdminClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, created_at, email_verified')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Count their listings
  const { count } = await supabase
    .from('listing_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  return NextResponse.json({ user, listingCount: count ?? 0 });
}

export async function PATCH(request: NextRequest) {
  // CRIT-2: user_id comes from the authenticated session, NOT from a query param
  const userId = requireUserSession(request);
  if (typeof userId !== 'string') return userId;

  let body: { first_name?: string; last_name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (typeof body.first_name === 'string') updates.first_name = body.first_name.trim();
  if (typeof body.last_name === 'string') updates.last_name = body.last_name.trim();

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('id, email, first_name, last_name, created_at')
    .single();

  if (error) {
    console.error('Error updating profile:', error.message);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}
