import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  fullWidth?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Search...',
  error,
  fullWidth = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(option => option.value === value);
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className={`mb-4 relative ${fullWidth ? 'w-full' : ''}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div 
        className={`
          flex items-center px-3 py-2 bg-white border rounded-md shadow-sm
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${isOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}
          cursor-pointer
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          className="w-full focus:outline-none"
          placeholder={selectedOption?.label || placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`
                  px-4 py-2 cursor-pointer hover:bg-gray-100
                  ${option.value === value ? 'bg-indigo-50 text-indigo-700' : ''}
                `}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;