import { User } from '../context/AuthContext';

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@example.com', name: 'Admin User' }
];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (email: string, password: string): Promise<User> => {
  // Simulate API call
  await delay(800);
  
  // For demo purposes, accept any email/password combination where password is "password"
  if (password !== 'password') {
    throw new Error('Invalid credentials');
  }
  
  // Find user or create a new one for demo purposes
  const existingUser = MOCK_USERS.find(user => user.email === email);
  if (existingUser) {
    return existingUser;
  }
  
  // Create new user profile if email doesn't exist
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name: email.split('@')[0]
  };
  
  MOCK_USERS.push(newUser);
  return newUser;
};

export const register = async (email: string, password: string, name: string): Promise<User> => {
  // Simulate API call
  await delay(800);
  
  // Check if user already exists
  const existingUser = MOCK_USERS.find(user => user.email === email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name
  };
  
  MOCK_USERS.push(newUser);
  return newUser;
};