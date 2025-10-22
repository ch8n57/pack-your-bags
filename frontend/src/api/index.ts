import axios from 'axios';
import type { AuthResponse, LoginData, TravelPackage, Booking, SearchParams, Payment } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

export interface RegisterData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Enhanced error handling for payment-related errors
    if (error.response?.status === 400 && error.response?.data?.message?.includes('payment')) {
      console.error('Payment validation error:', error.response.data.message);
    }
    
    if (error.response?.status === 500 && error.response?.data?.message?.includes('payment')) {
      console.error('Payment processing error:', error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data: RegisterData) => 
    api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginData) => 
    api.post<AuthResponse>('/auth/login', data),
};

export const packages = {
  getAll: () => 
    api.get<TravelPackage[]>('/packages'),
  getById: (id: string) => 
    api.get<TravelPackage>(`/packages/${id}`),
  search: (params: SearchParams) => 
    api.get<TravelPackage[]>('/packages/search', { params }),
  create: (data: Omit<TravelPackage, 'id'>) => 
    api.post<TravelPackage>('/packages', data),
  update: (id: string, data: Partial<TravelPackage>) => 
    api.put<TravelPackage>(`/packages/${id}`, data),
  makeUnavailable: (id: string) => 
    api.patch<TravelPackage>(`/packages/${id}/unavailable`),
  delete: (id: string) =>
    api.delete<void>(`/packages/${id}`),
};

export const bookings = {
  create: (data: { travelPackageId: string; numberOfTravelers: number; travelDate: string }) => 
    api.post<Booking>('/bookings', data),
  getUserBookings: () => 
    api.get<Booking[]>('/bookings/my-bookings'),
  getAllBookings: () => 
    api.get<Booking[]>('/bookings/all'),
  updateStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') =>
    api.patch<Booking>(`/bookings/${id}/status`, { status }),
};

export const payments = {
  createPaymentIntent: async (bookingId: string) => {
    try {
      const response = await api.post<{ clientSecret: string }>('/payments/create-payment-intent', { bookingId });
      return response;
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      throw new Error(error.response?.data?.message || 'Failed to create payment intent');
    }
  },
  
  confirmPayment: async (paymentIntentId: string, bookingId: string) => {
    try {
      const response = await api.post<{ message: string }>('/payments/confirm-payment', { paymentIntentId, bookingId });
      return response;
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      throw new Error(error.response?.data?.message || 'Failed to confirm payment');
    }
  },
  
  processAutoPayment: async (bookingId: string) => {
    try {
      const response = await api.post<{ message: string; payment: any }>('/payments/auto-payment', { bookingId });
      return response;
    } catch (error: any) {
      console.error('Error processing auto payment:', error);
      throw new Error(error.response?.data?.message || 'Failed to process payment');
    }
  },
  
  getHistory: async () => {
    try {
      const response = await api.get<Payment[]>('/payments/history');
      return response;
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch payment history');
    }
  },
};

export default api;