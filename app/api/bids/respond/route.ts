import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-middleware';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
  // CRIT-6: Only authenticated admins can respond to bids
  const admin = requireAdminSession(request);
  if (admin !== true) return admin;

  try {
    const supabase = createAdminClient();

    const body = await request.json();
    const { bidId, action, counterPrice, ownerMessage } = body;

    if (!bidId || !action) {
      return NextResponse.json({ error: 'Missing bidId or action' }, { status: 400 });
    }

    if (!['accept', 'counter', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be accept, counter, or decline' }, { status: 400 });
    }

    // Get the original bid
    const { data: bid, error: fetchError } = await supabase
      .from('property_bids')
      .select('*')
      .eq('id', bidId)
      .single();

    if (fetchError || !bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    const updateData: any = {
      responded_at: new Date().toISOString(),
      owner_message: ownerMessage || '',
    };

    switch (action) {
      case 'accept':
        updateData.status = 'accepted';
        break;
      case 'counter':
        if (!counterPrice) {
          return NextResponse.json({ error: 'Counter price required for counter offers' }, { status: 400 });
        }
        updateData.status = 'countered';
        updateData.counter_price = counterPrice;
        break;
      case 'decline':
        updateData.status = 'declined';
        break;
    }

    const { data, error } = await supabase
      .from('property_bids')
      .update(updateData)
      .eq('id', bidId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update bid:', error);
      return NextResponse.json({ error: 'Failed to respond to bid' }, { status: 500 });
    }

    // TODO: Send email to bidder about owner's response

    return NextResponse.json({
      success: true,
      bid: data,
      message: `Bid ${action}ed successfully`,
    });
  } catch (error: any) {
    console.error('Bid response error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
