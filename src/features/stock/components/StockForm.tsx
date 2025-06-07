import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { Stock, FormMode } from '../../../types';

interface StockFormProps {
  stock?: Stock;
  mode: FormMode;
  onSubmit: (data: Omit<Stock, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const StockForm: React.FC<StockFormProps> = ({
  stock,
  mode,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    name: '',
    code: '',
    category: '',
    quantity: 0,
    hsCode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (stock && (mode === 'edit' || mode === 'view')) {
      setFormData({
        date: stock.date,
        name: stock.name,
        code: stock.code,
        category: stock.category,
        quantity: stock.quantity,
        hsCode: stock.hsCode
      });
    }
  }, [stock, mode]);
  
  const categoryOptions = [
    { value: 'Coat/Shafari', label: 'Coat/Shafari' },
    { value: 'Shirt', label: 'Shirt' },
    { value: 'Pants', label: 'Pants' },
    { value: 'Fabric', label: 'Fabric' },
    { value: 'Accessories', label: 'Accessories' }
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.code) {
      newErrors.code = 'Code is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
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
        console.error('Error submitting stock form:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const isReadOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="date"
          name="date"
          type="date"
          label="Date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          disabled={isReadOnly}
          required
        />
        
        <Input
          id="name"
          name="name"
          type="text"
          label="Name"
          placeholder="Enter stock name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={isReadOnly}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="code"
          name="code"
          type="text"
          label="Code"
          placeholder="Enter unique code"
          value={formData.code}
          onChange={handleChange}
          error={errors.code}
          disabled={isReadOnly}
          required
        />
        
        <Select
          id="category"
          name="category"
          label="Select Category"
          options={categoryOptions}
          value={formData.category}
          onChange={handleChange}
          error={errors.category}
          disabled={isReadOnly}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="quantity"
          name="quantity"
          type="number"
          label="Quantity(m)"
          placeholder="Enter quantity"
          value={formData.quantity.toString()}
          onChange={handleChange}
          error={errors.quantity}
          disabled={isReadOnly}
          required
          min="0"
        />
        
        <Input
          id="hsCode"
          name="hsCode"
          type="text"
          label="HS Code"
          placeholder="Enter HS code"
          value={formData.hsCode}
          onChange={handleChange}
          error={errors.hsCode}
          disabled={isReadOnly}
        />
      </div>
      
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
            {mode === 'create' ? 'Create Stock' : 'Update Stock'}
          </Button>
        )}
      </div>
    </form>
  );
};

export default StockForm;