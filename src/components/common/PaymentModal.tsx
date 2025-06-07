import React, { useState } from 'react';
import { format } from 'date-fns';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxAmount: number;
  onSubmit: (data: { date: string; amount: number }) => Promise<void>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  maxAmount,
  onSubmit
}) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (paymentAmount > maxAmount) {
      setError(`Amount cannot exceed ${maxAmount}`);
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit({ date, amount: paymentAmount });
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Payment"
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            type="date"
            label="Payment Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          
          <Input
            type="number"
            label="Amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            placeholder="Enter payment amount"
            error={error}
            required
            min="0"
            max={maxAmount}
          />
          
          <div className="text-sm text-gray-500">
            Maximum payment amount: {maxAmount}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
            >
              Add Payment
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;