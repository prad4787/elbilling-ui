import React, { useState, useEffect } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { Customer, FormMode } from '../../../types';
import { getCustomers } from '../../../services/customerService';

interface CustomerFormProps {
  customer?: Customer;
  mode: FormMode;
  onSubmit: (data: Omit<Customer, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  mode,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: '',
    description: '',
    referrerId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  useEffect(() => {
    if (customer && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        avatar: customer.avatar || '',
        description: customer.description || '',
        referrerId: customer.referrerId || ''
      });
    }
    
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers for referrer selection:', error);
      }
    };
    
    fetchCustomers();
  }, [customer, mode]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleReferrerChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      referrerId: value
    }));
    
    if (errors.referrerId) {
      setErrors(prev => ({ ...prev, referrerId: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    }
    
    if (!formData.address) {
      newErrors.address = 'Address is required';
    }
    
    // Only validate avatar URL if it's provided and we're in edit/view mode
    if (formData.avatar && (mode === 'edit' || mode === 'view') && !isValidUrl(formData.avatar)) {
      newErrors.avatar = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'view') {
      onCancel();
      return;
    }
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting customer form:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const isReadOnly = mode === 'view';
  const isCreateMode = mode === 'create';
  
  // Filter out current customer from referrer options if in edit mode
  const referrerOptions = customers
    .filter(c => mode !== 'edit' || c.id !== customer?.id)
    .map(c => ({
      value: c.id,
      label: c.name
    }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        name="name"
        type="text"
        label="Name"
        placeholder="Enter customer name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        disabled={isReadOnly}
        required
      />
      
      <Input
        id="phone"
        name="phone"
        type="text"
        label="Phone"
        placeholder="Enter phone number"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        disabled={isReadOnly}
        required
      />
      
      <Input
        id="address"
        name="address"
        type="text"
        label="Address"
        placeholder="Enter address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        disabled={isReadOnly}
        required
      />
      
      {/* Avatar and Description only shown in edit/view modes */}
      {!isCreateMode && (
        <>
          <Input
            id="avatar"
            name="avatar"
            type="text"
            label="Avatar URL"
            placeholder="Enter avatar image URL"
            value={formData.avatar}
            onChange={handleChange}
            error={errors.avatar}
            disabled={isReadOnly}
          />
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Enter customer description"
              value={formData.description}
              onChange={handleChange}
              className={`
                px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm w-full
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all duration-200 hover:border-gray-400
                ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              `}
              disabled={isReadOnly}
            />
            {errors.description && <p className="mt-2 text-sm text-red-600 font-medium">{errors.description}</p>}
          </div>
        </>
      )}
      
      <SearchableSelect
        label="Referrer (Customer)"
        options={referrerOptions}
        value={formData.referrerId}
        onChange={handleReferrerChange}
        placeholder="Search for a customer as referrer"
        error={errors.referrerId}
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          {mode === 'view' ? 'Close' : 'Cancel'}
        </Button>
        
        {mode !== 'view' && (
          <Button 
            type="submit" 
            isLoading={isSubmitting}
          >
            {mode === 'create' ? 'Create Customer' : 'Update Customer'}
          </Button>
        )}
      </div>
    </form>
  );
};

export default CustomerForm;