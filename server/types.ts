export type BookingStatus = 'pending' | 'awaiting_payment' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface PropertyRecord {
  id: string;
  code: string;
  unitNumber: string;
  slug: string;
  title: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  bedrooms: number;
  bathrooms: number;
  floor: 'Downstairs' | 'Upstairs';
  location: string;
  monthlyRate: number;
  startingRate: string;
  pricingNote: string;
  status: 'Available' | 'Inquired' | 'Reserved';
  sqft: string;
  liveUrl?: string;
  images: string[];
  features: string[];
  amenities: string[];
  minimumStayDays: number;
}

export interface BookingRecord {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  status: BookingStatus;
  notes?: string;
  totalNights: number;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: 'stripe' | 'paypal';
  createdAt: string;
}

export interface DatabaseState {
  properties: PropertyRecord[];
  bookings: BookingRecord[];
  payments: PaymentRecord[];
}
