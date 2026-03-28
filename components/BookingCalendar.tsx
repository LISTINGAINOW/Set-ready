'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Ban, ChevronLeft, ChevronRight, Clock, DollarSign, CalendarRange } from 'lucide-react';
import type { LocationAvailabilityBlock } from '@/types/location';
import { buildAvailabilityMap, DEFAULT_TIME_SLOTS, formatMonth, formatSelectedDate, getCalendarDays, toDateKey, parseDateKey } from '@/lib/availability';

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
  const [selectionMode, setSelectionMode] = useState<'single' | 'range'>('single');
  const [selectedDate, setSelectedDate] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  const availabilityMap = useMemo(
    () => buildAvailabilityMap({ bookings, blockedDates, today }),
    [blockedDates, bookings, today]
  );

  const days = useMemo(() => getCalendarDays({ currentMonth, today, availabilityMap }), [availabilityMap, currentMonth, today]);

  // Compute selected dates for range mode
  const selectedDates = useMemo(() => {
    if (selectionMode === 'single') return selectedDate ? [selectedDate] : [];
    if (rangeStart && rangeEnd) return getDatesBetween(rangeStart, rangeEnd);
    if (rangeStart) return [rangeStart];
    return [];
  }, [selectionMode, selectedDate, rangeStart, rangeEnd]);

  // Check for blocked dates in range
  const blockedInRange = useMemo(() => {
    return selectedDates.filter((d) => {
      const avail = availabilityMap.get(d);
      return avail?.isBlocked;
    });
  }, [selectedDates, availabilityMap]);

  const numDays = selectedDates.length;
  const isMultiDay = selectionMode === 'range' && numDays > 1;

  // Pricing calculations
  const selectedDay = selectedDate ? days.find((day) => day.dateKey === selectedDate) : undefined;
  const selectedAvailableSlots = selectedDay?.availableSlots || [];
  const singleDayHours = selectedTimeSlots.length * SLOT_DURATION_HOURS;

  // For multi-day: assume full-day booking per day (all 4 slots = 12 hours)
  const multiDayHoursPerDay = DEFAULT_TIME_SLOTS.length * SLOT_DURATION_HOURS; // 12 hours
  const totalHours = isMultiDay
    ? numDays * multiDayHoursPerDay
    : singleDayHours;

  // Use daily rate if available for multi-day, otherwise hourly
  const baseRate = isMultiDay
    ? (pricePerDay && pricePerDay > 0 ? pricePerDay * numDays : totalHours * hourlyRate)
    : singleDayHours * hourlyRate;

  const serviceFee = baseRate * SERVICE_FEE_RATE;
  const total = baseRate + serviceFee;
  const meetsMinimum = isMultiDay ? numDays >= 1 : singleDayHours >= minimumBookingHours;

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.({
      selectedDate: isMultiDay ? rangeStart : selectedDate,
      selectedDates,
      selectedTimeSlots: isMultiDay ? [...DEFAULT_TIME_SLOTS] : selectedTimeSlots,
      isMultiDay,
    });
  }, [onSelectionChange, selectedDate, selectedDates, selectedTimeSlots, isMultiDay, rangeStart]);

  useEffect(() => {
    if (selectionMode === 'single' && selectedDate && availabilityMap.has(selectedDate)) {
      const nextSlots = availabilityMap.get(selectedDate)?.availableSlots || [];
      setSelectedTimeSlots((current) => current.filter((slot) => nextSlots.includes(slot)));
    }
  }, [availabilityMap, selectedDate, selectionMode]);

  const handleDayClick = useCallback((day: ReturnType<typeof getCalendarDays>[number]) => {
    if (!day.inMonth || day.isPast) return;

    if (mode === 'host') {
      setSelectedDate(day.dateKey);
      setSelectedTimeSlots([]);
      onDayToggle?.(day.dateKey);
      return;
    }

    if (!day.isAvailable && selectionMode === 'single') return;

    if (selectionMode === 'single') {
      setSelectedDate(day.dateKey);
      setSelectedTimeSlots([]);
    } else {
      // Range selection
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start new range
        setRangeStart(day.dateKey);
        setRangeEnd('');
      } else {
        // Complete range
        if (day.dateKey < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(day.dateKey);
        } else {
          setRangeEnd(day.dateKey);
        }
      }
    }
  }, [mode, selectionMode, rangeStart, rangeEnd, onDayToggle]);

  const toggleTimeSlot = (slot: string) => {
    setSelectedTimeSlots((current) =>
      current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot]
    );
  };

  const selectAllSlots = () => {
    setSelectedTimeSlots([...DEFAULT_TIME_SLOTS]);
  };

  const canBook = isMultiDay
    ? numDays >= 1 && blockedInRange.length === 0
    : Boolean(selectedDate && selectedTimeSlots.length > 0 && meetsMinimum);

  const isHostMode = mode === 'host';

  const isInRange = (dateKey: string) => {
    if (selectionMode !== 'range') return false;
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
              : selectionMode === 'range'
                ? 'Click a start date, then click an end date to select your shoot dates.'
                : 'Pick a date, choose time blocks, and see the total instantly.'}
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

      {/* Mode toggle — single day vs multi-day range */}
      {!isHostMode && (
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectionMode('single');
              setRangeStart('');
              setRangeEnd('');
            }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              selectionMode === 'single'
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            <Clock className="h-4 w-4" />
            Single day
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectionMode('range');
              setSelectedDate('');
              setSelectedTimeSlots([]);
            }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              selectionMode === 'range'
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            <CalendarRange className="h-4 w-4" />
            Multi-day / weekly / monthly
          </button>
        </div>
      )}

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
              const isSelected = selectionMode === 'single'
                ? selectedDate === day.dateKey
                : isInRange(day.dateKey);
              const isEdge = selectionMode === 'range' && isRangeEdge(day.dateKey);
              const isDisabled = !day.inMonth || day.isPast || (!isHostMode && selectionMode === 'single' && !day.isAvailable);

              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  disabled={isDisabled && !isHostMode}
                  className={[
                    'relative min-h-[78px] rounded-2xl border p-3 text-left transition',
                    !day.inMonth ? 'border-transparent bg-transparent text-white/20' : '',
                    isHostMode && day.inMonth && !day.isPast && !day.isBlocked ? 'border-white/10 bg-white/5 text-white hover:border-blue-500 hover:bg-blue-500/10' : '',
                    isHostMode && day.isBlocked ? 'border-blue-500/40 bg-blue-500/20 text-white' : '',
                    !isHostMode && day.inMonth && !isSelected && day.isAvailable ? 'border-black/10 bg-white text-black hover:border-blue-500 hover:shadow-sm' : '',
                    !isHostMode && day.inMonth && !day.isPast && !day.isAvailable && !isSelected ? 'border-black/10 bg-black/10 text-black/35 line-through' : '',
                    day.isPast ? (isHostMode ? 'border-white/5 bg-white/[0.03] text-white/25' : 'border-black/5 bg-black/5 text-black/20') : '',
                    // Single day selected
                    isSelected && selectionMode === 'single' ? (isHostMode ? 'border-white bg-white/15 shadow-[0_10px_30px_rgba(59,130,246,0.20)]' : 'border-blue-500 bg-blue-500 text-white shadow-[0_10px_30px_rgba(59,130,246,0.25)]') : '',
                    // Range selected — edge dates (start/end)
                    isSelected && selectionMode === 'range' && isEdge ? 'border-blue-500 bg-blue-500 text-white shadow-[0_10px_30px_rgba(59,130,246,0.25)]' : '',
                    // Range selected — middle dates
                    isSelected && selectionMode === 'range' && !isEdge ? 'border-blue-300 bg-blue-100 text-blue-800' : '',
                    // Range mode hover on available dates
                    !isSelected && selectionMode === 'range' && day.inMonth && !day.isPast ? 'cursor-pointer hover:border-blue-400 hover:bg-blue-50' : '',
                  ].join(' ')}
                >
                  <span className="text-sm font-semibold">{day.dayNumber}</span>
                  {day.isBlocked && (
                    <span className={`absolute bottom-3 left-3 text-[11px] font-medium ${isHostMode || (isSelected && isEdge) ? 'text-blue-100' : 'text-blue-600'}`}>
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
          {/* Time slots panel (single day mode) */}
          {selectionMode === 'single' && (
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
                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap gap-3">
                        {selectedAvailableSlots.length > 0 ? (
                          <>
                            {selectedAvailableSlots.map((slot) => {
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
                            })}
                          </>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-black/15 bg-white px-4 py-6 text-sm text-black/50">
                            {selectedDay?.isBlocked ? 'This date is blocked by the host.' : 'No available slots for this date.'}
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
                  {isHostMode ? 'Select a date to inspect or toggle its availability.' : 'Select an available date to see open booking times.'}
                </div>
              )}
            </div>
          )}

          {/* Multi-day range summary */}
          {selectionMode === 'range' && (
            <div className={`rounded-2xl border p-5 ${isHostMode ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-black/[0.02]'}`}>
              <div className="flex items-center gap-2 text-black">
                <CalendarRange className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold">Date range</h4>
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
                      {blockedInRange.length > 0 && (
                        <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                          ⚠️ {blockedInRange.length} date{blockedInRange.length !== 1 ? 's' : ''} in your range {blockedInRange.length !== 1 ? 'are' : 'is'} blocked. The host will confirm availability.
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-blue-600">Now click an end date on the calendar.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => { setRangeStart(''); setRangeEnd(''); }}
                    className="mt-2 text-sm font-medium text-slate-500 transition hover:text-red-500"
                  >
                    Clear selection
                  </button>
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-dashed border-black/15 bg-white px-4 py-6 text-sm text-black/50">
                  Click a start date on the calendar to begin selecting your range.
                </div>
              )}
            </div>
          )}

          {/* Pricing summary */}
          <div className={`rounded-2xl border p-5 ${isHostMode ? 'border-blue-500/20 bg-blue-500/10' : 'border-blue-200 bg-blue-50'}`}>
            <div className={`flex items-center gap-2 ${isHostMode ? 'text-white' : 'text-black'}`}>
              <DollarSign className={`h-4 w-4 ${isHostMode ? 'text-blue-300' : 'text-blue-600'}`} />
              <h4 className="font-semibold">{isHostMode ? 'Availability summary' : 'Booking summary'}</h4>
            </div>
            <div className={`mt-4 space-y-3 text-sm ${isHostMode ? 'text-white/70' : 'text-black/70'}`}>
              {isMultiDay ? (
                <>
                  <div className="flex items-center justify-between">
                    <span>Date range</span>
                    <span className="font-medium text-black">
                      {rangeStart && rangeEnd ? `${formatSelectedDate(rangeStart)} – ${formatSelectedDate(rangeEnd)}` : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Duration</span>
                    <span className="font-medium text-black">{numDays} day{numDays !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rate</span>
                    <span className="font-medium text-black">
                      {pricePerDay && pricePerDay > 0
                        ? `$${pricePerDay.toLocaleString()}/day`
                        : `$${hourlyRate}/hr × ${multiDayHoursPerDay}hr/day`
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Base price</span>
                    <span className="font-medium text-black">${baseRate.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span>Date</span>
                    <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>
                      {selectedDate ? formatSelectedDate(selectedDate) : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isHostMode ? 'Open slots' : 'Duration'}</span>
                    <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>
                      {isHostMode ? (selectedDay?.availableSlots.length || 0) : `${singleDayHours || 0} hours`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rate</span>
                    <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>${hourlyRate}/hr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isHostMode ? 'Booked slots' : 'Base price'}</span>
                    <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>
                      {isHostMode ? (selectedDay?.bookedSlots.length || 0) : `$${(singleDayHours * hourlyRate).toFixed(2)}`}
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <span>{isHostMode ? 'Status' : 'Service fee'}</span>
                <span className={`font-medium ${isHostMode ? 'text-white' : 'text-black'}`}>
                  {isHostMode ? (selectedDay?.isBlocked ? 'Blocked' : 'Live') : `$${serviceFee.toFixed(2)}`}
                </span>
              </div>

              <div className={`pt-3 ${isHostMode ? 'border-t border-blue-400/20' : 'border-t border-blue-200'}`}>
                <div className={`flex items-center justify-between text-base font-bold ${isHostMode ? 'text-white' : 'text-black'}`}>
                  <span>{isHostMode ? 'Guest bookable?' : 'Estimated total'}</span>
                  <span>{isHostMode ? (selectedDay?.isAvailable ? 'Yes' : 'No') : `$${total.toLocaleString()}`}</span>
                </div>
              </div>
            </div>

            {!isHostMode && (
              <>
                {selectionMode === 'single' && (
                  <div className="mt-4 rounded-2xl border border-white bg-white px-4 py-3 text-sm text-black/60">
                    {selectedTimeSlots.length > 0 ? selectedTimeSlots.join(' • ') : 'Choose one or more 3-hour time blocks.'}
                  </div>
                )}

                {selectionMode === 'single' && !meetsMinimum && selectedTimeSlots.length > 0 && (
                  <p className="mt-3 text-sm font-medium text-blue-700">
                    Add more time to reach the {minimumBookingHours}-hour minimum.
                  </p>
                )}

                {isMultiDay && numDays >= 7 && (
                  <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    💡 Weekly and monthly bookings often qualify for discounted rates. Mention this in your booking notes!
                  </div>
                )}

                <button
                  type="button"
                  disabled={!canBook}
                  onClick={() => canBook && onBook?.({
                    selectedDate: isMultiDay ? rangeStart : selectedDate,
                    selectedDates,
                    selectedTimeSlots: isMultiDay ? [...DEFAULT_TIME_SLOTS] : selectedTimeSlots,
                    isMultiDay,
                  })}
                  className="mt-5 w-full rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {isMultiDay ? `Book ${numDays} day${numDays !== 1 ? 's' : ''}` : 'Book'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
