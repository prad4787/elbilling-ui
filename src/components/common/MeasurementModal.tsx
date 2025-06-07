import React from 'react';
import { CATEGORY_MEASUREMENTS } from '../../types';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

interface MeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  measurements: Record<string, string | number>;
  onSave: (measurements: Record<string, string | number>) => void;
}

const MeasurementModal: React.FC<MeasurementModalProps> = ({
  isOpen,
  onClose,
  category,
  measurements,
  onSave
}) => {
  const [values, setValues] = React.useState<Record<string, string | number>>(measurements);

  React.useEffect(() => {
    setValues(measurements);
  }, [measurements]);

  const handleChange = (field: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onSave(values);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category}
      size="md"
    >
      <div className="space-y-4">
        {CATEGORY_MEASUREMENTS[category]?.map(field => (
          <Input
            key={field}
            label={field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            type="number"
            value={values[field]?.toString() || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={`Enter ${field}`}
          />
        ))}
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MeasurementModal;