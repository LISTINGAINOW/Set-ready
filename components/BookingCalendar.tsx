'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Ban, ChevronLeft, ChevronRight, Clock, DollarSign } from 'lucide-react';
import type { LocationAvailabilityBlock } from '@/types/location';
import { buildAvailabilityMap, DEFAULT_TIME_SLOTS, formatMonth, formatSelectedDate, getCalendarDays, toDateKey, parseDateKey } from '@/lib/availability';

const SLOT_DURATION_HOURS = 3;
const SERVICE_FEE_RATE = 0.10; // Must match PRODUCER_FEE_RATE in lib/pricing.ts

type BookingAvailability = {
  date: string;
  timeSlots: string[];
};

interface BookingCalendarProps {
  bookings?: BookingAvailability[];
  blockedDates?: LocationAvailabilityBlock[];
  minimumBookingHours?: number;
  hourlyRate: number;
  pricePerDay?: number;
  mode?: 'guest' | 'host';
  onSelectionChange?: (selection: {
    selectedDate: string;
    selectedDates: string[];
    selectedTimeSlots: string[];
    isMultiDay: boolean;
  }) => void;
  onBook?: (selection: {
    selectedDate: string;
    selectedDates: string[];
    selectedTimeSlots: string[];
    isMultiDay: boolean;
  }) => void;
  onDayToggle?: (dateKey: string) => void;
}

