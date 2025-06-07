import api from './api';
import { Bill, Payment } from '../types';

const BILLS_URL = '/api/bills';

export const getBills = async (): Promise<Bill[]> => {
  return api.get<Bill[]>(BILLS_URL);
};

export const getBill = async (id: string): Promise<Bill> => {
  return api.get<Bill>(`${BILLS_URL}/${id}`);
};

export const createBill = async (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bill> => {
  return api.post<Bill>(BILLS_URL, billData);
};

export const updateBill = async (id: string, billData: Partial<Bill>): Promise<Bill> => {
  return api.put<Bill>(`${BILLS_URL}/${id}`, billData);
};

export const deleteBill = async (id: string): Promise<void> => {
  return api.delete(`${BILLS_URL}/${id}`);
};

export const addPayment = async (billId: string, payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Bill> => {
  const bill = await getBill(billId);
  
  const newPayment: Payment = {
    id: Date.now().toString(),
    ...payment,
    createdAt: new Date().toISOString()
  };
  
  const updatedBill = {
    ...bill,
    payments: [...(bill.payments || []), newPayment],
    due: bill.due - payment.amount
  };
  
  return updateBill(billId, updatedBill);
};