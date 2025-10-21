import axios from 'axios';
import type { AuthResponse, LoginData, TravelPackage, Booking, SearchParams, Payment } from '../types';

const API_URL = 'http://localhost:3003/api';

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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  updateStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled') =>
    api.patch<Booking>(`/bookings/${id}/status`, { status }),
};

export const payments = {
  createPaymentIntent: (bookingId: string) =>
    api.post<{ clientSecret: string }>('/payments/create-payment-intent', { bookingId }),
  getHistory: () =>
    api.get<Payment[]>('/payments/history'),
};

export default api;