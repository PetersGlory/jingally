'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Globe, Check, Search, X } from 'lucide-react';

interface Country {
  code: string;
  name: string;
}

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// List of countries
const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'FI', name: 'Finland' },
  { code: 'DK', name: 'Denmark' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'IL', name: 'Israel' },
  { code: 'TR', name: 'Turkey' },
  { code: 'RU', name: 'Russia' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function CountrySelect({ value, onChange, error }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(COUNTRIES);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get selected country
  const selectedCountry = COUNTRIES.find(country => country.name === value) || null;

  // Filter countries based on search term
  useEffect(() => {
    const filtered = COUNTRIES.filter(country => 
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCountries(filtered);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle selection
  const handleSelectCountry = (country: Country) => {
    onChange(country.name);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`relative cursor-pointer ${
          error ? 'ring-2 ring-red-300' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Globe className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className={`pl-10 block w-full rounded-md border ${
          error ? 'border-red-300' : 'border-gray-300'
        } py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white`}>
          {selectedCountry ? (
            <div className="flex items-center">
              <span className="mr-2 text-gray-700">{selectedCountry.name}</span>
            </div>
          ) : (
            <span className="text-gray-400">Select a country</span>
          )}
        </div>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <div className="sticky top-0 z-10 bg-white p-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="pl-9 pr-9 block w-full rounded-md border border-gray-300 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchTerm('');
                    }}
                    className="focus:outline-none"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {filteredCountries.length > 0 ? (
            <ul className="py-2">
              {filteredCountries.map((country) => (
                <li 
                  key={country.code}
                  className={`relative px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    selectedCountry?.code === country.code ? 'bg-gray-50' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCountry(country);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="block truncate">
                      {country.name}
                    </span>
                    {selectedCountry?.code === country.code && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No countries found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
