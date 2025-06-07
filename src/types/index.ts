// Stock types
export interface Stock {
  id: string;
  date: string;
  name: string;
  code: string;
  category: string;
  quantity: number;
  hsCode: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockFormData {
  date: string;
  name: string;
  code: string;
  category: string;
  quantity: number;
  hsCode: string;
}

export interface StockAdjustment {
  stockId: string;
  quantity: number;
  type: 'add' | 'deduct';
  reason: string;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  avatar?: string;
  description?: string;
  referrerId?: string;
  referrer?: Customer;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  address: string;
  avatar?: string;
  description?: string;
  referrerId?: string;
}

// Bill types
export interface BillItem {
  id: string;
  stockId: string;
  category: string;
  quantity: number;
  price: number;
  total: number;
  description?: string;
  measurements: Record<string, string | number>;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  createdAt: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  customerId: string;
  customer?: Customer;
  date: string;
  deliveryDate: string;
  items: BillItem[];
  total: number;
  discount: number;
  grandTotal: number;
  advance: number;
  due: number;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  phones: string[];
  emails: string[];
  address: string;
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tailor Counter types
export interface TailorCounter {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

// Form type
export type FormMode = 'create' | 'edit' | 'view';

// Category measurements
export interface CategoryMeasurements {
  [key: string]: string[];
}

export const CATEGORY_MEASUREMENTS: CategoryMeasurements = {
  'Coat/Shafari': ['length', 'chest', 'waist', 'hip', 'shoulder', 'sleeve', 'neck', 'cross_back', 'cross_front'],
  'Shirt': ['length', 'chest', 'waist', 'hip', 'shoulder', 'sleeve', 'neck', 'k.f'],
  'Pants': ['length', 'waist', 'hip', 'thigh', 'knee', 'bottom'],
  'Fabric': ['length', 'width'],
  'Accessories': ['size']
};

export type ItemStatus = 'in_progress' | 'ready' | 'delivered';

export interface ItemStatusEntry {
  id: string;
  date: string;
  itemId: string;
  tailorCounterId: string | null;
  status: ItemStatus;
  createdAt?: string;
  updatedAt?: string;
}