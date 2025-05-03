'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, X, Check, Hash, Save, ChevronLeft } from 'lucide-react';
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';
import { toast } from 'react-hot-toast';

// Custom components
import CountrySelect from '@/components/CountrySelect';

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  placeId: string;
  isDefault: boolean;
}

interface FormErrors {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

// API service
const createAddress = async (addressData: AddressFormData, token: string) => {
  try {
    const response = await fetch('/api/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addressData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating address:', error);
    return { success: false, error: 'Failed to create address' };
  }
};

export default function AddNewAddress() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    latitude: 0,
    longitude: 0,
    placeId: '',
    isDefault: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Map configuration
  const mapContainerStyle = {
    width: '100%',
    height: '250px',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    display: mapLoaded && formData.latitude ? 'block' : 'none'
  };
  
  const center = {
    lat: formData.latitude || 51.5074, // Default to London
    lng: formData.longitude || -0.1278
  };

  // Handle place selection
  const handlePlaceSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        // Extract address components
        const addressComponents = place.address_components || [];
        
        // Extract address details
        const street = place.formatted_address || '';
        const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
        const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
        const country = addressComponents.find(c => c.types.includes('country'))?.long_name || '';
        const zipCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';
        
        // Update form data
        setFormData({
          ...formData,
          street,
          city,
          state,
          country,
          zipCode,
          latitude: place.geometry?.location?.lat() || 0,
          longitude: place.geometry?.location?.lng() || 0,
          placeId: place.place_id || ''
        });
        
        // Clear errors
        setErrors({
          ...errors,
          street: undefined,
          city: undefined,
          state: undefined,
          country: undefined,
          zipCode: undefined
        });
      }
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async () => {
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    console.log("formData", formData)
    
    try {
      setLoading(true);
      
      // Get token from local storage
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/auth/signin');
        return;
      }
      
      // Submit address
      const response = await createAddress(formData, token);
      
      if (response.success) {
        toast.success('Address added successfully');
        router.push('/settings/addresses');
      } else {
        toast.error(response.error || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('An error occurred while adding the address');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      latitude: 0,
      longitude: 0,
      placeId: '',
      isDefault: false,
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Add New Address</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Address Information
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* Google Maps Section */}
              <LoadScript
                googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                libraries={["places"]}
                onLoad={() => setMapLoaded(true)}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search for an address
                  </label>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <Autocomplete
                      onLoad={(autocomplete: google.maps.places.Autocomplete) => setAutocomplete(autocomplete)}
                      onPlaceChanged={handlePlaceSelect}
                    >
                      <input
                        type="text"
                        className={`pl-10 block w-full rounded-md border ${
                          errors.street ? 'border-red-300' : 'border-gray-300'
                        } py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                        placeholder="Search for an address"
                      />
                    </Autocomplete>
                    
                    {formData.street && (
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => {
                          setFormData({...formData, street: ''});
                        }}
                      >
                        <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                      </button>
                    )}
                  </div>
                  
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                  )}
                </div>
                
                {/* Map View */}
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={15}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                  }}
                >
                  {/* Marker */}
                  {formData.latitude !== 0 && (
                    <Marker position={center} />
                  )}
                </GoogleMap>
              </LoadScript>
              
              {/* Address Details */}
              <div className="space-y-4 mt-4">
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({...formData, street: e.target.value})}
                      className={`pl-10 block w-full rounded-md border ${
                        errors.street ? 'border-red-300' : 'border-gray-300'
                      } py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                      placeholder="Street address"
                    />
                  </div>
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className={`pl-10 block w-full rounded-md border ${
                          errors.city ? 'border-red-300' : 'border-gray-300'
                        } py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                        placeholder="City"
                      />
                    </div>
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className={`pl-10 block w-full rounded-md border ${
                          errors.state ? 'border-red-300' : 'border-gray-300'
                        } py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                        placeholder="State"
                      />
                    </div>
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <CountrySelect
                      value={formData.country}
                      onChange={(country) => setFormData({...formData, country})}
                      error={errors.country}
                    />
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP / Postal Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                        className={`pl-10 block w-full rounded-md border ${
                          errors.zipCode ? 'border-red-300' : 'border-gray-300'
                        } py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                        placeholder="ZIP code"
                      />
                    </div>
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
                
                {/* Default Address Checkbox */}
                <div className="flex items-center mt-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isDefault: !formData.isDefault})}
                    className="flex items-center focus:outline-none"
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 mr-2 ${
                      formData.isDefault 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300'
                    }`}>
                      {formData.isDefault && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">Set as default address</span>
                  </button>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Address
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
