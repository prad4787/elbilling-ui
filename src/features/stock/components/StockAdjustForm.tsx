import React, { useState } from 'react';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { Stock, StockAdjustment } from '../../../types';

interface StockAdjustFormProps {
  stock: Stock;
  onSubmit: (adjustment: StockAdjustment) => Promise<void>;
  onCancel: () => void;
}

const StockAdjustForm: React.FC<StockAdjustFormProps> = ({
  stock,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<StockAdjustment, 'stockId'>>({
    quantity: 1,
    type: 'add',
    reason: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const adjustmentTypeOptions = [
    { value: 'add', label: 'Add Stock' },
    { value: 'deduct', label: 'Deduct Stock' }
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (formData.type === 'deduct' && formData.quantity > stock.quantity) {
      newErrors.quantity = `Cannot deduct more than available quantity (${stock.quantity})`;
    }
    
    if (!formData.reason) {
      newErrors.reason = 'Reason is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        await onSubmit({
          stockId: stock.id,
          ...formData
        });
      } catch (error) {
        console.error('Error adjusting stock:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded mb-4">
        <h3 className="font-medium text-gray-700 mb-2">Current Stock Details</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Name:</span>{' '}
            <span className="font-medium">{stock.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Code:</span>{' '}
            <span className="font-medium">{stock.code}</span>
          </div>
          <div>
            <span className="text-gray-500">Category:</span>{' '}
            <span className="font-medium">{stock.category}</span>
          </div>
          <div>
            <span className="text-gray-500">Current Quantity:</span>{' '}
            <span className="font-medium">{stock.quantity}</span>
          </div>
        </div>
      </div>
      
      <Select
        id="type"
        name="type"
        label="Adjustment Type"
        options={adjustmentTypeOptions}
        value={formData.type}
        onChange={handleChange}
        error={errors.type}
        required
      />
      
      <Input
        id="quantity"
        name="quantity"
        type="number"
        label="Quantity to Adjust"
        placeholder="Enter quantity"
        value={formData.quantity.toString()}
        onChange={handleChange}
        error={errors.quantity}
        required
        min="1"
      />
      
      <div className="mb-4">
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Adjustment
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          placeholder="Enter the reason for this adjustment"
          value={formData.reason}
          onChange={handleChange}
          className={`
            px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm w-full
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            ${errors.reason ? 'border-red-500' : ''}
          `}
          required
        />
        {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        
        <Button 
          type="submit" 
          variant={formData.type === 'add' ? 'success' : 'danger'}
          isLoading={isSubmitting}
        >
          {formData.type === 'add' ? 'Add Stock' : 'Deduct Stock'}
        </Button>
      </div>
    </form>
  );
};

export default StockAdjustForm;