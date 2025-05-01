"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Truck, Plane, Ship, Camera, Calendar, Clock, AlertCircle, Calculator } from "lucide-react"

export default function ShippingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [activeTab, setActiveTab] = useState("calculator")

  // Shipping calculator state
  const [calculationType, setCalculationType] = useState("air")
  const [length, setLength] = useState("")
  const [width, setWidth] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [isFrozenFood, setIsFrozenFood] = useState(false)
  const [calculationResult, setCalculationResult] = useState<{
    volumetricWeight?: number
    actualWeight?: number
    chargeableWeight?: number
    totalCost?: number
    costPerKg?: number
    currency?: string
    weightLimit?: boolean
  } | null>(null)

  // Calculate shipping cost
  const calculateShipping = () => {
    if (!length || !width || !height || !weight) {
      return
    }

    const l = Number.parseFloat(length)
    const w = Number.parseFloat(width)
    const h = Number.parseFloat(height)
    const actualWeight = Number.parseFloat(weight)

    // Check weight limit
    const weightLimit = actualWeight > 40

    if (calculationType === "air") {
      // Air freight calculation
      const volumetricWeight = (l * w * h) / 6000
      const chargeableWeight = Math.max(volumetricWeight, actualWeight)

      let costPerKg = 0
      const currency = "D"

      if (isFrozenFood) {
        costPerKg = 1100
      } else if (chargeableWeight <= 50) {
        costPerKg = 650
      } else if (chargeableWeight <= 100) {
        costPerKg = 550
      } else {
        costPerKg = 500
      }

      const totalCost = chargeableWeight * costPerKg

      setCalculationResult({
        volumetricWeight,
        actualWeight,
        chargeableWeight,
        totalCost,
        costPerKg,
        currency,
        weightLimit,
      })
    } else {
      // Sea freight calculation
      const volumeCost = l * w * h * 300
      const currency = "£"

      setCalculationResult({
        volumetricWeight: (l * w * h) / 6000,
        actualWeight,
        chargeableWeight: (l * w * h) / 6000,
        totalCost: volumeCost,
        costPerKg: 300,
        currency,
        weightLimit,
      })
    }
  }

  // Reset calculation
  const resetCalculation = () => {
    setLength("")
    setWidth("")
    setHeight("")
    setWeight("")
    setIsFrozenFood(false)
    setCalculationResult(null)
  }

  // Shipping flow navigation
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
          <MobileNav />
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hidden md:flex">
              Log in
            </Button>
            <Button size="sm" className="hidden md:flex">
              Sign up
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ship with Jingally Logistics
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Fast, reliable shipping solutions for your business and personal needs
                </p>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-3xl">
              <Tabs defaultValue="calculator" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="calculator">Shipping Calculator</TabsTrigger>
                  <TabsTrigger value="shipping">Create Shipment</TabsTrigger>
                </TabsList>

                <TabsContent value="calculator" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Cost Calculator</CardTitle>
                      <CardDescription>Calculate shipping costs for air and sea freight</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Freight Type</Label>
                          <RadioGroup
                            defaultValue="air"
                            value={calculationType}
                            onValueChange={setCalculationType}
                            className="flex flex-col space-y-1 sm:flex-row sm:space-x-4 sm:space-y-0"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="air" id="air" />
                              <Label htmlFor="air" className="flex items-center">
                                <Plane className="mr-2 h-4 w-4" /> Air Freight
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sea" id="sea" />
                              <Label htmlFor="sea" className="flex items-center">
                                <Ship className="mr-2 h-4 w-4" /> Sea Freight
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="length">Length (cm)</Label>
                            <Input
                              id="length"
                              type="number"
                              placeholder="Length"
                              min="1"
                              value={length}
                              onChange={(e) => setLength(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="width">Width (cm)</Label>
                            <Input
                              id="width"
                              type="number"
                              placeholder="Width"
                              min="1"
                              value={width}
                              onChange={(e) => setWidth(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input
                              id="height"
                              type="number"
                              placeholder="Height"
                              min="1"
                              value={height}
                              onChange={(e) => setHeight(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              placeholder="Weight"
                              min="0.1"
                              step="0.1"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                            />
                          </div>
                        </div>

                        {calculationType === "air" && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="frozen"
                              checked={isFrozenFood}
                              onCheckedChange={(checked) => setIsFrozenFood(checked === true)}
                            />
                            <Label htmlFor="frozen">Frozen Food</Label>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button onClick={calculateShipping} className="bg-orange-500 hover:bg-orange-600">
                            <Calculator className="mr-2 h-4 w-4" /> Calculate
                          </Button>
                          <Button variant="outline" onClick={resetCalculation}>
                            Reset
                          </Button>
                        </div>

                        {calculationResult && (
                          <div className="mt-4 space-y-4">
                            {calculationResult.weightLimit && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Weight Limit Exceeded</AlertTitle>
                                <AlertDescription>
                                  Maximum weight per item is 40kg. Please reduce the weight or split into multiple
                                  shipments.
                                </AlertDescription>
                              </Alert>
                            )}

                            <Card>
                              <CardHeader>
                                <CardTitle>Calculation Result</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="text-sm font-medium">Dimensions:</div>
                                    <div>
                                      {length} × {width} × {height} cm
                                    </div>

                                    <div className="text-sm font-medium">Actual Weight:</div>
                                    <div>{calculationResult.actualWeight} kg</div>

                                    <div className="text-sm font-medium">Volumetric Weight:</div>
                                    <div>{calculationResult.volumetricWeight?.toFixed(2)} kg</div>

                                    <div className="text-sm font-medium">Chargeable Weight:</div>
                                    <div>{calculationResult.chargeableWeight?.toFixed(2)} kg</div>

                                    {calculationType === "air" && (
                                      <>
                                        <div className="text-sm font-medium">Rate:</div>
                                        <div>
                                          {calculationResult.currency}
                                          {formatNumber(calculationResult.costPerKg || 0)} per kg
                                        </div>
                                      </>
                                    )}

                                    <div className="text-sm font-medium border-t pt-2 text-lg">Total Cost:</div>
                                    <div className="border-t pt-2 text-lg font-bold text-orange-600">
                                      {calculationResult.currency}
                                      {formatNumber(calculationResult.totalCost || 0)}
                                    </div>
                                  </div>

                                  <div className="mt-4 text-sm text-muted-foreground">
                                    {calculationType === "air" ? (
                                      <p>
                                        Air freight is calculated based on the greater of actual weight or volumetric
                                        weight. Volumetric weight is calculated as (Length × Width × Height) ÷ 6000.
                                      </p>
                                    ) : (
                                      <p>
                                        Sea freight is calculated based on volume: Height × Length × Width × £300.
                                        Weight must be indicated as there are weight limitations per item.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Jingally Logistics Shipping Rates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Air Freight Rates (UK to Gambia)</h3>
                          <div className="rounded-md border">
                            <div className="grid grid-cols-2 p-3 border-b bg-muted/50">
                              <div className="font-medium">Weight Range</div>
                              <div className="font-medium">Rate</div>
                            </div>
                            <div className="grid grid-cols-2 p-3 border-b">
                              <div>1 to 50 kg</div>
                              <div>D650 per kg</div>
                            </div>
                            <div className="grid grid-cols-2 p-3 border-b">
                              <div>51 to 100 kg</div>
                              <div>D550 per kg</div>
                            </div>
                            <div className="grid grid-cols-2 p-3 border-b">
                              <div>101 kg and above</div>
                              <div>D500 per kg</div>
                            </div>
                            <div className="grid grid-cols-2 p-3">
                              <div>Frozen Foods</div>
                              <div>D1100 per kg</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">Sea Freight Rates</h3>
                          <div className="rounded-md border">
                            <div className="grid grid-cols-2 p-3 border-b bg-muted/50">
                              <div className="font-medium">Calculation</div>
                              <div className="font-medium">Rate</div>
                            </div>
                            <div className="grid grid-cols-2 p-3">
                              <div>Volume (Height × Length × Width in cm)</div>
                              <div>£300 per cubic unit</div>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium">Important Notes:</p>
                          <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Maximum weight per item is 40 kg</li>
                            <li>
                              For air freight, we charge based on whichever is greater: actual weight or volumetric
                              weight
                            </li>
                            <li>For sea freight, we charge based on volume, but weight must be indicated</li>
                            <li>Special rates apply for Khan Shipping (discount prices, no delivery)</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="shipping" className="space-y-4 mt-4">
                  <div className="mb-8">
                    <div className="flex justify-between">
                      {Array.from({ length: totalSteps }).map((_, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                              currentStep > index + 1
                                ? "border-orange-500 bg-orange-500 text-white"
                                : currentStep === index + 1
                                  ? "border-orange-500 text-orange-500"
                                  : "border-gray-300 text-gray-300"
                            }`}
                          >
                            {currentStep > index + 1 ? "✓" : index + 1}
                          </div>
                          <span
                            className={`mt-2 text-xs ${currentStep >= index + 1 ? "text-orange-500" : "text-gray-400"}`}
                          >
                            {index === 0
                              ? "Package Details"
                              : index === 1
                                ? "Addresses"
                                : index === 2
                                  ? "Shipping Method"
                                  : index === 3
                                    ? "Schedule"
                                    : "Review"}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="relative mt-4">
                      <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-200"></div>
                      <div
                        className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-orange-500 transition-all duration-300"
                        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>
                        {currentStep === 1
                          ? "Package Details"
                          : currentStep === 2
                            ? "Pickup & Delivery Addresses"
                            : currentStep === 3
                              ? "Shipping Method"
                              : currentStep === 4
                                ? "Schedule Pickup"
                                : "Review & Confirm"}
                      </CardTitle>
                      <CardDescription>
                        {currentStep === 1
                          ? "Provide details about your package"
                          : currentStep === 2
                            ? "Enter pickup and delivery addresses"
                            : currentStep === 3
                              ? "Choose your preferred shipping method"
                              : currentStep === 4
                                ? "Select a convenient pickup time"
                                : "Review your shipping details before confirming"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {currentStep === 1 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="packageType">Package Type</Label>
                              <Select defaultValue="parcel">
                                <SelectTrigger id="packageType">
                                  <SelectValue placeholder="Select package type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="parcel">Parcel</SelectItem>
                                  <SelectItem value="document">Document</SelectItem>
                                  <SelectItem value="pallet">Pallet</SelectItem>
                                  <SelectItem value="fragile">Fragile</SelectItem>
                                  <SelectItem value="heavy">Heavy</SelectItem>
                                  <SelectItem value="frozen">Frozen Food</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="weight">Weight (kg)</Label>
                              <Input id="weight" type="number" placeholder="Enter weight" min="0.1" step="0.1" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label htmlFor="length">Length (cm)</Label>
                              <Input id="length" type="number" placeholder="Length" min="1" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="width">Width (cm)</Label>
                              <Input id="width" type="number" placeholder="Width" min="1" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="height">Height (cm)</Label>
                              <Input id="height" type="number" placeholder="Height" min="1" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contents">Package Contents</Label>
                            <Textarea id="contents" placeholder="Describe the contents of your package" />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="value">Declared Value ($)</Label>
                            <Input id="value" type="number" placeholder="Enter value" min="1" />
                          </div>

                          <div className="space-y-2">
                            <Label>Add Photos (Optional)</Label>
                            <div className="flex flex-wrap gap-4">
                              <Button variant="outline" className="h-24 w-24 flex-col gap-1">
                                <Camera className="h-6 w-6" />
                                <span className="text-xs">Add Photo</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Pickup Address</h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="pickupName">Full Name</Label>
                                <Input id="pickupName" placeholder="Enter full name" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="pickupPhone">Phone Number</Label>
                                <Input id="pickupPhone" placeholder="Enter phone number" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="pickupAddress">Address</Label>
                              <Input id="pickupAddress" placeholder="Enter street address" />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label htmlFor="pickupCity">City</Label>
                                <Input id="pickupCity" placeholder="City" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="pickupState">State/Province</Label>
                                <Input id="pickupState" placeholder="State/Province" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="pickupZip">Postal Code</Label>
                                <Input id="pickupZip" placeholder="Postal Code" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="pickupCountry">Country</Label>
                              <Select defaultValue="uk">
                                <SelectTrigger id="pickupCountry">
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="uk">United Kingdom</SelectItem>
                                  <SelectItem value="gm">Gambia</SelectItem>
                                  <SelectItem value="us">United States</SelectItem>
                                  <SelectItem value="ca">Canada</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Delivery Address</h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="deliveryName">Full Name</Label>
                                <Input id="deliveryName" placeholder="Enter full name" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="deliveryPhone">Phone Number</Label>
                                <Input id="deliveryPhone" placeholder="Enter phone number" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="deliveryAddress">Address</Label>
                              <Input id="deliveryAddress" placeholder="Enter street address" />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label htmlFor="deliveryCity">City</Label>
                                <Input id="deliveryCity" placeholder="City" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="deliveryState">State/Province</Label>
                                <Input id="deliveryState" placeholder="State/Province" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="deliveryZip">Postal Code</Label>
                                <Input id="deliveryZip" placeholder="Postal Code" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="deliveryCountry">Country</Label>
                              <Select defaultValue="gm">
                                <SelectTrigger id="deliveryCountry">
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="uk">United Kingdom</SelectItem>
                                  <SelectItem value="gm">Gambia</SelectItem>
                                  <SelectItem value="us">United States</SelectItem>
                                  <SelectItem value="ca">Canada</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <Label>Shipping Method</Label>
                            <RadioGroup defaultValue="air">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-muted [&:has(:checked)]:bg-orange-50 [&:has(:checked)]:border-orange-500">
                                  <RadioGroupItem value="air" id="air-freight" className="sr-only" />
                                  <Label htmlFor="air-freight" className="cursor-pointer text-center">
                                    <Plane className="mx-auto mb-2 h-8 w-8 text-orange-500" />
                                    <div className="font-medium">Air Freight</div>
                                    <div className="text-xs text-muted-foreground">Faster delivery time</div>
                                    <div className="mt-2 font-bold">From D500 per kg</div>
                                  </Label>
                                </div>
                                <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-muted [&:has(:checked)]:bg-orange-50 [&:has(:checked)]:border-orange-500">
                                  <RadioGroupItem value="sea" id="sea-freight" className="sr-only" />
                                  <Label htmlFor="sea-freight" className="cursor-pointer text-center">
                                    <Ship className="mx-auto mb-2 h-8 w-8 text-blue-900" />
                                    <div className="font-medium">Sea Freight</div>
                                    <div className="text-xs text-muted-foreground">More economical for large items</div>
                                    <div className="mt-2 font-bold">Volume-based pricing</div>
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="space-y-4">
                            <Label>Package Type</Label>
                            <RadioGroup defaultValue="standard">
                              <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-muted [&:has(:checked)]:bg-orange-50 [&:has(:checked)]:border-orange-500">
                                  <RadioGroupItem value="standard" id="standard" className="sr-only" />
                                  <Label htmlFor="standard" className="cursor-pointer text-center">
                                    <Truck className="mx-auto mb-2 h-8 w-8 text-orange-500" />
                                    <div className="font-medium">Standard</div>
                                    <div className="text-xs text-muted-foreground">Regular packages</div>
                                    <div className="mt-2 font-bold">D650 per kg</div>
                                  </Label>
                                </div>
                                <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-muted [&:has(:checked)]:bg-orange-50 [&:has(:checked)]:border-orange-500">
                                  <RadioGroupItem value="frozen" id="frozen" className="sr-only" />
                                  <Label htmlFor="frozen" className="cursor-pointer text-center">
                                    <Plane className="mx-auto mb-2 h-8 w-8 text-blue-900" />
                                    <div className="font-medium">Frozen Food</div>
                                    <div className="text-xs text-muted-foreground">Temperature controlled</div>
                                    <div className="mt-2 font-bold">D1100 per kg</div>
                                  </Label>
                                </div>
                                <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-muted [&:has(:checked)]:bg-orange-50 [&:has(:checked)]:border-orange-500">
                                  <RadioGroupItem value="bulk" id="bulk" className="sr-only" />
                                  <Label htmlFor="bulk" className="cursor-pointer text-center">
                                    <Clock className="mx-auto mb-2 h-8 w-8 text-blue-900" />
                                    <div className="font-medium">Bulk Shipping</div>
                                    <div className="text-xs text-muted-foreground">For large quantities</div>
                                    <div className="mt-2 font-bold">D500 per kg</div>
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="space-y-4">
                            <Label>Additional Services</Label>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="flex items-start space-x-3 rounded-lg border p-4">
                                <input type="checkbox" id="insurance" className="mt-1" />
                                <div>
                                  <Label htmlFor="insurance" className="cursor-pointer">
                                    <div className="font-medium">Shipping Insurance</div>
                                    <div className="text-xs text-muted-foreground">
                                      Protect your package up to $1000
                                    </div>
                                    <div className="mt-1 text-sm font-bold">D200</div>
                                  </Label>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3 rounded-lg border p-4">
                                <input type="checkbox" id="signature" className="mt-1" />
                                <div>
                                  <Label htmlFor="signature" className="cursor-pointer">
                                    <div className="font-medium">Signature Required</div>
                                    <div className="text-xs text-muted-foreground">Ensure secure delivery</div>
                                    <div className="mt-1 text-sm font-bold">D100</div>
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <Label>Pickup Date</Label>
                            <div className="grid gap-4 md:grid-cols-3">
                              {["May 1, 2025", "May 2, 2025", "May 3, 2025"].map((date, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-muted [&:has(:checked)]:bg-orange-50 [&:has(:checked)]:border-orange-500"
                                >
                                  <input
                                    type="radio"
                                    name="pickupDate"
                                    id={`date-${index}`}
                                    className="sr-only"
                                    defaultChecked={index === 0}
                                  />
                                  <Label htmlFor={`date-${index}`} className="cursor-pointer text-center">
                                    <Calendar className="mx-auto mb-2 h-6 w-6 text-orange-500" />
                                    <div className="font-medium">{date}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {index === 0 ? "Tomorrow" : index === 1 ? "Friday" : "Saturday"}
                                    </div>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Label>Pickup Time</Label>
                            <div className="grid gap-4 md:grid-cols-3">
                              {["9:00 AM - 12:00 PM", "12:00 PM - 3:00 PM", "3:00 PM - 6:00 PM"].map((time, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-muted [&:has(:checked)]:bg-orange-50 [&:has(:checked)]:border-orange-500"
                                >
                                  <input
                                    type="radio"
                                    name="pickupTime"
                                    id={`time-${index}`}
                                    className="sr-only"
                                    defaultChecked={index === 0}
                                  />
                                  <Label htmlFor={`time-${index}`} className="cursor-pointer text-center">
                                    <Clock className="mx-auto mb-2 h-6 w-6 text-orange-500" />
                                    <div className="font-medium">{time}</div>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                            <Textarea id="instructions" placeholder="Add any special instructions for pickup" />
                          </div>
                        </div>
                      )}

                      {currentStep === 5 && (
                        <div className="space-y-6">
                          <div className="rounded-lg border p-4">
                            <h3 className="mb-2 font-medium">Package Details</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Package Type:</div>
                              <div>Parcel</div>
                              <div className="text-muted-foreground">Weight:</div>
                              <div>2.5 kg</div>
                              <div className="text-muted-foreground">Dimensions:</div>
                              <div>30 × 20 × 15 cm</div>
                              <div className="text-muted-foreground">Volumetric Weight:</div>
                              <div>1.5 kg</div>
                              <div className="text-muted-foreground">Chargeable Weight:</div>
                              <div>2.5 kg</div>
                            </div>
                          </div>

                          <div className="rounded-lg border p-4">
                            <h3 className="mb-2 font-medium">Addresses</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <div className="mb-1 text-sm font-medium">Pickup</div>
                                <div className="text-sm">
                                  John Doe
                                  <br />
                                  123 Main St
                                  <br />
                                  London, UK
                                  <br />
                                  (555) 123-4567
                                </div>
                              </div>
                              <div>
                                <div className="mb-1 text-sm font-medium">Delivery</div>
                                <div className="text-sm">
                                  Jane Smith
                                  <br />
                                  456 Market St
                                  <br />
                                  Banjul, Gambia
                                  <br />
                                  (555) 987-6543
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-lg border p-4">
                            <h3 className="mb-2 font-medium">Shipping Method</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Service:</div>
                              <div>Air Freight</div>
                              <div className="text-muted-foreground">Package Type:</div>
                              <div>Standard</div>
                              <div className="text-muted-foreground">Additional Services:</div>
                              <div>Shipping Insurance</div>
                            </div>
                          </div>

                          <div className="rounded-lg border p-4">
                            <h3 className="mb-2 font-medium">Pickup Schedule</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Date:</div>
                              <div>May 1, 2025 (Tomorrow)</div>
                              <div className="text-muted-foreground">Time:</div>
                              <div>9:00 AM - 12:00 PM</div>
                            </div>
                          </div>

                          <div className="rounded-lg border p-4">
                            <h3 className="mb-2 font-medium">Price Summary</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping (2.5 kg × D650):</span>
                                <span>D1,625</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Insurance:</span>
                                <span>D200</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax:</span>
                                <span>D182.50</span>
                              </div>
                              <div className="flex justify-between border-t pt-1 font-medium">
                                <span>Total:</span>
                                <span>D2,007.50</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                        Back
                      </Button>
                      <Button
                        onClick={currentStep === totalSteps ? () => alert("Shipping order submitted!") : nextStep}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {currentStep === totalSteps ? "Confirm & Pay" : "Continue"}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
