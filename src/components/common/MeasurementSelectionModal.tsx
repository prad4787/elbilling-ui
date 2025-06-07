import React, { useState } from 'react';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';

interface MeasurementOption {
  source: 'current' | 'previous';
  billNumber?: string;
  date?: string;
  measurements: Record<string, string | number>;
}

interface MeasurementSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: MeasurementOption[];
  onSelect: (measurements: Record<string, string | number>) => void;
}

const MeasurementSelectionModal: React.FC<MeasurementSelectionModalProps> = ({
  isOpen,
  onClose,
  options,
  onSelect
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (option.billNumber?.toLowerCase().includes(searchLower) || !searchTerm) ||
      (option.source === 'current' && 'current bill'.includes(searchLower))
    );
  });

  const handleSelect = () => {
    if (selectedOption !== null) {
      onSelect(options[selectedOption].measurements);
      onClose();
    }
  };

  const formatMeasurement = (key: string, value: string | number) => {
    const formattedKey = key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    return `${formattedKey}: ${value}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Measurements"
      size="lg"
    >
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search by bill number..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedOption === index
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedOption(index)}
            >
              <div className="mb-3">
                <h3 className="font-medium text-gray-900">
                  {option.source === 'current' ? 'Current Bill' : `Bill #${option.billNumber}`}
                </h3>
                {option.source === 'previous' && option.date && (
                  <p className="text-sm text-gray-500">
                    {format(new Date(option.date), 'dd/MM/yyyy')}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                {Object.entries(option.measurements).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-gray-600">{formatMeasurement(key, value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredOptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No measurements found matching your search
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={selectedOption === null}
          >
            Use Selected
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MeasurementSelectionModal;