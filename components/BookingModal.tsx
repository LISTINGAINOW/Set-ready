'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { BadgeDollarSign, MessageSquareQuote, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCsrfToken, isValidEmail, sanitizeEmail, sanitizeInput } from '@/lib/client-security';
import { calculateBookingPricing, MINIMUM_BOOKING_TOTAL, PRODUCER_FEE_RATE } from '@/lib/pricing';

const AreaMap = dynamic(() => import('@/components/AreaMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-black bg-white/60 p-4 text-sm text-black/60">
      Loading approximate location map…
    </div>
  ),
});

interface BookingModalProps {
  locationId: string;
  locationTitle: string;
  hourlyRate: number;
  minimumBookingHours?: number;
  city: string;
  state: string;
  neighborhood?: string;
  privacyNotice?: string;
  securityDeposit?: number;
  securityDepositRequiredWhen?: string;
  initialDate?: string;
  initialTimeSlots?: string[];
  triggerLabel?: string;
  triggerClassName?: string;
}

interface StoredUser {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified?: boolean;
}

const productionTypes = ['Photo shoot', 'Video production', 'Commercial', 'Lifestyle', 'Editorial'];
const TIME_SLOT_RANGES: Record<string, { startTime: string; endTime: string }> = {
  '9am-12pm': { startTime: '09:00', endTime: '12:00' },
  '12pm-3pm': { startTime: '12:00', endTime: '15:00' },
  '3pm-6pm': { startTime: '15:00', endTime: '18:00' },
  '6pm-9pm': { startTime: '18:00', endTime: '21:00' },
};

