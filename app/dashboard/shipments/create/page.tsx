"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Package, Truck, Plane, Ship, Camera, Calendar, Clock, AlertCircle, HelpCircle, ChevronRight, Image, X, Maximize2, Box, MapPin, Plus, Info, ChevronDown, Feather } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { createShipment, getAddresses } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';

interface PackageDetails {
  type: string
  description: string
  weight: string
  length: string
  width: string
  height: string
  isFragile: boolean
}

interface Address {
  id: string
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  isDefault: boolean
}

interface Receiver {
  name: string
  phone: string
  email: string
  countryCode: string
}

interface Photo {
  uri: string
  type: 'camera' | 'gallery'
  timestamp: number
}

// Constants
const PACKAGE_TYPES = [
  { 
    id: 'document', 
    label: 'Document', 
    icon: Package,
    description: 'Letters, papers, contracts',
    color: '#FFB156'
  },
  { 
    id: 'parcel', 
    label: 'Parcel', 
    icon: Package,
    description: 'Small to medium packages',
    color: '#56D4C1'
  },
  { 
    id: 'pallet', 
    label: 'Pallet', 
    icon: Package,
    description: 'Large items on pallets',
    color: '#0a3b6e'
  },
  { 
    id: 'container', 
    label: 'Container', 
    icon: Truck,
    description: 'Full container loads',
    color: '#4C51BF'
  },
];

// Services Data
const SHIPPING_SERVICES = [
  {
    id: 'document',
    title: 'Document',
    description: 'For letters and documents',
    icon: Package,
    color: '#FFB156',
  },
  {
    id: 'parcel',
    title: 'Parcel',
    description: 'For packages up to 30kg',
    icon: Package,
    color: '#56D4C1',
  },
  {
    id: 'pallet',
    title: 'Pallet',
    description: 'For bulk shipments',
    icon: Package,
    color: '#0a3b6e',
  },
];

const MAX_DIMENSION = 1000; // Maximum dimension in cm
const MAX_WEIGHT = 1000; // Maximum weight in kg

const DELIVERY_MODES = [
  {
    id: 'home',
    label: 'Home Delivery',
    icon: 'home',
    description: 'Deliver to a residential or business address'
  },
  {
    id: 'park',
    label: 'Park Delivery',
    icon: 'map-pin',
    description: 'Deliver to a designated park location'
  }
];

