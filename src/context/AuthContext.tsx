import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, register } from '../services/authService';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = await login(email, password);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleRegister = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const userData = await register(email, password, name);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    toast.info('You have been logged out');
  }, [navigate]);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    checkAuth,
  }), [user, loading, handleLogin, handleRegister, handleLogout, checkAuth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};