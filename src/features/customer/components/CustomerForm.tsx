import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
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
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
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
      setAvatarPreview(customer.avatar || '');
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: 'Please select a valid image file' }));
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'File size must be less than 2MB' }));
        return;
      }

      // Create preview and store file data
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({
          ...prev,
          avatar: result
        }));
        // Clear any previous errors
        setErrors(prev => ({ ...prev, avatar: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview('');
    setFormData(prev => ({
      ...prev,
      avatar: ''
    }));
    // Clear file input
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          {/* Avatar Upload */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Avatar
            </label>
            
            <div className="flex items-start space-x-4">
              {/* Avatar Preview */}
              {avatarPreview && (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                  />
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
              
              {/* Upload Area */}
              {!isReadOnly && (
                <div className="flex-1">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-gray-600 font-medium">
                          {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG up to 2MB
                        </span>
                      </div>
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
            
            {errors.avatar && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.avatar}</p>
            )}
          </div>
          
          {/* Description */}
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