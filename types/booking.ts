export interface Booking {
  id: string;
  locationId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  productionType: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  createdAt: string;
  stripeSessionId?: string;
  amountPaid?: number;
  platformFee?: number;
  paidAt?: string;
}