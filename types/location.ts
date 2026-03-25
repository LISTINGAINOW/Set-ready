export type ContentType = 'Photo shoot' | 'Video production' | 'Commercial' | 'Lifestyle' | 'Editorial';

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
  title: string;
  city: string;
  state: string;
  address: string;
  latitude?: number;
  longitude?: number;
  description: string;
  price: number;
  securityDeposit?: number;
  securityDepositRequiredWhen?: SecurityDepositRequiredWhen;
  privacyTier: 'Private' | 'Public' | 'NDA Required';
  propertyType: string;
  contentTypes: ContentType[];
  amenities: string[];
  photos: string[];
  neighborhood?: string;
  squareFootage?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  lotSize?: number;
  parkingSpots?: number;
  maxCapacity?: number;
  maxAttendees?: number;
  minimumBookingHours?: number;
  cleaningFee?: number;
  mainFloorNumber?: number;
  specialFeatures?: string[];
  features?: string[];
  tags?: string[];
  styleTags?: string[];
  parkingDetails?: string;
  cancellationPolicy?: CancellationPolicyTier;
  houseRules?: string[];
  accessOptions?: string[];
  openingHours?: OpeningHours;
  locationRules?: LocationRule[];
  kitchenFacilities?: string;
  cateringOptions?: string;
  alcoholPolicy?: string;
  musicPolicy?: string;
  paSystem?: boolean;
  bringYourOwnMusic?: boolean;
  greatRate?: boolean;
  productionFriendlyVerified?: boolean;
  aiAssistantAvailable?: boolean;
  isVerified?: boolean;
  verificationBadges?: VerificationBadge[];
  responseTime?: string;
  bookingMode?: 'instant' | 'request';
  reviewRating?: number;
  reviewCount?: number;
  reviewQuote?: string;
  privacyNotice?: string;
  bookings?: LocationBooking[];
  blockedDates?: LocationAvailabilityBlock[];
}
