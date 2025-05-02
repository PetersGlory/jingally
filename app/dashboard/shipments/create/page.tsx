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
import { Package, Truck, Plane, Ship, Camera, Calendar, Clock, AlertCircle, HelpCircle, ChevronRight, Image, X, Maximize2, Box, MapPin, Plus, Info, ChevronDown, CreditCard } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { createShipment } from "@/lib/shipment"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api'

// Interfaces
interface PackageDetails {
  type: string
  description: string
  weight: string
  length: string
  width: string
  height: string
  isFragile: boolean
  value: string
  currency: string
}

interface Address {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
  latitude: number
  longitude: number
  placeId: string
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

interface PaymentDetails {
  method: 'card' | 'bank' | 'wallet'
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  bankName?: string
  accountNumber?: string
  walletType?: string
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
  }
]

const MAX_DIMENSION = 1000 // Maximum dimension in cm
const MAX_WEIGHT = 1000 // Maximum weight in kg

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Pay with your card'
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    icon: CreditCard,
    description: 'Pay via bank transfer'
  },
  {
    id: 'wallet',
    label: 'Digital Wallet',
    icon: CreditCard,
    description: 'Pay with your digital wallet'
  }
]

export default function CreateShipmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { token } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Package Details
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    type: "",
    description: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    isFragile: false,
    value: "",
    currency: "USD"
  })

  // Photos
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Addresses
  const [pickupAddress, setPickupAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    latitude: 0,
    longitude: 0,
    placeId: ""
  })
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    latitude: 0,
    longitude: 0,
    placeId: ""
  })

  // Receiver Details
  const [receiver, setReceiver] = useState<Receiver>({
    name: "",
    phone: "",
    email: "",
    countryCode: "+1"
  })

  // Payment
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: 'card'
  })

  // Autocomplete
  const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [deliveryAutocomplete, setDeliveryAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

  // Calculate volume
  const calculateVolume = useCallback((): string => {
    const { length, width, height } = packageDetails
    if (length && width && height) {
      const volume = Number(length) * Number(width) * Number(height)
      return volume.toFixed(2)
    }
    return '0.00'
  }, [packageDetails])

  // Validate dimensions
  const validateDimensions = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    const numericFields = ['weight', 'length', 'width', 'height'] as const
    
    numericFields.forEach(field => {
      const value = packageDetails[field]
      if (!value.trim()) {
        newErrors[field] = `Please enter package ${field}`
      } else if (isNaN(Number(value)) || Number(value) <= 0) {
        newErrors[field] = `Please enter a valid ${field}`
      } else if (field === 'weight' && Number(value) > MAX_WEIGHT) {
        newErrors[field] = `Weight cannot exceed ${MAX_WEIGHT}kg`
      } else if (field !== 'weight' && Number(value) > MAX_DIMENSION) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${MAX_DIMENSION}cm`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [packageDetails])

  // Handle dimension changes
  const handleDimensionChange = (field: keyof PackageDetails, value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '')
    const finalValue = numericValue.replace(/(\..*)\./g, '$1')
    setPackageDetails(prev => ({ ...prev, [field]: finalValue }))
    setErrors(prev => {
      const updatedErrors = { ...prev }
      delete updatedErrors[field]
      delete updatedErrors.general
      return updatedErrors
    })
  }

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1: // Package Type
        if (!packageDetails.type) newErrors.type = "Package type is required"
        break
      case 2: // Package Information
        if (!packageDetails.description) newErrors.description = "Description is required"
        if (!packageDetails.weight) newErrors.weight = "Weight is required"
        if (!packageDetails.length) newErrors.length = "Length is required"
        if (!packageDetails.width) newErrors.width = "Width is required"
        if (!packageDetails.height) newErrors.height = "Height is required"
        if (!packageDetails.value) newErrors.value = "Package value is required"
        break
      case 3: // Package Dimensions
        if (!validateDimensions()) return false
        break
      case 4: // Package Photos
        if (photos.length === 0) newErrors.photos = "At least one photo is required"
        break
      case 5: // Delivery Details
        if (!pickupAddress.street) newErrors.pickupAddress = "Pickup address is required"
        if (!deliveryAddress.street) newErrors.deliveryAddress = "Delivery address is required"
        if (!receiver.name) newErrors.receiverName = "Receiver name is required"
        if (!receiver.email) newErrors.receiverEmail = "Receiver email is required"
        if (!receiver.phone) newErrors.receiverPhone = "Receiver phone is required"
        break
      case 6: // Package Preview
        // No validation needed for preview
        break
      case 7: // Payment
        if (paymentDetails.method === 'card') {
          if (!paymentDetails.cardNumber) newErrors.cardNumber = "Card number is required"
          if (!paymentDetails.expiryDate) newErrors.expiryDate = "Expiry date is required"
          if (!paymentDetails.cvv) newErrors.cvv = "CVV is required"
        } else if (paymentDetails.method === 'bank') {
          if (!paymentDetails.bankName) newErrors.bankName = "Bank name is required"
          if (!paymentDetails.accountNumber) newErrors.accountNumber = "Account number is required"
        } else if (paymentDetails.method === 'wallet') {
          if (!paymentDetails.walletType) newErrors.walletType = "Wallet type is required"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  // Handle back step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      const response = await createShipment({
        packageDetails,
        pickupAddress,
        deliveryAddress,
        receiver,
        photos,
        paymentDetails
      },token as string)

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

  // Handle photo upload
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
      // Implement camera functionality
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
      // Implement gallery selection
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
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
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
              {step < 7 && (
                <div
                  className={`w-20 h-1 transition-colors ${
                    currentStep > step ? "bg-blue-600" : "bg-gray-100"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1
                ? "Select Package Type"
                : currentStep === 2
                ? "Package Information"
                : currentStep === 3
                ? "Package Dimensions"
                : currentStep === 4
                ? "Package Photos"
                : currentStep === 5
                ? "Delivery Details"
                : currentStep === 6
                ? "Package Preview"
                : "Payment"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1
                ? "Choose the type of package you want to ship"
                : currentStep === 2
                ? "Enter details about your package"
                : currentStep === 3
                ? "Specify package dimensions and weight"
                : currentStep === 4
                ? "Add photos of your package"
                : currentStep === 5
                ? "Enter delivery and receiver information"
                : currentStep === 6
                ? "Review your shipment details"
                : "Complete your payment"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Package Type Selection */}
            {currentStep === 1 && (
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
            )}

            {/* Step 2: Package Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label>Package Description</Label>
                  <Textarea
                    value={packageDetails.description}
                    onChange={(e) => setPackageDetails({ ...packageDetails, description: e.target.value })}
                    placeholder="Enter details about your package..."
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Package Value</Label>
                    <div className="flex">
                      <Select
                        value={packageDetails.currency}
                        onValueChange={(value) => setPackageDetails({ ...packageDetails, currency: value })}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Value"
                        value={packageDetails.value}
                        onChange={(e) => setPackageDetails({ ...packageDetails, value: e.target.value })}
                        className="ml-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Is this a fragile package?</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={packageDetails.isFragile ? "outline" : "default"}
                        onClick={() => setPackageDetails({ ...packageDetails, isFragile: false })}
                      >
                        No
                      </Button>
                      <Button
                        variant={packageDetails.isFragile ? "default" : "outline"}
                        onClick={() => setPackageDetails({ ...packageDetails, isFragile: true })}
                      >
                        Yes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Package Dimensions */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    placeholder="Enter weight in kilograms"
                    value={packageDetails.weight}
                    onChange={(e) => handleDimensionChange('weight', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Dimensions (cm)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Input
                        type="number"
                        placeholder="Length"
                        value={packageDetails.length}
                        onChange={(e) => handleDimensionChange('length', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Width"
                        value={packageDetails.width}
                        onChange={(e) => handleDimensionChange('width', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Height"
                        value={packageDetails.height}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
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
                </div>
              </div>
            )}

            {/* Step 4: Package Photos */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.timestamp} className="relative">
                      <div className="aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img 
                          src={photo.uri}
                          alt="Package photo"
                          className="w-full h-full object-cover"
                        />
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
            )}

            {/* Step 5: Delivery Details */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <Label>Pickup Address</Label>
                  <Autocomplete
                    onLoad={(autocomplete) => setPickupAutocomplete(autocomplete)}
                    onPlaceChanged={() => {
                      if (pickupAutocomplete) {
                        const place = pickupAutocomplete.getPlace()
                        if (place.geometry) {
                          const addressComponents = place.address_components || []
                          const street = place.formatted_address || ''
                          const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || ''
                          const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || ''
                          const country = addressComponents.find(c => c.types.includes('country'))?.long_name || ''
                          const zipCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || ''
                          
                          setPickupAddress({
                            street,
                            city,
                            state,
                            country,
                            zipCode,
                            latitude: place.geometry?.location?.lat() || 0,
                            longitude: place.geometry?.location?.lng() || 0,
                            placeId: place.place_id || ''
                          })
                        }
                      }
                    }}
                  >
                    <Input
                      type="text"
                      placeholder="Search for pickup address"
                    />
                  </Autocomplete>
                </div>

                <div>
                  <Label>Delivery Address</Label>
                  <Autocomplete
                    onLoad={(autocomplete) => setDeliveryAutocomplete(autocomplete)}
                    onPlaceChanged={() => {
                      if (deliveryAutocomplete) {
                        const place = deliveryAutocomplete.getPlace()
                        if (place.geometry) {
                          const addressComponents = place.address_components || []
                          const street = place.formatted_address || ''
                          const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || ''
                          const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || ''
                          const country = addressComponents.find(c => c.types.includes('country'))?.long_name || ''
                          const zipCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || ''
                          
                          setDeliveryAddress({
                            street,
                            city,
                            state,
                            country,
                            zipCode,
                            latitude: place.geometry?.location?.lat() || 0,
                            longitude: place.geometry?.location?.lng() || 0,
                            placeId: place.place_id || ''
                          })
                        }
                      }
                    }}
                  >
                    <Input
                      type="text"
                      placeholder="Search for delivery address"
                    />
                  </Autocomplete>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Receiver Name</Label>
                    <Input
                      value={receiver.name}
                      onChange={(e) => setReceiver({ ...receiver, name: e.target.value })}
                      placeholder="Enter receiver's name"
                    />
                  </div>
                  <div>
                    <Label>Receiver Email</Label>
                    <Input
                      type="email"
                      value={receiver.email}
                      onChange={(e) => setReceiver({ ...receiver, email: e.target.value })}
                      placeholder="Enter receiver's email"
                    />
                  </div>
                </div>

                <div>
                  <Label>Receiver Phone</Label>
                  <div className="flex">
                    <Select
                      value={receiver.countryCode}
                      onValueChange={(value) => setReceiver({ ...receiver, countryCode: value })}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">+1</SelectItem>
                        <SelectItem value="+44">+44</SelectItem>
                        <SelectItem value="+33">+33</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      value={receiver.phone}
                      onChange={(e) => setReceiver({ ...receiver, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="ml-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Package Preview */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Package Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">{PACKAGE_TYPES.find(t => t.id === packageDetails.type)?.label}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="font-medium">{packageDetails.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Weight</p>
                        <p className="font-medium">{packageDetails.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Dimensions</p>
                        <p className="font-medium">{packageDetails.length} × {packageDetails.width} × {packageDetails.height} cm</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Value</p>
                      <p className="font-medium">{packageDetails.currency} {packageDetails.value}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Delivery Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Pickup Address</p>
                      <p className="font-medium">{pickupAddress.street}</p>
                      <p className="text-sm text-gray-600">{pickupAddress.city}, {pickupAddress.state}, {pickupAddress.country}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delivery Address</p>
                      <p className="font-medium">{deliveryAddress.street}</p>
                      <p className="text-sm text-gray-600">{deliveryAddress.city}, {deliveryAddress.state}, {deliveryAddress.country}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Receiver</p>
                        <p className="font-medium">{receiver.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <p className="font-medium">{receiver.countryCode} {receiver.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Package Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.timestamp} className="aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img 
                          src={photo.uri}
                          alt="Package photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Payment */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentDetails({ ...paymentDetails, method: method.id as 'card' | 'bank' | 'wallet' })}
                        className={`relative flex items-start p-4 rounded-xl border-2 transition-all ${
                          paymentDetails.method === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div 
                            className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                              paymentDetails.method === method.id
                                ? 'bg-blue-600'
                                : 'bg-gray-100'
                            }`}
                          >
                            <method.icon 
                              className={`w-6 h-6 ${
                                paymentDetails.method === method.id
                                  ? 'text-white'
                                  : 'text-gray-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-base font-semibold mb-1 transition-colors ${
                              paymentDetails.method === method.id
                                ? 'text-blue-600'
                                : 'text-gray-800'
                            }`}>
                              {method.label}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentDetails.method === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <Label>Card Number</Label>
                      <Input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentDetails.expiryDate}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <Input
                          type="text"
                          placeholder="123"
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentDetails.method === 'bank' && (
                  <div className="space-y-4">
                    <div>
                      <Label>Bank Name</Label>
                      <Input
                        type="text"
                        placeholder="Enter bank name"
                        value={paymentDetails.bankName}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Account Number</Label>
                      <Input
                        type="text"
                        placeholder="Enter account number"
                        value={paymentDetails.accountNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {paymentDetails.method === 'wallet' && (
                  <div>
                    <Label>Wallet Type</Label>
                    <Select
                      value={paymentDetails.walletType}
                      onValueChange={(value) => setPaymentDetails({ ...paymentDetails, walletType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select wallet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="apple">Apple Pay</SelectItem>
                        <SelectItem value="google">Google Pay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
            disabled={isLoading}
            className="px-8 py-2 bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                {currentStep === 7 ? "Complete Payment" : "Continue"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
