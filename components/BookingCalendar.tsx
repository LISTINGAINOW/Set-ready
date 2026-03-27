'use client';

import { useEffect, useMemo, useState } from 'react';
import { Ban, ChevronLeft, ChevronRight, Clock, DollarSign } from 'lucide-react';
import type { LocationAvailabilityBlock } from '@/types/location';
import { buildAvailabilityMap, DEFAULT_TIME_SLOTS, formatMonth, formatSelectedDate, getCalendarDays } from '@/lib/availability';

const SLOT_DURATION_HOURS = 3;
const SERVICE_FEE_RATE = 0.05;

type BookingAvailability = {
  date: string;
  timeSlots: string[];
};

interface BookingCalendarProps {
  bookings?: BookingAvailability[];
  blockedDates?: LocationAvailabilityBlock[];
  minimumBookingHours?: number;
  hourlyRate: number;
  mode?: 'guest' | 'host';
  onSelectionChange?: (selection: { selectedDate: string; selectedTimeSlots: string[] }) => void;
  onBook?: (selection: { selectedDate: string; selectedTimeSlots: string[] }) => void;
  onDayToggle?: (dateKey: string) => void;
}

export default function BookingCalendar({
  bookings = [],
  blockedDates = [],
  minimumBookingHours = 3,
  hourlyRate,
  mode = 'guest',
  onSelectionChange,
  onBook,
  onDayToggle,
}: BookingCalendarProps) {
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  const availabilityMap = useMemo(
    () => buildAvailabilityMap({ bookings, blockedDates, today }),
    [blockedDates, bookings, today]
  );

  const days = useMemo(() => getCalendarDays({ currentMonth, today, availabilityMap }), [availabilityMap, currentMonth, today]);

  const selectedDay = selectedDate ? days.find((day) => day.dateKey === selectedDate) : undefined;
  const selectedAvailableSlots = selectedDay?.availableSlots || [];
  const selectedDurationHours = selectedTimeSlots.length * SLOT_DURATION_HOURS;
  const baseRate = selectedDurationHours * hourlyRate;
  const serviceFee = baseRate * SERVICE_FEE_RATE;
  const total = baseRate + serviceFee;
  const meetsMinimum = selectedDurationHours >= minimumBookingHours;

  useEffect(() => {
    if (!selectedDate || !availabilityMap.has(selectedDate)) return;

    const nextSlots = availabilityMap.get(selectedDate)?.availableSlots || [];
    setSelectedTimeSlots((current) => current.filter((slot) => nextSlots.includes(slot)));
  }, [availabilityMap, selectedDate]);

  useEffect(() => {
    onSelectionChange?.({ selectedDate, selectedTimeSlots });
  }, [onSelectionChange, selectedDate, selectedTimeSlots]);

  const toggleTimeSlot = (slot: string) => {
    setSelectedTimeSlots((current) =>
      current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot]
    );
  };

  const canBook = Boolean(selectedDate && selectedTimeSlots.length > 0 && meetsMinimum);
  const isHostMode = mode === 'host';

  return (
    <div className={`rounded-3xl border p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] ${isHostMode ? 'border-white/10 bg-black/20 text-white' : 'border-black bg-white'}`}>
      <div className={`flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between ${isHostMode ? 'border-b border-white/10' : 'border-b border-black/10'}`}>
        <div>
          <h3 className={`text-2xl font-bold ${isHostMode ? 'text-white' : 'text-black'}`}>{isHostMode ? 'Availability controls' : 'Availability'}</h3>
          <p className={`mt-1 text-sm ${isHostMode ? 'text-white/60' : 'text-black/60'}`}>
            {isHostMode
              ? 'Click dates to block or unblock them. Existing bookings stay visible so you can avoid conflicts.'
              : 'Pick a date, choose time blocks, and see the total instantly.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`rounded-full px-4 py-2 text-sm font-semibold ${isHostMode ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}>${hourlyRate}/hr</div>
          <div className={`rounded-full px-4 py-2 text-sm font-semibold ${isHostMode ? 'bg-blue-500/15 text-blue-200' : 'bg-blue-50 text-blue-600'}`}>
            {minimumBookingHours} hour minimum
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className={`rounded-full border p-2 transition ${isHostMode ? 'border-white/10 text-white hover:border-blue-500 hover:text-blue-300' : 'border-black/10 text-black hover:border-blue-500 hover:text-blue-600'}`}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h4 className={`text-lg font-semibold ${isHostMode ? 'text-white' : 'text-black'}`}>{formatMonth(currentMonth)}</h4>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className={`rounded-full border p-2 transition ${isHostMode ? 'border-white/10 text-white hover:border-blue-500 hover:text-blue-300' : 'border-black/10 text-black hover:border-blue-500 hover:text-blue-600'}`}
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className={`mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] ${isHostMode ? 'text-white/40' : 'text-black/40'}`}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {days.map((day) => {
              const isSelected = selectedDate === day.dateKey;
              const isDisabled = !day.inMonth || day.isPast || (!isHostMode && !day.isAvailable);

              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => {
                    if (!day.inMonth || day.isPast) return;
                    if (isHostMode) {
                      setSelectedDate(day.dateKey);
                      setSelectedTimeSlots([]);
                      onDayToggle?.(day.dateKey);
                      return;
                    }
                    if (isDisabled) return;
                    setSelectedDate(day.dateKey);
                    setSelectedTimeSlots([]);
                  }}
                  disabled={isDisabled && !isHostMode}
                  className={[
                    'relative min-h-[78px] rounded-2xl border p-3 text-left transition',
                    !day.inMonth ? 'border-transparent bg-transparent text-white/20' : '',
                    isHostMode && day.inMonth && !day.isPast && !day.isBlocked ? 'border-white/10 bg-white/5 text-white hover:border-blue-500 hover:bg-blue-500/10' : '',
                    isHostMode && day.isBlocked ? 'border-blue-500/40 bg-blue-500/20 text-white' : '',
                    !isHostMode && day.inMonth && day.isAvailable ? 'border-black/10 bg-white text-black hover:border-blue-500 hover:shadow-sm' : '',
                    !isHostMode && day.inMonth && !day.isPast && !day.isAvailable ? 'border-black/10 bg-black/10 text-black/35 line-through' : '',
                    day.isPast ? (isHostMode ? 'border-white/5 bg-white/[0.03] text-white/25' : 'border-black/5 bg-black/5 text-black/20') : '',
                    isSelected ? (isHostMode ? 'border-white bg-white/15 shadow-[0_10px_30px_rgba(59,130,246,0.20)]' : 'border-blue-500 bg-blue-500 text-white shadow-[0_10px_30px_rgba(59,130,246,0.25)]') : '',
                  ].join(' ')}
                >
                  <span className="text-sm font-semibold">{day.dayNumber}</span>
                  {day.isBlocked && (
                    <span className={`absolute bottom-3 left-3 text-[11px] font-medium ${isHostMode || isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                      Blocked
                    </span>
                  )}
                  {!day.isBlocked && day.availableSlots.length > 0 && !isSelected && (
                    <span className={`absolute bottom-3 left-3 text-[11px] font-medium ${isHostMode ? 'text-blue-200' : 'text-blue-600'}`}>
                      {isHostMode ? `${day.availableSlots.length} open` : `${day.availableSlots.length} slots`}
                    </span>
                  )}
                  {!day.isBlocked && day.availableSlots.length === 0 && day.bookedSlots.length > 0 && (
                    <span className={`absolute bottom-3 left-3 text-[11px] font-medium ${isHostMode ? 'text-white/45' : 'text-black/35'}`}>
                      Booked
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${isHostMode ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-black/[0.02]'}`}>
            <div className={`flex items-center gap-2 ${isHostMode ? 'text-white' : 'text-black'}`}>
              {isHostMode ? <Ban className="h-4 w-4 text-blue-300" /> : <Clock className="h-4 w-4 text-blue-600" />}
              <h4 className="font-semibold">{isHostMode ? 'Day status' : 'Available time slots'}</h4>
            </div>

            {selectedDate ? (
              <>
                <p className={`mt-2 text-sm ${isHostMode ? 'text-white/60' : 'text-black/60'}`}>{formatSelectedDate(selectedDate)}</p>

                {isHostMode ? (
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-white/80">
                      <p><span className="font-semibold text-white">Status:</span> {selectedDay?.isBlocked ? 'Blocked' : selectedDay?.availableSlots.length ? 'Open for booking' : 'Fully booked'}</p>
                      <p className="mt-2"><span className="font-semibold text-white">Open slots:</span> {selectedDay?.availableSlots.length || 0}</p>
                      <p className="mt-2"><span className="font-semibold text-white">Booked slots:</span> {selectedDay?.bookedSlots.length || 0}</p>
                      {selectedDay?.blockedReason && <p className="mt-2"><span className="font-semibold text-white">Reason:</span> {selectedDay.blockedReason}</p>}
                    </div>
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-4 text-white/60">
                      Click the date again in the calendar to toggle its blocked state.
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {selectedAvailableSlots.length > 0 ? (
                      selectedAvailableSlots.map((slot) => {
                        const active = selectedTimeSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => toggleTimeSlot(slot)}
                            className={[
                              'rounded-full border px-4 py-3 text-sm font-semibold transition',
                              active
                                ? 'border-blue-500 bg-blue-500 text-white shadow-[0_10px_24px_rgba(59,130,246,0.2)]'
                                : 'border-black/10 bg-white text-black hover:border-blue-500 hover:text-blue-600',
                            ].join(' ')}
                          >
                            {slot}
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-black/15 bg-white px-4 py-6 text-sm text-black/50">
                        {selectedDay?.isBlocked ? 'This date is blocked by the host.' : 'No available slots for this date.'}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className={`mt-3 rounded-2xl border border-dashed px-4 py-6 text-sm ${isHostMode ? 'border-white/10 bg-black/20 text-white/50' : 'border-black/15 bg-white text-black/50'}`}>
                {isHostMode ? 'Select a date to inspect or toggle its availability.' : 'Select an available date to see open booking times.'}
              </div>
            )}
          </div>

          <div className={`rounded-2xl border p-5 ${isHostMode ? 'border-blue-500/20 bg-blue-500/10' : 'border-blue-200 bg-blue-50'}`}>
            <div className={`flex items-center gap-2 ${isHostMode ? 'text-white' : 'text-black'}`}>
              <DollarSign className={`h-4 w-4 ${isHostMode ? 'text-blue-300' : 'text-blue-600'}`} />
              <h4 className="font-semibold">{isHostMode ? 'Availability summary' : 'Booking summary'}</h4>
            </div>
            <div className={`mt-4 space-y-3 text-sm ${isHostMode ? 'text-white/70' : 'text-black/70'}`}>
              <div className="flex items-center justify-between">
                <span>Date</span>
                <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>{selectedDate ? formatSelectedDate(selectedDate) : 'Not selected'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isHostMode ? 'Open slots' : 'Duration'}</span>
                <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>{isHostMode ? (selectedDay?.availableSlots.length || 0) : `${selectedDurationHours || 0} hours`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rate</span>
                <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>${hourlyRate}/hr</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isHostMode ? 'Booked slots' : 'Base price'}</span>
                <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>{isHostMode ? (selectedDay?.bookedSlots.length || 0) : `$${baseRate.toFixed(2)}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isHostMode ? 'Status' : 'Service fee'}</span>
                <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>{isHostMode ? (selectedDay?.isBlocked ? 'Blocked' : 'Live') : `$${serviceFee.toFixed(2)}`}</span>
              </div>
              <div className={`pt-3 ${isHostMode ? 'border-t border-blue-400/20' : 'border-t border-blue-200'}`}>
                <div className={`flex items-center justify-between text-base font-bold ${isHostMode ? 'text-white' : 'text-black'}`}>
                  <span>{isHostMode ? 'Guest bookable?' : 'Total'}</span>
                  <span>{isHostMode ? (selectedDay?.isAvailable ? 'Yes' : 'No') : `$${total.toFixed(2)}`}</span>
                </div>
              </div>
            </div>

            {!isHostMode && (
              <>
                <div className="mt-4 rounded-2xl border border-white bg-white px-4 py-3 text-sm text-black/60">
                  {selectedTimeSlots.length > 0 ? selectedTimeSlots.join(' • ') : 'Choose one or more 3-hour time blocks.'}
                </div>

                {!meetsMinimum && selectedTimeSlots.length > 0 && (
                  <p className="mt-3 text-sm font-medium text-blue-700">
                    Add more time to reach the {minimumBookingHours}-hour minimum.
                  </p>
                )}

                <button
                  type="button"
                  disabled={!canBook}
                  onClick={() => canBook && onBook?.({ selectedDate, selectedTimeSlots })}
                  className="mt-5 w-full rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Book
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
