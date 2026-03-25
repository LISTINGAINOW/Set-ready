export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered';
export type OfferActor = 'guest' | 'host';

export interface OfferMessage {
  id: string;
  sender: OfferActor;
  message: string;
  amount?: number;
  durationHours?: number;
  createdAt: string;
}

export interface Offer {
  id: string;
  bookingRequestId: string;
  locationId: string;
  locationTitle: string;
  guestName: string;
  guestEmail: string;
  requestedDate: string;
  originalAmount: number;
  originalDurationHours: number;
  proposedAmount: number;
  proposedDurationHours: number;
  status: OfferStatus;
  updatedAt: string;
  createdAt: string;
  messages: OfferMessage[];
}
