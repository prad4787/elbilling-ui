import api from './api';
import { Customer } from '../types';

const CUSTOMERS_URL = '/api/customers';

export const getCustomers = async (): Promise<Customer[]> => {
  return api.get<Customer[]>(CUSTOMERS_URL);
};

export const getCustomer = async (id: string): Promise<Customer> => {
  return api.get<Customer>(`${CUSTOMERS_URL}/${id}`);
};

export const createCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
  return api.post<Customer>(CUSTOMERS_URL, customerData);
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
  return api.put<Customer>(`${CUSTOMERS_URL}/${id}`, customerData);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  return api.delete(`${CUSTOMERS_URL}/${id}`);
};