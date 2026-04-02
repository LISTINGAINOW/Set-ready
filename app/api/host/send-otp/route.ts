import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createOtp } from '@/lib/host-auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check that this email is an owner of at least one property
    const supabase = createAdminClient();
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id')
      .eq('owner_email', normalizedEmail)
      .limit(1);

    if (error) {
      console.error('Host OTP: DB error', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Security: always return same response to prevent email enumeration
    // But only send code if owner has properties
    if (properties && properties.length > 0) {
      const code = await createOtp(normalizedEmail);

      // Send the code via email
      // In production: use Resend/SendGrid/SES
      // For now, log it to server (dev only)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[HOST OTP] ${normalizedEmail}: ${code}`);
      }

      // TODO: Wire up real email sending
      // await sendHostOtpEmail(normalizedEmail, code);
    }

    return NextResponse.json({ ok: true, message: 'If this email is registered, a code will be sent.' });
  } catch (err) {
    console.error('Host send-otp error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