function getDurationInHours(startTime: string, endTime: string) {
  if (!startTime || !endTime || startTime >= endTime) return 0;

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  return (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
}

function normalizeSelectedTimeSlots(timeSlots: string[]) {
  const validSlots = Array.from(new Set(timeSlots.filter((slot) => slot in TIME_SLOT_RANGES))).sort(
    (a, b) => TIME_SLOT_RANGES[a].startTime.localeCompare(TIME_SLOT_RANGES[b].startTime)
  );

  if (validSlots.length === 0) {
    return {
      selectedTimeSlots: [] as string[],
      startTime: '',
      endTime: '',
    };
  }

  return {
    selectedTimeSlots: validSlots,
    startTime: TIME_SLOT_RANGES[validSlots[0]].startTime,
    endTime: TIME_SLOT_RANGES[validSlots[validSlots.length - 1]].endTime,
  };
}

export default function BookingModal({
  locationId,
  locationTitle,
  hourlyRate,
  minimumBookingHours = 2,
  city,
  state,
  neighborhood,
  privacyNotice,
  securityDeposit = 0,
  securityDepositRequiredWhen = 'Always',
  initialDate = '',
  initialTimeSlots = [],
  triggerLabel = 'Request Booking',
  triggerClassName = 'w-full rounded-xl bg-blue-500 py-4 text-xl font-bold text-white transition-colors hover:bg-blue-600',
}: BookingModalProps) {
  const router = useRouter();
  const initialSelection = useMemo(() => normalizeSelectedTimeSlots(initialTimeSlots), [initialTimeSlots]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: initialDate,
    startTime: initialSelection.startTime,
    endTime: initialSelection.endTime,
    productionType: 'Photo shoot',
    crewSize: '',
    budget: '',
    specialRequirements: '',
    notes: '',
  });
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(initialSelection.selectedTimeSlots);
  const [showOfferFields, setShowOfferFields] = useState(false);
  const [offerData, setOfferData] = useState({
    proposedRate: '',
    proposedDurationHours: '',
    message: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    try {
      const parsed = JSON.parse(storedUser) as StoredUser;
      setUser(parsed);
      setFormData((current) => ({
        ...current,
        name: current.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim(),
        email: current.email || parsed.email || '',
      }));
    } catch {
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    const normalized = normalizeSelectedTimeSlots(initialTimeSlots);
    setSelectedTimeSlots(normalized.selectedTimeSlots);
    setFormData((current) => ({
      ...current,
      date: initialDate || current.date,
      startTime: normalized.startTime,
      endTime: normalized.endTime,
    }));
  }, [initialDate, initialTimeSlots]);

  const durationHours = useMemo(
    () => getDurationInHours(formData.startTime, formData.endTime),
    [formData.startTime, formData.endTime]
  );
  const baseRate = durationHours > 0 ? durationHours * hourlyRate : 0;
  const pricing = calculateBookingPricing(baseRate);
  const producerFee = pricing.producerFee;
  const bookingMinimumAdjustment = pricing.bookingMinimumAdjustment;
  const depositAmount = securityDeposit > 0 ? securityDeposit : 0;
  const total = pricing.total + depositAmount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'email' ? sanitizeEmail(value) : sanitizeInput(value);
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOfferData((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
  };

  const resetForm = () => {
    const normalized = normalizeSelectedTimeSlots(initialTimeSlots);
    setSelectedTimeSlots(normalized.selectedTimeSlots);
    setFormData({
      name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      email: user?.email || '',
      phone: '',
      date: initialDate,
      startTime: normalized.startTime,
      endTime: normalized.endTime,
      productionType: 'Photo shoot',
      crewSize: '',
      budget: '',
      specialRequirements: '',
      notes: '',
    });
    setShowOfferFields(false);
    setOfferData({
      proposedRate: '',
      proposedDurationHours: '',
      message: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/locations/${locationId}`)}`);
      return;
    }

    if (!user.emailVerified) {
      router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.date || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      setError('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError('Date must be today or in the future.');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time.');
      return;
    }

    if (durationHours < minimumBookingHours) {
      setError(`Minimum booking is ${minimumBookingHours} hours.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken(),
        },
        body: JSON.stringify({
          locationId,
          ...formData,
          selectedTimeSlots,
          baseRate,
          serviceFee: producerFee,
          securityDeposit: depositAmount,
          securityDepositRequiredWhen,
          total,
          offer: showOfferFields
            ? {
                proposedRate: offerData.proposedRate ? Number(offerData.proposedRate) : null,
                proposedDurationHours: offerData.proposedDurationHours ? Number(offerData.proposedDurationHours) : null,
                message: offerData.message.trim(),
              }
            : null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const booking = result?.booking;
        const confirmationQuery = new URLSearchParams({
          bookingId: booking?.id || '',
          locationId,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          total: total.toFixed(2),
          baseRate: baseRate.toFixed(2),
          serviceFee: producerFee.toFixed(2),
          securityDeposit: depositAmount.toFixed(2),
          name: formData.name,
        });

        setIsOpen(false);
        resetForm();
        router.push(`/booking/confirmation?${confirmationQuery.toString()}`);
      } else {
        const errorText = await response.text();
        setError(`Server error: ${errorText}`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/locations/${locationId}`)}`);
      return;
    }

    if (!user.emailVerified) {
      router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
      return;
    }

    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button onClick={openModal} className={triggerClassName}>
        {triggerLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-black bg-white">
            <div className="flex items-center justify-between border-b border-black p-8">
              <div>
                <h2 className="text-3xl font-bold text-black">Request Booking</h2>
                <p className="text-black/60">for {locationTitle}</p>
              </div>
              <button onClick={closeModal} className="rounded-full p-2 hover:bg-black/5">
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mx-8 mt-6 rounded-lg border border-blue-500 bg-blue-50 p-4 text-blue-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 p-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-black/60">Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-2 block text-black/60">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-2 block text-black/60">Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-2 block text-black/60">Date Needed *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-2 block text-black/60">Start Time *</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-2 block text-black/60">End Time *</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {selectedTimeSlots.length > 0 && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-700">Selected from calendar</p>
                  <p className="mt-1 text-sm text-blue-600">{selectedTimeSlots.join(', ')}</p>
                </div>
              )}

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-700">Booking flow</p>
                <p className="mt-1 text-sm text-blue-600">Step 1: booking details · Step 2: pricing review · Step 3: insurance · Step 4: confirmation</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-black bg-white/40 p-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-black">Approximate location - exact address provided after booking</p>
                    <p className="mt-1 text-xs text-black/60">
                      This map shows the general {neighborhood ? `${neighborhood}, ` : ''}{city}, {state} area only.
                    </p>
                  </div>
                  <AreaMap city={city} state={state} neighborhood={neighborhood} privacyNotice={privacyNotice} compact />
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex items-center justify-between text-sm text-black/80">
                    <span>Hourly rate</span>
                    <span>${hourlyRate.toFixed(2)}/hr</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-black/80">
                    <span>Estimated booking time</span>
                    <span>{durationHours > 0 ? `${durationHours} hour${durationHours === 1 ? '' : 's'}` : `Minimum ${minimumBookingHours} hours`}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-black/80">
                    <span>Base rate</span>
                    <span>${baseRate.toFixed(2)}</span>
                  </div>
                  {showOfferFields && offerData.proposedRate && (
                    <div className="mt-3 flex items-center justify-between text-sm font-semibold text-blue-700">
                      <span>Guest offer</span>
                      <span>${Number(offerData.proposedRate || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between text-sm text-black/80">
                    <span>Producer service fee ({Math.round(PRODUCER_FEE_RATE * 100)}%)</span>
                    <span>${producerFee.toFixed(2)}</span>
                  </div>
                  {bookingMinimumAdjustment > 0 && (
                    <div className="mt-3 flex items-center justify-between text-sm text-black/80">
                      <span>Minimum booking adjustment</span>
                      <span>${bookingMinimumAdjustment.toFixed(2)}</span>
                    </div>
                  )}
                  {depositAmount > 0 && (
                    <div className="mt-3 flex items-center justify-between text-sm text-black/80">
                      <span>Security deposit</span>
                      <span>${depositAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-blue-200 pt-4 text-lg font-bold text-black">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <p className="mt-3 text-xs text-black/60">
                    Transparent pricing: a 15% service fee is added for producers at checkout, hosts keep 100%, and every booking has a $49 minimum before any refundable security deposit.
                  </p>
                  {depositAmount > 0 && (
                    <div className="mt-3 rounded-xl border border-blue-200 bg-white/80 p-3 text-xs text-black/70">
                      <p><span className="font-semibold text-black">Security deposit terms:</span> This ${depositAmount.toFixed(2)} hold is charged {securityDepositRequiredWhen.toLowerCase()} and is typically returned within 7 days after checkout if the space is left in agreed condition.</p>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-black/60">Bookings start at ${MINIMUM_BOOKING_TOTAL}. Guests are responsible for cleaning if the property is left in poor condition.</p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-black/60">Production Type *</label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {productionTypes.map((type) => (
                    <label
                      key={type}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 ${formData.productionType === type ? 'border-blue-500 bg-blue-500 text-white' : 'border-black bg-white text-black'}`}
                    >
                      <input type="radio" name="productionType" value={type} checked={formData.productionType === type} onChange={handleChange} className="sr-only" />
                      <span className="font-semibold">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                      <BadgeDollarSign className="h-4 w-4" />
                      Make an offer
                    </div>
                    <p className="mt-1 text-sm text-blue-600">Need a different price or a slightly different duration? Send the host a proposal instead of a straight booking request.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOfferFields((current) => !current)}
                    className="rounded-full border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    {showOfferFields ? 'Hide offer' : 'Make offer'}
                  </button>
                </div>

                {showOfferFields && (
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-black/60">Proposed total price</label>
                      <input type="number" min="0" step="25" name="proposedRate" value={offerData.proposedRate} onChange={handleOfferChange} className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1500" />
                    </div>
                    <div>
                      <label className="mb-2 block text-black/60">Proposed duration (hours)</label>
                      <input type="number" min={minimumBookingHours} step="1" name="proposedDurationHours" value={offerData.proposedDurationHours} onChange={handleOfferChange} className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={String(durationHours || minimumBookingHours)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-black/60">Offer message to host</label>
                      <textarea name="message" value={offerData.message} onChange={handleOfferChange} rows={3} className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="We can be flexible on timing and keep the crew small if that helps on price." />
                    </div>
                    <div className="md:col-span-2 rounded-xl border border-blue-200 bg-white/70 p-3 text-xs text-black/70">
                      <div className="flex items-center gap-2 font-semibold text-blue-700">
                        <MessageSquareQuote className="h-4 w-4" />
                        How offers work
                      </div>
                      <p className="mt-2">Hosts can accept, decline, or counter-offer from their dashboard. Your negotiation thread keeps the latest amount, duration, and message history visible.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-black/60">Crew Size</label>
                  <input type="number" name="crewSize" value={formData.crewSize} onChange={handleChange} min="1" max="500" className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 12" />
                </div>
                <div>
                  <label className="mb-2 block text-black/60">Budget</label>
                  <select name="budget" value={formData.budget} onChange={handleChange} className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select budget range</option>
                    <option value="Under $1K">Under $1K</option>
                    <option value="$1K–$5K">$1K–$5K</option>
                    <option value="$5K–$10K">$5K–$10K</option>
                    <option value="$10K–$25K">$10K–$25K</option>
                    <option value="$25K–$50K">$25K–$50K</option>
                    <option value="$50K+">$50K+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-black/60">Special Requirements</label>
                <textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleChange} rows={3} className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Generator access, specific rooms, equipment staging area, etc." />
              </div>

              <div>
                <label className="mb-2 block text-black/60">Additional Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Anything else the host should know." />
              </div>

              <div className="flex justify-end gap-4 border-t border-black pt-6">
                <button type="button" onClick={closeModal} className="rounded-lg border border-black px-6 py-3 font-semibold text-black hover:bg-black/5">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600 disabled:opacity-50">
                  {isSubmitting ? 'Submitting...' : showOfferFields ? 'Send Offer Request' : 'Submit Booking Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
