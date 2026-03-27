import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
  let body: {
    user_id?: string;
    legal_name?: string;
    ssn_ein?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { user_id, legal_name, ssn_ein, address, city, state, zip } = body;

  if (!user_id || !legal_name || !ssn_ein || !address || !city || !state || !zip) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  // Validate SSN/EIN is exactly 9 digits
  const digits = ssn_ein.replace(/\D/g, '');
  if (digits.length !== 9) {
    return NextResponse.json({ error: 'SSN/EIN must be 9 digits' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Upsert (one W-9 per owner — update if already exists)
  const { error } = await supabase
    .from('w9_forms')
    .upsert(
      {
        owner_id: user_id,
        legal_name: legal_name.trim(),
        ssn_ein: digits,
        ssn_ein_last4: digits.slice(-4),
        address: address.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        zip: zip.trim(),
        signature_accepted_at: new Date().toISOString(),
      },
      { onConflict: 'owner_id' }
    );

  if (error) {
    console.error('W-9 upsert error:', error.message);
    return NextResponse.json({ error: 'Failed to save W-9' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
