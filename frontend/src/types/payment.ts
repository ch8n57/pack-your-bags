import type { Booking } from '.';

export interface Payment {
  id: string;
  booking: Booking;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string | null;
  paymentMethod: string | null;
  paymentDetails: {
    provider: string;
    lastFourDigits?: string;
    expiryDate?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}