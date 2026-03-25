export interface Review {
  id: string;
  propertyId: string;
  locationId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  review?: string;
  reviewer: string;
  guestName?: string;
  date: string;
  createdAt?: string;
  stayDate?: string;
  verified: boolean;
  bookingCompleted?: boolean;
  featured?: boolean;
  hostResponse?: {
    hostName: string;
    response: string;
  };
}

export interface CreateReviewInput {
  propertyId: string;
  rating: number;
  text: string;
  reviewer: string;
}
