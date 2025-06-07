import api from './api';
import { Organization } from '../types';

const ORGANIZATION_URL = '/api/organization';

// Mock organization data
const MOCK_ORGANIZATION: Organization = {
  id: 'org-1',
  name: 'Fashion House Ltd.',
  phones: ['+92-300-1234567', '+92-21-1234567'],
  emails: ['info@fashionhouse.com', 'orders@fashionhouse.com'],
  address: '123 Fashion Street, Karachi, Pakistan',
  logo: '',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z'
};

export const getOrganization = async (): Promise<Organization> => {
  // Check if we have data in localStorage, if not use mock data
  const storedData = localStorage.getItem(ORGANIZATION_URL);
  if (storedData) {
    return JSON.parse(storedData);
  }
  
  // Store mock data in localStorage for persistence
  localStorage.setItem(ORGANIZATION_URL, JSON.stringify(MOCK_ORGANIZATION));
  return MOCK_ORGANIZATION;
};

export const updateOrganization = async (data: Partial<Organization>): Promise<Organization> => {
  const currentOrg = await getOrganization();
  const updatedOrg = {
    ...currentOrg,
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(ORGANIZATION_URL, JSON.stringify(updatedOrg));
  return updatedOrg;
};