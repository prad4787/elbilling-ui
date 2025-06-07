import api from './api';
import { TailorCounter } from '../types';

const TAILOR_COUNTERS_URL = '/api/tailor-counters';

// Mock tailor counter data for demonstration
const MOCK_TAILOR_COUNTERS: TailorCounter[] = [
  {
    id: 'tailor-1',
    name: 'Ahmed Hassan',
    phone: '+92-300-1234567',
    address: 'Shop 15, Tailor Market, Karachi',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'tailor-2',
    name: 'Muhammad Ali',
    phone: '+92-301-2345678',
    address: 'Counter 8, Fashion Plaza, Lahore',
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z'
  },
  {
    id: 'tailor-3',
    name: 'Fatima Khan',
    phone: '+92-302-3456789',
    address: 'Unit 22, Garment Center, Islamabad',
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-03T10:00:00Z'
  },
  {
    id: 'tailor-4',
    name: 'Usman Sheikh',
    phone: '+92-303-4567890',
    address: 'Shop 5, Textile Hub, Faisalabad',
    createdAt: '2024-01-04T10:00:00Z',
    updatedAt: '2024-01-04T10:00:00Z'
  }
];

export const getTailorCounters = async (): Promise<TailorCounter[]> => {
  // Check if we have data in localStorage, if not use mock data
  const storedData = localStorage.getItem(TAILOR_COUNTERS_URL);
  if (storedData) {
    return JSON.parse(storedData);
  }
  
  // Store mock data in localStorage for persistence
  localStorage.setItem(TAILOR_COUNTERS_URL, JSON.stringify(MOCK_TAILOR_COUNTERS));
  return MOCK_TAILOR_COUNTERS;
};

export const getTailorCounter = async (id: string): Promise<TailorCounter> => {
  return api.get<TailorCounter>(`${TAILOR_COUNTERS_URL}/${id}`);
};

export const createTailorCounter = async (data: Omit<TailorCounter, 'id'>): Promise<TailorCounter> => {
  return api.post<TailorCounter>(TAILOR_COUNTERS_URL, data);
};

export const updateTailorCounter = async (id: string, data: Partial<TailorCounter>): Promise<TailorCounter> => {
  return api.put<TailorCounter>(`${TAILOR_COUNTERS_URL}/${id}`, data);
};

export const deleteTailorCounter = async (id: string): Promise<void> => {
  return api.delete(`${TAILOR_COUNTERS_URL}/${id}`);
};