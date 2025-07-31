'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  description?: string;
  iconUrl?: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  maxDisplayed?: number;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  className = '',
  maxDisplayed = 3
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(s => s !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const removeOption = (value: string) => {
    onChange(selected.filter(s => s !== value));
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    
    const selectedOptions = selected.map(value => 
      options.find(opt => opt.value === value)?.label || value
    );

    if (selected.length <= maxDisplayed) {
      return selectedOptions.join(', ');
    }
    
    return `${selectedOptions.slice(0, maxDisplayed).join(', ')} +${selected.length - maxDisplayed} more`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Items Display */}
      <div className="mb-2 flex flex-wrap gap-1">
        {selected.slice(0, maxDisplayed).map(value => {
          const option = options.find(opt => opt.value === value);
          return (
            <span
              key={value}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
            >
              <span>{option?.label || value}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(value);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
        {selected.length > maxDisplayed && (
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
            +{selected.length - maxDisplayed} more
          </span>
        )}
      </div>

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-gray-300 rounded-lg calendly-body text-left flex items-center justify-between bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        <span className={selected.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between text-sm border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-2">
                    {option.iconUrl && (
                      <img 
                        src={option.iconUrl} 
                        alt="" 
                        className="w-4 h-4" 
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-gray-500">{option.description}</div>
                      )}
                    </div>
                  </div>
                  {selected.includes(option.value) && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}