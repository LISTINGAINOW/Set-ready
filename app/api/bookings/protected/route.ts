import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createAdminClient } from '@/utils/supabase/admin';
import { getClientIp, isValidEmail, sanitizeObject, writeAuditLog } from '@/lib/security';
import { sendBookingRequestConfirmation, sendBookingApproved, sendBookingRejected, type BookingRecord } from '@/lib/email';

interface ProtectedBookingRequest {
  propertyId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  productionType: string;
  idDocumentPath: string;
  coiDocumentPath: string;
  coiExpiryDate: string;
  damageDepositAmount: number;
  holdHarmlessAccepted: boolean;
  tosAccepted: boolean;
  contentPermissionAccepted: boolean;
  permitConfirmed: boolean;
  bookingStart?: string;
  bookingEnd?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    const raw = sanitizeObject((await request.json()) as Record<string, unknown>);
    const body = raw as unknown as ProtectedBookingRequest;

    // Validate required fields
    const required: (keyof ProtectedBookingRequest)[] = [
      'propertyId', 'companyName', 'contactName', 'contactEmail',
      'contactPhone', 'productionType', 'idDocumentPath', 'coiDocumentPath',
    ];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    if (!isValidEmail(body.contactEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!body.holdHarmlessAccepted) {
      return NextResponse.json({ error: 'Hold harmless agreement must be accepted' }, { status: 400 });
    }

    if (!body.tosAccepted) {
      return NextResponse.json({ error: 'Terms of service must be accepted' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const bookingId = uuidv4();

    const { data, error } = await supabase
      .from('booking_requests')
      .insert({
        id: bookingId,
        property_id: body.propertyId,
        company_name: body.companyName,
        contact_name: body.contactName,
        contact_email: body.contactEmail,
        contact_phone: body.contactPhone,
        production_type: body.productionType,
        id_document_url: body.idDocumentPath,
        coi_document_url: body.coiDocumentPath,
        coi_expiry_date: body.coiExpiryDate || null,
        damage_deposit_amount: body.damageDepositAmount ?? 0,
        hold_harmless_accepted: body.holdHarmlessAccepted,
        hold_harmless_accepted_at: body.holdHarmlessAccepted ? new Date().toISOString() : null,
        hold_harmless_ip: ip,
        tos_accepted: body.tosAccepted,
        tos_accepted_at: body.tosAccepted ? new Date().toISOString() : null,
        tos_ip: ip,
        content_permission_accepted: body.contentPermissionAccepted ?? false,
        content_permission_accepted_at: body.contentPermissionAccepted ? new Date().toISOString() : null,
        permit_confirmed: body.permitConfirmed ?? false,
        booking_start: body.bookingStart || null,
        booking_end: body.bookingEnd || null,
        notes: body.notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      writeAuditLog('booking.protected.error', { ip, error: error.message });
      return NextResponse.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 });
    }

    writeAuditLog('booking.protected.created', {
      ip,
      bookingId,
      propertyId: body.propertyId,
      email: body.contactEmail,
    });

    // Look up property name for email (best-effort — never block the response)
    let propertyName: string | undefined;
    try {
      const { data: prop } = await supabase
        .from('properties')
        .select('property_name')
        .eq('id', body.propertyId)
        .single();
      propertyName = prop?.property_name ?? undefined;
    } catch {
      // non-blocking — email will fall back to property_id
    }

    const bookingRecord: BookingRecord = {
      ...data,
      property_name: propertyName,
    };

    // Fire-and-forget — never block the response
    void sendBookingRequestConfirmation(bookingRecord);

    return NextResponse.json({ booking: data, message: 'Booking request submitted successfully.' }, { status: 201 });
  } catch (err) {
    console.error('Protected booking error:', err);
    writeAuditLog('booking.protected.error', { ip, error: err instanceof Error ? err.message : 'unknown' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');

  // Require admin password for GET
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    writeAuditLog('booking.protected.unauthorized', { ip });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from('booking_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ bookings: data });
  } catch (err) {
    console.error('Protected bookings GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request);

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    writeAuditLog('booking.protected.unauthorized_patch', { ip });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, adminNotes } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const allowedStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('booking_requests')
      .update({
        status,
        admin_notes: adminNotes ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    writeAuditLog('booking.protected.status_updated', { ip, bookingId: id, status });

    // Send email notification based on new status — fire-and-forget
    if (status === 'approved' || status === 'rejected') {
      let propertyName: string | undefined;
      try {
        const { data: prop } = await supabase
          .from('properties')
          .select('property_name')
          .eq('id', data.property_id)
          .single();
        propertyName = prop?.property_name ?? undefined;
      } catch {
        // non-blocking
      }

      const bookingRecord: BookingRecord = { ...data, property_name: propertyName };

      if (status === 'approved') {
        const bookingUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://setvenue.com'}/dashboard/bookings/${id}`;
        void sendBookingApproved(bookingRecord, bookingUrl);
      } else {
        const reason = adminNotes ?? 'Your booking request did not meet our current requirements.';
        void sendBookingRejected(bookingRecord, reason);
      }
    }

    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error('Protected booking PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
