import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendSubmissionApproved, sendSubmissionRejected, sendChangesRequested } from '@/lib/email';

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const password = auth?.replace('Bearer ', '');
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('listing_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ submission: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, reviewer_notes, reviewed_by } = body;

  if (!['approved', 'rejected', 'changes_requested'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('listing_submissions')
    .update({
      status,
      reviewer_notes: reviewer_notes ?? null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewed_by ?? 'admin',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Admin submission update error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Look up owner email/name and send notification — fire-and-forget
  if (data.user_id) {
    void (async () => {
      try {
        const { data: user } = await supabase
          .from('users')
          .select('email, first_name')
          .eq('id', data.user_id)
          .single();
        if (!user) return;

        const propertyTitle = data.title ?? 'your property';
        if (status === 'approved') {
          await sendSubmissionApproved(user.email, user.first_name, propertyTitle);
        } else if (status === 'rejected') {
          await sendSubmissionRejected(user.email, user.first_name, propertyTitle, reviewer_notes ?? 'Please contact support for details.');
        } else if (status === 'changes_requested') {
          await sendChangesRequested(user.email, user.first_name, propertyTitle, reviewer_notes ?? 'Please review and update your submission.');
        }
      } catch (emailErr) {
        console.error('Failed to send submission status email:', emailErr);
      }
    })();
  }

  return NextResponse.json({ submission: data });
}
