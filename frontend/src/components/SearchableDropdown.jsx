import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const SearchableDropdown = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found',
  disabled = false,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search term to optimize render on massive lists (districts/tehsils)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset search term when dropdown closes or value changes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setDebouncedTerm('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(debouncedTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex justify-between items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col">
          <div className="relative p-2 border-b border-slate-100 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
            />
          </div>

          <div className="overflow-y-auto flex-grow max-h-48 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-emerald-50 hover:text-primary transition-colors ${
                    value === option ? 'bg-emerald-50/70 text-primary font-bold' : 'text-slate-700'
                  }`}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm font-medium text-slate-400 text-center">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
