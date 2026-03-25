'use client';

import { useState } from 'react';
import BookingCalendar from '@/components/BookingCalendar';
import BookingModal from '@/components/BookingModal';
import type { LocationAvailabilityBlock } from '@/types/location';

type BookingAvailability = {
  date: string;
  timeSlots: string[];
};

interface BookingSectionProps {
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
  bookings?: BookingAvailability[];
  blockedDates?: LocationAvailabilityBlock[];
}

export default function BookingSection({
  locationId,
  locationTitle,
  hourlyRate,
  minimumBookingHours = 3,
  city,
  state,
  neighborhood,
  privacyNotice,
  securityDeposit,
  securityDepositRequiredWhen,
  bookings = [],
  blockedDates = [],
}: BookingSectionProps) {
  const [selection, setSelection] = useState<{ selectedDate: string; selectedTimeSlots: string[] }>({
    selectedDate: '',
    selectedTimeSlots: [],
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-2xl font-bold text-black">Book this location</h2>
        <BookingCalendar
          bookings={bookings}
          blockedDates={blockedDates}
          minimumBookingHours={minimumBookingHours}
          hourlyRate={hourlyRate}
          onSelectionChange={setSelection}
        />
      </div>

      <div className="rounded-2xl border border-black bg-white/60 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-black">Ready to lock it in?</h3>
            <p className="mt-1 text-sm text-black/60">
              Your selected date and time slots will be prefilled in the booking request.
            </p>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[240px]">
            <BookingModal
              locationId={locationId}
              locationTitle={locationTitle}
              hourlyRate={hourlyRate}
              minimumBookingHours={minimumBookingHours}
              city={city}
              state={state}
              neighborhood={neighborhood}
              privacyNotice={privacyNotice}
              securityDeposit={securityDeposit}
              securityDepositRequiredWhen={securityDepositRequiredWhen}
              initialDate={selection.selectedDate}
              initialTimeSlots={selection.selectedTimeSlots}
              triggerLabel={selection.selectedDate && selection.selectedTimeSlots.length > 0 ? 'Book selected time' : 'Request Booking'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
