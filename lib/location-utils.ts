import type { Location } from '@/types/location';

export type BookingMode = 'instant' | 'request';

export function getDisplayAddress(location: Location) {
  return `${location.address}, ${location.city}, ${location.state}`;
}

export function getBookingMode(location: Location) {
  return (location.bookingMode || 'request') as BookingMode;
}

export function getVerificationHighlights(location: Location) {
  const badges: string[] = [];
  if (location.isVerified) badges.push('ID Verified');
  if ((location.reviewCount || 0) >= 5 && (location.reviewRating || 0) >= 4.8) badges.push('Superhost');
  return badges;
}

export function getAvailabilityLabel(location: Location) {
  const bookedDays = (location.bookings || []).filter((booking) => booking.timeSlots.length > 0).length;
  if (bookedDays <= 2) return 'Wide-open calendar';
  if (bookedDays <= 5) return 'Good upcoming availability';
  return 'Popular upcoming dates';
}

export function getComparisonAvailability(location: Location) {
  const bookedDays = (location.bookings || []).filter((booking) => booking.timeSlots.length > 0).length;
  if (bookedDays <= 2) return 'Mostly open';
  if (bookedDays <= 5) return 'Moderately booked';
  return 'High demand';
}
