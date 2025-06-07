import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register, loading } = useAuth();
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) {
      newErrors.name = 'Name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await register(email, password, name);
      } catch (error) {
        console.error('Registration error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <div className="flex justify-center">
            <Package className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <Input
            id="name"
            type="text"
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            error={errors.name}
            autoComplete="name"
          />
          
          <Input
            id="email"
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            error={errors.email}
            autoComplete="email"
          />
          
          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            error={errors.password}
            autoComplete="new-password"
          />
          
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              isLoading={loading}
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;