function getDatesBetween(start: string, end: string): string[] {
  const startDate = parseDateKey(start);
  const endDate = parseDateKey(end);
  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    dates.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export default function BookingCalendar({
  bookings = [],
  blockedDates = [],
  minimumBookingHours = 3,
  hourlyRate,
  pricePerDay,
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
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  const availabilityMap = useMemo(
    () => buildAvailabilityMap({ bookings, blockedDates, today }),
    [blockedDates, bookings, today]
  );

  const days = useMemo(() => getCalendarDays({ currentMonth, today, availabilityMap }), [availabilityMap, currentMonth, today]);

  const selectedDates = useMemo(() => {
    if (rangeStart && rangeEnd) return getDatesBetween(rangeStart, rangeEnd);
    if (rangeStart) return [rangeStart];
    return [];
  }, [rangeStart, rangeEnd]);

  // Check for blocked dates in range
  const blockedInRange = useMemo(() => {
    return selectedDates.filter((d) => {
      const avail = availabilityMap.get(d);
      return avail?.isBlocked;
    });
  }, [selectedDates, availabilityMap]);

  const numDays = selectedDates.length;
  const isMultiDay = numDays > 1;
  const activeDate = rangeStart;

  const selectedDay = activeDate ? days.find((day) => day.dateKey === activeDate) : undefined;
  const selectedAvailableSlots = useMemo(() => {
    if (selectedDates.length === 0) return [] as string[];
    const slotSets = selectedDates.map((dateKey) => new Set(availabilityMap.get(dateKey)?.availableSlots || []));
    return DEFAULT_TIME_SLOTS.filter((slot) => slotSets.every((set) => set.has(slot)));
  }, [availabilityMap, selectedDates]);
  const selectedHoursPerDay = selectedTimeSlots.length * SLOT_DURATION_HOURS;
  const totalHours = selectedHoursPerDay * Math.max(numDays, 1);
  const isFullDayAcrossRange = selectedTimeSlots.length === DEFAULT_TIME_SLOTS.length;
  const baseRate = isMultiDay && pricePerDay && pricePerDay > 0 && isFullDayAcrossRange
    ? pricePerDay * numDays
    : totalHours * hourlyRate;

  const serviceFee = baseRate * SERVICE_FEE_RATE;
  const total = baseRate + serviceFee;
  const meetsMinimum = selectedHoursPerDay >= minimumBookingHours;

  useEffect(() => {
    onSelectionChange?.({
      selectedDate: rangeStart,
      selectedDates,
      selectedTimeSlots,
      isMultiDay,
    });
  }, [onSelectionChange, rangeStart, selectedDates, selectedTimeSlots, isMultiDay]);

  useEffect(() => {
    setSelectedTimeSlots((current) => current.filter((slot) => selectedAvailableSlots.includes(slot)));
  }, [selectedAvailableSlots]);

  const handleDayClick = useCallback((day: ReturnType<typeof getCalendarDays>[number]) => {
    if (!day.inMonth || day.isPast) return;

    if (mode === 'host') {
      setRangeStart(day.dateKey);
      setRangeEnd('');
      setSelectedTimeSlots([]);
      onDayToggle?.(day.dateKey);
      return;
    }

    if (!day.isAvailable) return;

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day.dateKey);
      setRangeEnd('');
      setSelectedTimeSlots([]);
      return;
    }

    if (day.dateKey < rangeStart) {
      setRangeEnd(rangeStart);
      setRangeStart(day.dateKey);
    } else if (day.dateKey === rangeStart) {
      setRangeEnd('');
    } else {
      setRangeEnd(day.dateKey);
    }
  }, [mode, rangeStart, rangeEnd, onDayToggle]);

  const toggleTimeSlot = (slot: string) => {
    setSelectedTimeSlots((current) =>
      current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot]
    );
  };

  const selectAllSlots = () => {
    setSelectedTimeSlots([...DEFAULT_TIME_SLOTS]);
  };

  const canBook = Boolean(rangeStart && selectedTimeSlots.length > 0 && meetsMinimum && blockedInRange.length === 0);

  const isHostMode = mode === 'host';

  const isInRange = (dateKey: string) => {
    if (!rangeStart) return false;
    if (!rangeEnd) return dateKey === rangeStart;
    return dateKey >= rangeStart && dateKey <= rangeEnd;
  };

  const isRangeEdge = (dateKey: string) => {
    return dateKey === rangeStart || dateKey === rangeEnd;
  };

  return (
    <div className={`rounded-3xl border p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] ${isHostMode ? 'border-white/10 bg-black/20 text-white' : 'border-black bg-white'}`}>
      <div className={`flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between ${isHostMode ? 'border-b border-white/10' : 'border-b border-black/10'}`}>
        <div>
          <h3 className={`text-2xl font-bold ${isHostMode ? 'text-white' : 'text-black'}`}>{isHostMode ? 'Availability controls' : 'Availability'}</h3>
          <p className={`mt-1 text-sm ${isHostMode ? 'text-white/60' : 'text-black/60'}`}>
            {isHostMode
              ? 'Click dates to block or unblock them. Existing bookings stay visible so you can avoid conflicts.'
              : 'Click one date for a single-day booking, or click a second date for a multi-day booking. Then choose the hours you need.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`rounded-full px-4 py-2 text-sm font-semibold ${isHostMode ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}>${hourlyRate}/hr</div>
          {pricePerDay && pricePerDay > 0 && (
            <div className={`rounded-full px-4 py-2 text-sm font-semibold ${isHostMode ? 'bg-white/80 text-black' : 'bg-blue-100 text-blue-700'}`}>${pricePerDay.toLocaleString()}/day</div>
          )}
          <div className={`rounded-full px-4 py-2 text-sm font-semibold ${isHostMode ? 'bg-blue-500/15 text-blue-200' : 'bg-blue-50 text-blue-600'}`}>
            {minimumBookingHours} hour minimum
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
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

          <div className="mt-2 grid grid-cols-7 gap-1.5 lg:gap-2">
            {days.map((day) => {
              const isSelected = isInRange(day.dateKey);
              const isEdge = isRangeEdge(day.dateKey);
              const isDisabled = !day.inMonth || day.isPast || (!isHostMode && !day.isAvailable);

              // Determine status label and badge style for this cell
              const isAvailableOpen = day.inMonth && !day.isPast && !day.isBlocked && day.availableSlots.length > 0;
              const isFullyBooked = day.inMonth && !day.isPast && !day.isBlocked && day.availableSlots.length === 0 && day.bookedSlots.length > 0;

              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  disabled={isDisabled && !isHostMode}
                  aria-label={`${day.dateKey}${day.isBlocked ? ', blocked' : ''}${day.isPast ? ', past' : ''}${!day.isAvailable && !day.isPast && !day.isBlocked ? ', unavailable' : ''}${isSelected ? ', selected' : ''}`}
                  aria-pressed={isSelected}
                  className={[
                    // Base: clean rounded card, centered content, good padding
                    'relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3 px-1 text-center transition-all duration-150',
                    // Height: generous so status label has room to breathe
                    'min-h-[72px] sm:min-h-[84px] lg:min-h-[92px]',
                    // Out-of-month: ghost
                    !day.inMonth ? 'border-transparent bg-transparent pointer-events-none' : '',
                    // Past days
                    day.inMonth && day.isPast ? (isHostMode ? 'border-white/5 bg-white/[0.03] cursor-not-allowed' : 'border-black/5 bg-black/[0.03] cursor-not-allowed') : '',
                    // Host mode — normal open day
                    isHostMode && day.inMonth && !day.isPast && !day.isBlocked ? 'border-white/10 bg-white/5 hover:border-blue-400 hover:bg-blue-500/10 cursor-pointer' : '',
                    // Host mode — blocked day
                    isHostMode && day.isBlocked ? 'border-red-400/40 bg-red-500/15 cursor-pointer' : '',
                    // Guest mode — available
                    !isHostMode && isAvailableOpen && !isSelected ? 'border-black/10 bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-md cursor-pointer' : '',
                    // Guest mode — booked/unavailable
                    !isHostMode && isFullyBooked && !isSelected ? 'border-black/8 bg-black/5 cursor-not-allowed' : '',
                    // Guest mode — out of stock (no slots, no bookings, not blocked — edge case)
                    !isHostMode && day.inMonth && !day.isPast && !isAvailableOpen && !isFullyBooked && !day.isBlocked && !isSelected ? 'border-black/8 bg-black/5 cursor-not-allowed' : '',
                    // Selected edge (start/end)
                    isSelected && isEdge ? (isHostMode ? 'border-blue-400 bg-blue-500/20 shadow-[0_6px_20px_rgba(59,130,246,0.20)]' : 'border-blue-500 bg-blue-600 shadow-[0_6px_20px_rgba(59,130,246,0.30)] cursor-pointer') : '',
                    // Selected middle of range
                    isSelected && !isEdge ? 'border-blue-300 bg-blue-100 cursor-pointer' : '',
                  ].join(' ')}
                >
                  {day.inMonth ? (
                    <>
                      {/* Day number — large and prominent */}
                      <span
                        className={[
                          'text-xl font-bold leading-none sm:text-2xl',
                          day.isPast ? (isHostMode ? 'text-white/20' : 'text-black/20') : '',
                          isSelected && isEdge && !isHostMode ? 'text-white' : '',
                          isSelected && isEdge && isHostMode ? 'text-blue-100' : '',
                          isSelected && !isEdge ? 'text-blue-700' : '',
                          !isSelected && !day.isPast && isHostMode ? 'text-white' : '',
                          !isSelected && !day.isPast && !isHostMode ? 'text-gray-900' : '',
                        ].join(' ')}
                      >
                        {day.dayNumber}
                      </span>

                      {/* Status badge — clearly readable */}
                      {!day.isPast && (
                        <div className="flex items-center justify-center">
                          {day.isBlocked && (
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              isHostMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-600'
                            }`}>
                              Blocked
                            </span>
                          )}
                          {!day.isBlocked && isAvailableOpen && !isSelected && (
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              isHostMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {isHostMode ? `${day.availableSlots.length} open` : 'Open'}
                            </span>
                          )}
                          {!day.isBlocked && isFullyBooked && !isSelected && (
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              isHostMode ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-500'
                            }`}>
                              Booked
                            </span>
                          )}
                          {isSelected && isEdge && !isHostMode && (
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                              {rangeEnd && day.dateKey === rangeStart ? 'Start' : rangeEnd && day.dateKey === rangeEnd ? 'End' : 'Selected'}
                            </span>
                          )}
                          {isSelected && !isEdge && (
                            <span className="rounded-full bg-blue-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700">
                              ·
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className={`text-lg font-light ${isHostMode ? 'text-white/10' : 'text-black/10'}`}>
                      {day.dayNumber}
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

              {rangeStart ? (
                <>
                  <p className={`mt-2 text-sm ${isHostMode ? 'text-white/60' : 'text-black/60'}`}>
                    {isMultiDay && rangeEnd
                      ? `${formatSelectedDate(rangeStart)} – ${formatSelectedDate(rangeEnd)}`
                      : formatSelectedDate(rangeStart)}
                  </p>

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
                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap gap-3">
                        {selectedAvailableSlots.length > 0 ? (
                          selectedAvailableSlots.map((slot) => {
                            const active = selectedTimeSlots.includes(slot);
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => toggleTimeSlot(slot)}
                                aria-pressed={active}
                                aria-label={active ? `Deselect time slot ${slot}` : `Select time slot ${slot}`}
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
                            {selectedDay?.isBlocked ? 'This date is blocked by the host.' : isMultiDay ? 'No shared time blocks are available across all selected dates.' : 'No available slots for this date.'}
                          </div>
                        )}
                      </div>
                      {selectedAvailableSlots.length > 1 && (
                        <button
                          type="button"
                          onClick={selectAllSlots}
                          className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
                        >
                          Select all day ({selectedAvailableSlots.length * SLOT_DURATION_HOURS} hours)
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className={`mt-3 rounded-2xl border border-dashed px-4 py-6 text-sm ${isHostMode ? 'border-white/10 bg-black/20 text-white/50' : 'border-black/15 bg-white text-black/50'}`}>
                  {isHostMode ? 'Select a date to inspect or toggle its availability.' : 'Select a start date to unlock time selection.'}
                </div>
              )}
            </div>

          <div className={`rounded-2xl border p-5 ${isHostMode ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-black/[0.02]'}`}>
            <div className="flex items-center gap-2 text-black">
              <Clock className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold">Date selection</h4>
            </div>
            {rangeStart ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/60">Start</span>
                  <span className="font-medium text-black">{formatSelectedDate(rangeStart)}</span>
                </div>
                {rangeEnd ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black/60">End</span>
                      <span className="font-medium text-black">{formatSelectedDate(rangeEnd)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black/60">Total days</span>
                      <span className="font-semibold text-blue-600">{numDays} day{numDays !== 1 ? 's' : ''}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/60">Selection</span>
                    <span className="font-semibold text-blue-600">Single day</span>
                  </div>
                )}
                {blockedInRange.length > 0 && (
                  <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                    ⚠️ {blockedInRange.length} date{blockedInRange.length !== 1 ? 's' : ''} in your range {blockedInRange.length !== 1 ? 'are' : 'is'} blocked. Pick different dates.
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setRangeStart(''); setRangeEnd(''); setSelectedTimeSlots([]); }}
                  className="mt-2 text-sm font-medium text-slate-500 transition hover:text-red-500"
                >
                  Clear selection
                </button>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-black/15 bg-white px-4 py-6 text-sm text-black/50">
                Click a date to start. Click a second date only if you want a multi-day booking.
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
                <span>{isMultiDay ? 'Date range' : 'Date'}</span>
                <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>
                  {rangeStart && rangeEnd
                    ? `${formatSelectedDate(rangeStart)} – ${formatSelectedDate(rangeEnd)}`
                    : rangeStart
                      ? formatSelectedDate(rangeStart)
                      : 'Not selected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isMultiDay ? 'Days' : isHostMode ? 'Open slots' : 'Hours'}</span>
                <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>
                  {isHostMode ? (selectedDay?.availableSlots.length || 0) : isMultiDay ? `${numDays} days × ${selectedHoursPerDay}h` : `${selectedHoursPerDay || 0} hours`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rate</span>
                <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>
                  {pricePerDay && pricePerDay > 0 && isFullDayAcrossRange && isMultiDay
                    ? `$${pricePerDay.toLocaleString()}/day`
                    : `$${hourlyRate}/hr`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isHostMode ? 'Booked slots' : 'Base price'}</span>
                <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>
                  {isHostMode ? (selectedDay?.bookedSlots.length || 0) : `$${baseRate.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isHostMode ? 'Status' : 'Service fee'}</span>
                <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>
                  {isHostMode ? (selectedDay?.isBlocked ? 'Blocked' : 'Live') : `$${serviceFee.toFixed(2)}`}
                </span>
              </div>
              <div className={`pt-3 ${isHostMode ? 'border-t border-blue-400/20' : 'border-t border-blue-200'}`}>
                <div className={`flex items-center justify-between text-base font-bold ${isHostMode ? 'text-white' : 'text-black'}`}>
                  <span>{isHostMode ? 'Guest bookable?' : 'Estimated total'}</span>
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
                    Add more time to reach the {minimumBookingHours}-hour minimum on each selected day.
                  </p>
                )}
                {isMultiDay && numDays >= 7 && (
                  <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    💡 Weekly and monthly bookings often qualify for discounted rates. Mention this in your booking notes.
                  </div>
                )}

                {/* Book button moved to BookingSection */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
