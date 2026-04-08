import { createAdminClient } from '@/utils/supabase/admin';

export interface BookingPropertySummary {
  id: string;
  property_name: string | null;
  owner_email: string | null;
  owner_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
}

export interface BookingRequestRow {
  id: string;
  property_id: string;
  renter_id: string | null;
  company_name: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  production_type: string;
  booking_start: string | null;
  booking_end: string | null;
  notes: string | null;
  damage_deposit_amount: number | null;
  base_rate: number | null;
  service_fee: number | null;
  total_amount: number | null;
  selected_time_slots: string[] | null;
  status: string;
  payment_status: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  payment_failed_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreatePendingPaymentBookingInput {
  propertyId: string;
  renterId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  productionType: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  companyName?: string;
  securityDepositAmount?: number;
  baseRate: number;
  serviceFee: number;
  totalAmount: number;
  selectedTimeSlots?: string[];
}

export function combineBookingDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

export function normalizeBookingNotes(options: {
  notes?: string;
  specialRequirements?: string;
  budget?: string;
  crewSize?: string;
  securityDepositRequiredWhen?: string;
}) {
  const sections = [
    options.notes?.trim() ? `Notes: ${options.notes.trim()}` : '',
    options.specialRequirements?.trim() ? `Special requirements: ${options.specialRequirements.trim()}` : '',
    options.budget?.trim() ? `Budget: ${options.budget.trim()}` : '',
    options.crewSize?.trim() ? `Crew size: ${options.crewSize.trim()}` : '',
    options.securityDepositRequiredWhen?.trim() ? `Security deposit applies: ${options.securityDepositRequiredWhen.trim()}` : '',
  ].filter(Boolean);

  return sections.join('\n');
}

export async function getPropertySummary(propertyId: string): Promise<BookingPropertySummary | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('properties')
    .select('id, property_name, owner_email, owner_name, address, city, state')
    .eq('id', propertyId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as BookingPropertySummary | null) ?? null;
}

export async function createPendingPaymentBooking(
  input: CreatePendingPaymentBookingInput
): Promise<BookingRequestRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('booking_requests')
    .insert({
      property_id: input.propertyId,
      renter_id: input.renterId,
      company_name: input.companyName?.trim() || '',
      contact_name: input.contactName.trim(),
      contact_email: input.contactEmail.trim().toLowerCase(),
      contact_phone: input.contactPhone.trim(),
      production_type: input.productionType.trim(),
      booking_start: combineBookingDateTime(input.bookingDate, input.startTime),
      booking_end: combineBookingDateTime(input.bookingDate, input.endTime),
      notes: input.notes?.trim() || null,
      damage_deposit_amount: input.securityDepositAmount ?? 0,
      base_rate: input.baseRate,
      service_fee: input.serviceFee,
      total_amount: input.totalAmount,
      selected_time_slots: input.selectedTimeSlots ?? [],
      status: 'pending_payment',
      payment_status: 'pending',
      hold_harmless_accepted: false,
      tos_accepted: false,
      content_permission_accepted: false,
      permit_confirmed: false,
    })
    .select(`
      id,
      property_id,
      renter_id,
      company_name,
      contact_name,
      contact_email,
      contact_phone,
      production_type,
      booking_start,
      booking_end,
      notes,
      damage_deposit_amount,
      base_rate,
      service_fee,
      total_amount,
      selected_time_slots,
      status,
      payment_status,
      stripe_payment_intent_id,
      stripe_checkout_session_id,
      payment_failed_reason,
      reviewed_at,
      created_at,
      updated_at
    `)
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to create booking');
  }

  return data as BookingRequestRow;
}

export async function getBookingById(bookingId: string): Promise<BookingRequestRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('booking_requests')
    .select(`
      id,
      property_id,
      renter_id,
      company_name,
      contact_name,
      contact_email,
      contact_phone,
      production_type,
      booking_start,
      booking_end,
      notes,
      damage_deposit_amount,
      base_rate,
      service_fee,
      total_amount,
      selected_time_slots,
      status,
      payment_status,
      stripe_payment_intent_id,
      stripe_checkout_session_id,
      payment_failed_reason,
      reviewed_at,
      created_at,
      updated_at
    `)
    .eq('id', bookingId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as BookingRequestRow | null) ?? null;
}

export function getDisplayStatus(status: string) {
  switch (status) {
    case 'pending_payment':
      return 'pending';
    case 'confirmed':
    case 'approved':
      return 'confirmed';
    default:
      return status;
  }
}

export function formatDateOnly(iso?: string | null) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function formatTimeOnly(iso?: string | null) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(11, 16);
}

export function mapBookingRequestToApi(
  booking: BookingRequestRow,
  propertyName?: string | null
) {
  return {
    id: booking.id,
    locationId: booking.property_id,
    name: booking.contact_name,
    email: booking.contact_email,
    phone: booking.contact_phone,
    date: formatDateOnly(booking.booking_start),
    startTime: formatTimeOnly(booking.booking_start),
    endTime: formatTimeOnly(booking.booking_end),
    productionType: booking.production_type,
    notes: booking.notes ?? '',
    status: getDisplayStatus(booking.status),
    rawStatus: booking.status,
    paymentStatus: booking.payment_status ?? 'pending',
    baseRate: Number(booking.base_rate ?? 0),
    serviceFee: Number(booking.service_fee ?? 0),
    total: Number(booking.total_amount ?? 0),
    securityDeposit: Number(booking.damage_deposit_amount ?? 0),
    selectedTimeSlots: booking.selected_time_slots ?? [],
    stripePaymentIntentId: booking.stripe_payment_intent_id,
    stripeCheckoutSessionId: booking.stripe_checkout_session_id,
    propertyName: propertyName ?? null,
    createdAt: booking.created_at,
    reviewedAt: booking.reviewed_at,
  };
}
