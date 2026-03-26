export interface LocationRule {
  label: string;
  allowed: boolean;
}

export interface OpeningHours {
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
}

export interface LocationBooking {
  date: string;
  timeSlots: string[];
}

export interface LocationAvailabilityBlock {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
  blockedSlots?: string[];
  source?: 'manual' | 'maintenance' | 'owner' | 'system';
}

export type CancellationPolicyTier = 'Flexible' | 'Moderate' | 'Strict';
export type VerificationBadge = 'Identity verified' | 'Phone verified' | 'Email verified' | 'ID Verified' | 'Superhost';

export type SecurityDepositRequiredWhen = 'Always' | 'First-time guests' | 'High-risk bookings';

export interface Location {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: string;
  style: string;
  pricePerDay: number;
  pricePerMonth?: number;
  pricePerHour: number;
  minimumStay?: number;
  maxGuests?: number;
  description: string;
  amenities: string[];
  bestUses?: string[];
  vibe?: string;
  views?: string[];
  images: string[];
  featured: boolean;
  approved: boolean;
  status: string;
  confidence?: string;
  yearBuilt?: number;
  latitude?: number;
  longitude?: number;
  securityDeposit?: number;
  securityDepositRequiredWhen?: SecurityDepositRequiredWhen;
  minimumBookingHours?: number;
  cleaningFee?: number;
  maxCapacity?: number;
  parkingSpots?: number;
  parkingDetails?: string;
  cancellationPolicy?: CancellationPolicyTier;
  houseRules?: string[];
  locationRules?: LocationRule[];
  openingHours?: OpeningHours;
  isVerified?: boolean;
  verificationBadges?: VerificationBadge[];
  responseTime?: string;
  bookingMode?: 'instant' | 'request';
  reviewRating?: number;
  reviewCount?: number;
  reviewQuote?: string;
  bookings?: LocationBooking[];
  blockedDates?: LocationAvailabilityBlock[];
  // Compliance / regulatory fields
  totLicenseNumber?: string;
  businessLicenseNumber?: string;
  businessLicenseType?: string;
  hasLiabilityInsurance?: boolean;
  hasProductionInsurance?: boolean;
}