export default function CreateShipmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { token } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedPickupAddress, setSelectedPickupAddress] = useState<string>("")
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<string>("")
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    type: "",
    description: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    isFragile: false
  })
  const [receiver, setReceiver] = useState<Receiver>({
    name: "",
    phone: "",
    email: "",
    countryCode: ""
  })
  const [shippingMethod, setShippingMethod] = useState<"air" | "sea">("air")
  const [pickupDate, setPickupDate] = useState<string>("")
  const [pickupTime, setPickupTime] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [deliveryMode, setDeliveryMode] = useState<'home' | 'park'>('home')
  const [deliveryForm, setDeliveryForm] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    latitude: 0,
    longitude: 0,
    placeId: ''
  })
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [pickupForm, setPickupForm] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    latitude: 0,
    longitude: 0,
    placeId: '',
    type: 'pickup'
  });
  const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (token) {
      fetchAddresses()
    }
  }, [token])

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses(token as string)
      if (response.success) {
        setAddresses(response.data)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch addresses",
      })
    }
  }

  const calculateVolume = useCallback((): string => {
    const { length, width, height } = packageDetails;
    if (length && width && height) {
      const volume = Number(length) * Number(width) * Number(height);
      return volume.toFixed(2);
    }
    return '0.00';
  }, [packageDetails]);

  const validateDimensions = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const numericFields = ['weight', 'length', 'width', 'height'] as const;
    
    numericFields.forEach(field => {
      const value = packageDetails[field];
      if (!value.trim()) {
        newErrors[field] = `Please enter package ${field}`;
      } else if (isNaN(Number(value)) || Number(value) <= 0) {
        newErrors[field] = `Please enter a valid ${field}`;
      } else if (field === 'weight' && Number(value) > MAX_WEIGHT) {
        newErrors[field] = `Weight cannot exceed ${MAX_WEIGHT}kg`;
      } else if (field !== 'weight' && Number(value) > MAX_DIMENSION) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${MAX_DIMENSION}cm`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [packageDetails]);

  const handleDimensionChange = (field: keyof PackageDetails, value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const finalValue = numericValue.replace(/(\..*)\./g, '$1');
    setPackageDetails(prev => ({ ...prev, [field]: finalValue }));
    setErrors(prev => {
      const updatedErrors = { ...prev };
      delete updatedErrors[field];
      delete updatedErrors.general;
      return updatedErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!packageDetails.type) newErrors.type = "Package type is required"
      if (!packageDetails.description) newErrors.description = "Description is required"
      if (!packageDetails.weight) newErrors.weight = "Weight is required"
      if (!packageDetails.length) newErrors.length = "Length is required"
      if (!packageDetails.width) newErrors.width = "Width is required"
      if (!packageDetails.height) newErrors.height = "Height is required"
    } else if (step === 2) {
      if (!selectedPickupAddress) newErrors.pickupAddress = "Pickup address is required"
      if (!selectedDeliveryAddress) newErrors.deliveryAddress = "Delivery address is required"
    } else if (step === 3) {
      if (!receiver.name) newErrors.receiverName = "Receiver name is required"
      if (!receiver.phone) newErrors.receiverPhone = "Phone number is required"
      if (!receiver.email) newErrors.receiverEmail = "Email is required"
      if (receiver.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiver.email)) {
        newErrors.receiverEmail = "Invalid email format"
      }
    } else if (step === 4) {
      if (!shippingMethod) newErrors.shippingMethod = "Shipping method is required"
    } else if (step === 5) {
      if (!pickupDate) newErrors.pickupDate = "Pickup date is required"
      if (!pickupTime) newErrors.pickupTime = "Pickup time is required"
    } else if (step === 6) {
      if (photos.length === 0) newErrors.photos = "At least one photo is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await createShipment(token as string, {
        packageDetails,
        pickupAddressId: selectedPickupAddress,
        deliveryAddressId: selectedDeliveryAddress,
        receiver,
        shippingMethod,
        pickupDate,
        pickupTime
      })

      if (response.success) {
        toast({
          title: "Success",
          description: "Shipment created successfully",
        })
        router.push("/dashboard")
      } else {
        throw new Error(response.message || "Failed to create shipment")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create shipment",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTakePhoto = async () => {
    if (photos.length >= 4) {
      toast({
        variant: "destructive",
        title: "Maximum Photos",
        description: "You can only upload up to 4 photos.",
      })
      return
    }
    try {
      // const result = await ImagePicker.launchCameraAsync({
      //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //   allowsEditing: true,
      //   aspect: [1, 1],
      //   quality: 0.8,
      // })

      // if (!result.canceled) {
      //   const newPhoto: Photo = {
      //     uri: result.assets[0].uri,
      //     type: 'camera',
      //     timestamp: Date.now(),
      //   }
      //   setPhotos(prev => [...prev, newPhoto])
      // }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to take photo. Please try again.",
      })
    }
  }

  const handleChoosePhoto = async () => {
    if (photos.length >= 4) {
      toast({
        variant: "destructive",
        title: "Maximum Photos",
        description: "You can only upload up to 4 photos.",
      })
      return
    }
    setIsUploading(true)
    try {
      // const result = await ImagePicker.launchImageLibraryAsync({
      //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //   allowsEditing: true,
      //   aspect: [1, 1],
      //   quality: 0.8,
      //   allowsMultipleSelection: true,
      //   selectionLimit: 4 - photos.length,
      // })

      console.log("result")

      // if (!result.canceled) {
      //   const newPhotos: Photo[] = result.assets.map((asset: ImagePicker.ImagePickerAsset) => ({
      //     uri: asset.uri,
      //     type: 'gallery',
      //     timestamp: Date.now(),
      //   }))
      //   setPhotos(prev => [...prev, ...newPhotos].slice(0, 4))
      // }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to select photos. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePhoto = (timestamp: number) => {
    setPhotos(prev => prev.filter(photo => photo.timestamp !== timestamp))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Create Shipment</h1>
          </div>
          <button
            onClick={() => {/* TODO: Add help action */}}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  currentStep >= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {step}
              </div>
              {step < 6 && (
                <div
                  className={`w-20 h-1 transition-colors ${
                    currentStep > step ? "bg-blue-600" : "bg-gray-100"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Package Details Step */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Package Information
              </h2>
              <p className="text-gray-600">
                Select your package type and provide details
              </p>
            </div>

            {errors.general && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-600">
                  {errors.general}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Package Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PACKAGE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setPackageDetails({ ...packageDetails, type: type.id })}
                      className={`relative flex items-start p-4 rounded-xl border-2 transition-all ${
                        packageDetails.type === type.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div 
                          className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                            packageDetails.type === type.id
                              ? 'bg-blue-600'
                              : 'bg-gray-100'
                          }`}
                        >
                          <type.icon 
                            className={`w-6 h-6 ${
                              packageDetails.type === type.id
                                ? 'text-white'
                                : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-base font-semibold mb-1 transition-colors ${
                            packageDetails.type === type.id
                              ? 'text-blue-600'
                              : 'text-gray-800'
                          }`}>
                            {type.label}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.type && (
                  <p className="mt-2 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Package Description
                </label>
                <Textarea
                  value={packageDetails.description}
                  onChange={(e) => setPackageDetails({ ...packageDetails, description: e.target.value })}
                  placeholder="Enter details about your package..."
                  className={`min-h-[120px] resize-none ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Package Dimensions Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Package Dimensions</h3>
                
                {/* Weight Input */}
                <div className="mb-6">
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Weight (kg)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter weight in kilograms"
                      value={packageDetails.weight}
                      onChange={(e) => handleDimensionChange('weight', e.target.value)}
                      className={`pl-12 ${errors.weight ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  {errors.weight && (
                    <p className="mt-2 text-sm text-red-600">{errors.weight}</p>
                  )}
                </div>

                {/* Dimensions Input */}
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Dimensions (cm)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Length"
                        value={packageDetails.length}
                        onChange={(e) => handleDimensionChange('length', e.target.value)}
                        className={`pl-12 ${errors.length ? 'border-red-300' : 'border-gray-300'}`}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Width"
                        value={packageDetails.width}
                        onChange={(e) => handleDimensionChange('width', e.target.value)}
                        className={`pl-12 ${errors.width ? 'border-red-300' : 'border-gray-300'}`}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Height"
                        value={packageDetails.height}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                        className={`pl-12 ${errors.height ? 'border-red-300' : 'border-gray-300'}`}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  {(errors.length || errors.width || errors.height) && (
                    <div className="mt-2 space-y-1">
                      {errors.length && <p className="text-sm text-red-600">{errors.length}</p>}
                      {errors.width && <p className="text-sm text-red-600">{errors.width}</p>}
                      {errors.height && <p className="text-sm text-red-600">{errors.height}</p>}
                    </div>
                  )}
                </div>

                {/* Volume Calculation */}
                <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Box className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Total Volume</h4>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-800">{calculateVolume()}</span>
                    <span className="text-gray-500">cm³</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Calculated based on length × width × height
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Is this a fragile package?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPackageDetails({ ...packageDetails, isFragile: false })}
                    className={`py-3 px-4 rounded-xl border-2 text-center transition-all ${
                      packageDetails.isFragile === false
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackageDetails({ ...packageDetails, isFragile: true })}
                    className={`py-3 px-4 rounded-xl border-2 text-center transition-all ${
                      packageDetails.isFragile === true
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Details Step */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Delivery Information
              </h2>
              <p className="text-gray-600">
                Select delivery mode and provide receiver details
              </p>
            </div>

            {/* Delivery Mode Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Mode</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DELIVERY_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      if (mode.id === 'park') {
                        toast({
                          title: "Coming Soon",
                          description: "Park delivery is not available yet",
                          duration: 3000,
                        });
                        return;
                      }
                      setDeliveryMode(mode.id as 'home' | 'park');
                    }}
                    className={`relative flex items-start p-4 rounded-xl border-2 transition-all ${
                      deliveryMode === mode.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                          deliveryMode === mode.id
                            ? 'bg-blue-600'
                            : 'bg-gray-100'
                        }`}
                      >
                        <Feather 
                          name={mode.icon as any}
                          className={`w-6 h-6 ${
                            deliveryMode === mode.id
                              ? 'text-white'
                              : 'text-gray-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-base font-semibold mb-1 transition-colors ${
                          deliveryMode === mode.id
                            ? 'text-blue-600'
                            : 'text-gray-800'
                        }`}>
                          {mode.label}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {mode.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Address Form */}
            {deliveryMode === 'home' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3">
                      Street Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <Autocomplete
                        onLoad={(autocomplete: google.maps.places.Autocomplete) => setAutocomplete(autocomplete)}
                        onPlaceChanged={() => {
                          if (autocomplete) {
                            const place = autocomplete.getPlace();
                            if (place.geometry) {
                              const addressComponents = place.address_components || [];
                              const street = place.formatted_address || '';
                              const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
                              const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
                              const country = addressComponents.find(c => c.types.includes('country'))?.long_name || '';
                              const zipCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';
                              
                              setDeliveryForm({
                                ...deliveryForm,
                                street,
                                city,
                                state,
                                country,
                                zipCode,
                                latitude: place.geometry?.location?.lat() || 0,
                                longitude: place.geometry?.location?.lng() || 0,
                                placeId: place.place_id || ''
                              });
                            }
                          }
                        }}
                      >
                        <input
                          type="text"
                          className={`pl-10 block w-full rounded-md border ${
                            errors.street ? 'border-red-300' : 'border-gray-300'
                          } py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                          placeholder="Search for an address"
                        />
                      </Autocomplete>
                    </div>
                    {errors.street && (
                      <p className="text-sm text-red-600 mt-1">{errors.street}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-3">
                        City
                      </label>
                      <Input
                        placeholder="City"
                        value={deliveryForm.city}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, city: e.target.value })}
                        className={errors.city ? 'border-red-300' : 'border-gray-300'}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-3">
                        State
                      </label>
                      <Input
                        placeholder="State"
                        value={deliveryForm.state}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, state: e.target.value })}
                        className={errors.state ? 'border-red-300' : 'border-gray-300'}
                      />
                      {errors.state && (
                        <p className="text-sm text-red-600 mt-1">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-3">
                        Country
                      </label>
                      <Input
                        placeholder="Country"
                        value={deliveryForm.country}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, country: e.target.value })}
                        className={errors.country ? 'border-red-300' : 'border-gray-300'}
                      />
                      {errors.country && (
                        <p className="text-sm text-red-600 mt-1">{errors.country}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-3">
                        ZIP Code
                      </label>
                      <Input
                        placeholder="ZIP code"
                        value={deliveryForm.zipCode}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, zipCode: e.target.value })}
                        className={errors.zipCode ? 'border-red-300' : 'border-gray-300'}
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Receiver Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Receiver Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Full Name
                  </label>
                  <Input
                    placeholder="Enter receiver's full name"
                    value={receiver.name}
                    onChange={(e) => setReceiver({ ...receiver, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter receiver's email address"
                    value={receiver.email}
                    onChange={(e) => setReceiver({ ...receiver, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Phone Number
                  </label>
                  <div className="flex">
                    <button
                      onClick={() => setShowCountryModal(true)}
                      className="flex items-center px-4 py-2 rounded-l-xl border border-gray-300 bg-gray-50"
                    >
                      <span className="mr-2">
                        {/* {countryCodes.find(c => c.dial_code === receiver.countryCode)?.flag} */}
                      </span>
                      <span className="font-medium mr-1">{receiver.countryCode}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      value={receiver.phone}
                      onChange={(e) => setReceiver({ ...receiver, phone: e.target.value })}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Pickup Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Street Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <Autocomplete
                      onLoad={(autocomplete: google.maps.places.Autocomplete) => setPickupAutocomplete(autocomplete)}
                      onPlaceChanged={() => {
                        if (pickupAutocomplete) {
                          const place = pickupAutocomplete.getPlace();
                          if (place.geometry) {
                            const addressComponents = place.address_components || [];
                            const street = place.formatted_address || '';
                            const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
                            const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
                            const country = addressComponents.find(c => c.types.includes('country'))?.long_name || '';
                            const zipCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';
                            
                            setPickupForm({
                              ...pickupForm,
                              street,
                              city,
                              state,
                              country,
                              zipCode,
                              latitude: place.geometry?.location?.lat() || 0,
                              longitude: place.geometry?.location?.lng() || 0,
                              placeId: place.place_id || ''
                            });
                          }
                        }
                      }}
                    >
                      <input
                        type="text"
                        className={`pl-10 block w-full rounded-md border ${
                          errors.street ? 'border-red-300' : 'border-gray-300'
                        } py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                        placeholder="Search for pickup address"
                      />
                    </Autocomplete>
                  </div>
                  {errors.street && (
                    <p className="text-sm text-red-600 mt-1">{errors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3">
                      City
                    </label>
                    <Input
                      placeholder="City"
                      value={pickupForm.city}
                      onChange={(e) => setPickupForm({ ...pickupForm, city: e.target.value })}
                      className={errors.city ? 'border-red-300' : 'border-gray-300'}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3">
                      State
                    </label>
                    <Input
                      placeholder="State"
                      value={pickupForm.state}
                      onChange={(e) => setPickupForm({ ...pickupForm, state: e.target.value })}
                      className={errors.state ? 'border-red-300' : 'border-gray-300'}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-600 mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3">
                      Country
                    </label>
                    <Input
                      placeholder="Country"
                      value={pickupForm.country}
                      onChange={(e) => setPickupForm({ ...pickupForm, country: e.target.value })}
                      className={errors.country ? 'border-red-300' : 'border-gray-300'}
                    />
                    {errors.country && (
                      <p className="text-sm text-red-600 mt-1">{errors.country}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3">
                      ZIP Code
                    </label>
                    <Input
                      placeholder="ZIP code"
                      value={pickupForm.zipCode}
                      onChange={(e) => setPickupForm({ ...pickupForm, zipCode: e.target.value })}
                      className={errors.zipCode ? 'border-red-300' : 'border-gray-300'}
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">
                    Important Note
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Please ensure all address details are accurate. The driver will contact the receiver before delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1
                ? "Package Details"
                : currentStep === 2
                ? "Addresses"
                : currentStep === 3
                ? "Receiver Information"
                : currentStep === 4
                ? "Shipping Method"
                : currentStep === 5
                ? "Schedule Pickup"
                : "Package Photos"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1
                ? "Enter details about your package"
                : currentStep === 2
                ? "Select pickup and delivery addresses"
                : currentStep === 3
                ? "Enter receiver's information"
                : currentStep === 4
                ? "Choose your preferred shipping method"
                : currentStep === 5
                ? "Select a convenient pickup time"
                : "Add photos of your package"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 4: Shipping Method */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <RadioGroup
                  value={shippingMethod}
                  onValueChange={(value: "air" | "sea") => setShippingMethod(value)}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-muted">
                      <RadioGroupItem value="air" id="air" className="sr-only" />
                      <Label
                        htmlFor="air"
                        className="flex flex-col items-center space-y-2"
                      >
                        <Plane className="h-8 w-8" />
                        <span className="font-medium">Air Freight</span>
                        <span className="text-sm text-muted-foreground">
                          Faster delivery
                        </span>
                      </Label>
                    </div>
                    <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-muted">
                      <RadioGroupItem value="sea" id="sea" className="sr-only" />
                      <Label
                        htmlFor="sea"
                        className="flex flex-col items-center space-y-2"
                      >
                        <Ship className="h-8 w-8" />
                        <span className="font-medium">Sea Freight</span>
                        <span className="text-sm text-muted-foreground">
                          More economical
                        </span>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 5: Schedule Pickup */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Pickup Date</Label>
                  <Input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pickup Time</Label>
                  <Select value={pickupTime} onValueChange={setPickupTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9:00 AM - 12:00 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (1:00 PM - 4:00 PM)</SelectItem>
                      <SelectItem value="evening">Evening (5:00 PM - 8:00 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 6: Package Photos */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Package Photos</h3>
                  <p className="text-gray-600 mb-6">Add up to 4 photos of your package</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {photos.map((photo) => (
                      <div key={photo.timestamp} className="relative">
                        <div className="aspect-square rounded-xl overflow-hidden border border-gray-200">
                          <img 
                            src={photo.uri}
                            alt="Package photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded-full">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                        <button
                          onClick={() => handleRemovePhoto(photo.timestamp)}
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                    
                    {photos.length < 4 && (
                      <button
                        onClick={handleTakePhoto}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                          <Camera className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-blue-600">Take Photo</span>
                      </button>
                    )}
                  </div>

                  {photos.length < 4 && (
                    <Button
                      variant="outline"
                      onClick={handleChoosePhoto}
                      className="w-full"
                      disabled={isUploading}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Choose from Gallery
                    </Button>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Photo Guidelines</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Take clear, well-lit photos</li>
                        <li>• Show all sides of the package</li>
                        <li>• Include any damage or special markings</li>
                        <li>• Ensure package labels are visible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="container mx-auto flex justify-between max-w-7xl mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className="px-6"
          >
            Back
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={isLoading || (currentStep === 6 && photos.length === 0)}
            className="px-8 py-2 bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                {currentStep === 6 ? "Submit" : "Continue"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
