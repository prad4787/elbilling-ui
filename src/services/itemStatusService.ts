import api from './api';
import { ItemStatusEntry } from '../types';

const ITEM_STATUS_URL = '/api/item-status';

// Mock data for demonstration - 10 entries across multiple dates
const MOCK_ITEM_STATUS: ItemStatusEntry[] = [
  // January 15, 2024 - 4 items
  {
    id: '1',
    date: '2024-01-15',
    itemId: 'stock-1',
    tailorCounterId: 'tailor-1',
    status: 'in_progress',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    date: '2024-01-15',
    itemId: 'stock-2',
    tailorCounterId: null,
    status: 'in_progress',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z'
  },
  {
    id: '3',
    date: '2024-01-15',
    itemId: 'stock-3',
    tailorCounterId: 'tailor-2',
    status: 'ready',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: '4',
    date: '2024-01-15',
    itemId: 'stock-4',
    tailorCounterId: 'tailor-1',
    status: 'delivered',
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-15T13:00:00Z'
  },
  
  // January 16, 2024 - 3 items
  {
    id: '5',
    date: '2024-01-16',
    itemId: 'stock-5',
    tailorCounterId: 'tailor-3',
    status: 'in_progress',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z'
  },
  {
    id: '6',
    date: '2024-01-16',
    itemId: 'stock-6',
    tailorCounterId: null,
    status: 'ready',
    createdAt: '2024-01-16T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  },
  {
    id: '7',
    date: '2024-01-16',
    itemId: 'stock-1',
    tailorCounterId: 'tailor-4',
    status: 'delivered',
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-16T14:00:00Z'
  },
  
  // January 17, 2024 - 2 items
  {
    id: '8',
    date: '2024-01-17',
    itemId: 'stock-2',
    tailorCounterId: 'tailor-2',
    status: 'in_progress',
    createdAt: '2024-01-17T08:30:00Z',
    updatedAt: '2024-01-17T08:30:00Z'
  },
  {
    id: '9',
    date: '2024-01-17',
    itemId: 'stock-3',
    tailorCounterId: 'tailor-1',
    status: 'ready',
    createdAt: '2024-01-17T11:15:00Z',
    updatedAt: '2024-01-17T11:15:00Z'
  },
  
  // January 18, 2024 - 1 item
  {
    id: '10',
    date: '2024-01-18',
    itemId: 'stock-5',
    tailorCounterId: 'tailor-3',
    status: 'delivered',
    createdAt: '2024-01-18T16:00:00Z',
    updatedAt: '2024-01-18T16:00:00Z'
  }
];

export const getItemStatus = async (): Promise<ItemStatusEntry[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if we have data in localStorage, if not use mock data
  const storedData = localStorage.getItem(ITEM_STATUS_URL);
  if (storedData) {
    return JSON.parse(storedData);
  }
  
  // Store mock data in localStorage for persistence
  localStorage.setItem(ITEM_STATUS_URL, JSON.stringify(MOCK_ITEM_STATUS));
  return MOCK_ITEM_STATUS;
};

export const updateItemStatus = async (
  id: string, 
  data: Partial<ItemStatusEntry>
): Promise<ItemStatusEntry> => {
  return api.put<ItemStatusEntry>(`${ITEM_STATUS_URL}/${id}`, data);
};