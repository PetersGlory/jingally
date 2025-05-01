"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Package, Truck, Plane, Ship, Camera, Calendar, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { createShipment, getAddresses } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
}

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
    email: ""
  })
  const [shippingMethod, setShippingMethod] = useState<"air" | "sea">("air")
  const [pickupDate, setPickupDate] = useState<string>("")
  const [pickupTime, setPickupTime] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-8">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step}
            </div>
            {step < 5 && (
              <div
                className={`w-16 h-1 ${
                  currentStep > step ? "bg-primary" : "bg-muted"
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
              ? "Package Details"
              : currentStep === 2
              ? "Addresses"
              : currentStep === 3
              ? "Receiver Information"
              : currentStep === 4
              ? "Shipping Method"
              : "Schedule Pickup"}
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
              : "Select a convenient pickup time"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Package Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {errors.type && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.type}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>Package Type</Label>
                <Select
                  value={packageDetails.type}
                  onValueChange={(value) => {
                    setPackageDetails({ ...packageDetails, type: value })
                    setErrors({ ...errors, type: "" })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="parcel">Parcel</SelectItem>
                    <SelectItem value="pallet">Pallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the contents of your package"
                  value={packageDetails.description}
                  onChange={(e) =>
                    setPackageDetails({
                      ...packageDetails,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    placeholder="Enter weight"
                    value={packageDetails.weight}
                    onChange={(e) =>
                      setPackageDetails({
                        ...packageDetails,
                        weight: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Length (cm)</Label>
                  <Input
                    type="number"
                    placeholder="Enter length"
                    value={packageDetails.length}
                    onChange={(e) =>
                      setPackageDetails({
                        ...packageDetails,
                        length: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Width (cm)</Label>
                  <Input
                    type="number"
                    placeholder="Enter width"
                    value={packageDetails.width}
                    onChange={(e) =>
                      setPackageDetails({
                        ...packageDetails,
                        width: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    placeholder="Enter height"
                    value={packageDetails.height}
                    onChange={(e) =>
                      setPackageDetails({
                        ...packageDetails,
                        height: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fragile"
                  checked={packageDetails.isFragile}
                  onChange={(e) =>
                    setPackageDetails({
                      ...packageDetails,
                      isFragile: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="fragile">Fragile Package</Label>
              </div>
            </div>
          )}

          {/* Step 2: Addresses */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Pickup Address</h3>
                <RadioGroup
                  value={selectedPickupAddress}
                  onValueChange={setSelectedPickupAddress}
                >
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={address.id} id={address.id} />
                      <Label htmlFor={address.id}>
                        {address.street}, {address.city}, {address.country}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Delivery Address</h3>
                <RadioGroup
                  value={selectedDeliveryAddress}
                  onValueChange={setSelectedDeliveryAddress}
                >
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={address.id} id={address.id} />
                      <Label htmlFor={address.id}>
                        {address.street}, {address.city}, {address.country}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                variant="outline"
                onClick={() => router.push("/settings/add-address")}
              >
                Add New Address
              </Button>
            </div>
          )}

          {/* Step 3: Receiver Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Enter receiver's full name"
                  value={receiver.name}
                  onChange={(e) =>
                    setReceiver({ ...receiver, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="Enter receiver's phone number"
                  value={receiver.phone}
                  onChange={(e) =>
                    setReceiver({ ...receiver, phone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="Enter receiver's email"
                  value={receiver.email}
                  onChange={(e) =>
                    setReceiver({ ...receiver, email: e.target.value })
                  }
                />
              </div>
            </div>
          )}

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
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isLoading}
        >
          Back
        </Button>
        <Button onClick={handleNext} disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : currentStep === 5 ? (
            "Create Shipment"
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </div>
  )
}
