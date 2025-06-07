import api from './api';
import { Stock, StockAdjustment } from '../types';

const STOCKS_URL = '/api/stocks';

// Mock stock data for item status demonstration
const MOCK_STOCKS: Stock[] = [
  {
    id: 'stock-1',
    date: '2024-01-10',
    name: 'Premium Cotton Shirt',
    code: 'PCS001',
    category: 'Shirt',
    quantity: 50,
    hsCode: '6205.20.00',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'stock-2',
    date: '2024-01-11',
    name: 'Formal Coat',
    code: 'FC002',
    category: 'Coat/Shafari',
    quantity: 25,
    hsCode: '6203.11.00',
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z'
  },
  {
    id: 'stock-3',
    date: '2024-01-12',
    name: 'Casual Pants',
    code: 'CP003',
    category: 'Pants',
    quantity: 40,
    hsCode: '6203.42.00',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z'
  },
  {
    id: 'stock-4',
    date: '2024-01-13',
    name: 'Silk Fabric',
    code: 'SF004',
    category: 'Fabric',
    quantity: 100,
    hsCode: '5007.20.00',
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z'
  },
  {
    id: 'stock-5',
    date: '2024-01-14',
    name: 'Designer Shirt',
    code: 'DS005',
    category: 'Shirt',
    quantity: 30,
    hsCode: '6205.30.00',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z'
  },
  {
    id: 'stock-6',
    date: '2024-01-15',
    name: 'Formal Pants',
    code: 'FP006',
    category: 'Pants',
    quantity: 35,
    hsCode: '6203.43.00',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

export const getStocks = async (): Promise<Stock[]> => {
  // Check if we have data in localStorage, if not use mock data
  const storedData = localStorage.getItem(STOCKS_URL);
  if (storedData) {
    return JSON.parse(storedData);
  }
  
  // Store mock data in localStorage for persistence
  localStorage.setItem(STOCKS_URL, JSON.stringify(MOCK_STOCKS));
  return MOCK_STOCKS;
};

export const getStock = async (id: string): Promise<Stock> => {
  return api.get<Stock>(`${STOCKS_URL}/${id}`);
};

export const createStock = async (stockData: Omit<Stock, 'id'>): Promise<Stock> => {
  return api.post<Stock>(STOCKS_URL, stockData);
};

export const updateStock = async (id: string, stockData: Partial<Stock>): Promise<Stock> => {
  return api.put<Stock>(`${STOCKS_URL}/${id}`, stockData);
};

export const deleteStock = async (id: string): Promise<void> => {
  return api.delete(`${STOCKS_URL}/${id}`);
};

export const adjustStock = async (adjustment: StockAdjustment): Promise<Stock> => {
  const stock = await getStock(adjustment.stockId);
  
  let newQuantity = stock.quantity;
  if (adjustment.type === 'add') {
    newQuantity += adjustment.quantity;
  } else {
    newQuantity -= adjustment.quantity;
    if (newQuantity < 0) {
      throw new Error('Cannot reduce stock below zero');
    }
  }
  
  return updateStock(adjustment.stockId, { quantity: newQuantity });
};