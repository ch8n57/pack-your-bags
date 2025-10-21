export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface TravelPackage {
  id: string;
  name: string;
  destination: string;
  description: string;
  price: number;
  duration: number;
  maxTravelers: number;
  inclusions: string[];
}

export interface Payment {
  id: string;
  booking: Booking;
  user: User;
  amount: number;
  provider: 'stripe' | 'paypal';
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  completedAt?: string;
}

export interface Booking {
  id: string;
  travelPackage: TravelPackage;
  user: User;
  numberOfTravelers: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  travelDate: string;
  createdAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SearchParams {
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
}