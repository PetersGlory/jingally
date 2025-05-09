"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Search, Package, CheckCircle, Truck, Clock, AlertCircle } from "lucide-react"
import { trackingShipment } from "@/lib/shipment"
import { toast } from "sonner"

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [trackingResult, setTrackingResult] = useState<null | {
    id: string
    status: "delivered" | "in_transit" | "processing" | "exception" | "picked_up" | "pending"
    origin: string
    destination: string
    estimatedDelivery: string
    updates: Array<{
      date: string
      time: string
      location: string
      status: string
    }>
  }>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingNumber) {
      try {
        setIsSearching(true)
        const token = localStorage.getItem('accessToken')
        if (!token) {
          toast.error('Please log in to track shipments')
          return
        }

        const response = await trackingShipment(trackingNumber, JSON.parse(token))
        if (response.success) {
          const shipment = response.data
          
          // Create updates array based on shipment status
          const updates = []
          
          // Add current status update
          updates.push({
            date: new Date(shipment.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            time: new Date(shipment.updatedAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            location: shipment.status === 'delivered' ? shipment.deliveryAddress.city : 
                     shipment.status === 'in_transit' ? 'In Transit' :
                     shipment.status === 'picked_up' ? shipment.pickupAddress.city :
                     'Processing',
            status: shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)
          })

          // Add pickup update if status is picked_up or further
          if (['picked_up', 'in_transit', 'delivered'].includes(shipment.status)) {
            updates.push({
              date: new Date(shipment.scheduledPickupTime).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              time: new Date(shipment.scheduledPickupTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              location: shipment.pickupAddress.city,
              status: 'Package picked up'
            })
          }

          // Add delivery update if status is delivered
          if (shipment.status === 'delivered') {
            updates.push({
              date: new Date(shipment.estimatedDeliveryTime).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              time: new Date(shipment.estimatedDeliveryTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              location: shipment.deliveryAddress.city,
              status: 'Package delivered'
            })
          }

          setTrackingResult({
            id: shipment.trackingNumber,
            status: shipment.status,
            origin: `${shipment.pickupAddress.city}, ${shipment.pickupAddress.country}`,
            destination: `${shipment.deliveryAddress.city}, ${shipment.deliveryAddress.country}`,
            estimatedDelivery: new Date(shipment.estimatedDeliveryTime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            updates: updates
          })
        } else {
          toast.error(response.message || 'Failed to fetch tracking information')
        }
      } catch (error: any) {
        toast.error(error.message || 'An error occurred while tracking the shipment')
      } finally {
        setIsSearching(false)
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case "in_transit":
        return <Truck className="h-8 w-8 text-orange-500" />
      case "picked_up":
        return <Truck className="h-8 w-8 text-blue-500" />
      case "pending":
        return <Clock className="h-8 w-8 text-blue-500" />
      case "exception":
        return <AlertCircle className="h-8 w-8 text-red-500" />
      default:
        return <Package className="h-8 w-8 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered"
      case "in_transit":
        return "In Transit"
      case "picked_up":
        return "Picked Up"
      case "pending":
        return "Processing"
      case "exception":
        return "Exception"
      default:
        return "Unknown"
    }
  }

  return (
    <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-400">
                Track Your Shipment
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Enter your tracking number to get real-time updates on your shipment
              </p>
            </div>
            <div className="w-full max-w-md space-y-4">
              <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                <Input
                  type="text"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button 
                  type="submit" 
                  disabled={isSearching}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSearching ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Tracking
                    </div>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" /> Track
                    </>
                  )}
                </Button>
              </form>
            </div>

            {trackingResult ? (
              <div className="w-full max-w-4xl">
                <Card className="border-none shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-full shadow-sm">
                          {getStatusIcon(trackingResult.status)}
                        </div>
                        <div>
                          <CardTitle className="text-2xl">Tracking Number: {trackingResult.id}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Status: {getStatusText(trackingResult.status)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <p className="text-sm font-medium text-muted-foreground">Estimated Delivery</p>
                        <p className="text-xl font-bold text-orange-600">{trackingResult.estimatedDelivery}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-1">From</p>
                        <p className="text-lg font-semibold">{trackingResult.origin}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-1">To</p>
                        <p className="text-lg font-semibold">{trackingResult.destination}</p>
                      </div>
                    </div>

                    <h3 className="mb-6 text-xl font-bold text-gray-900">Shipment Progress</h3>
                    <div className="space-y-6">
                      {trackingResult.updates.map((update, index) => (
                        <div 
                          key={index} 
                          className="flex items-start space-x-4 border-l-2 border-orange-500 pl-4 relative"
                        >
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500 border-2 border-white" />
                          <div className="min-w-[120px]">
                            <p className="text-sm font-medium text-gray-900">{update.date}</p>
                            <p className="text-xs text-muted-foreground">{update.time}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{update.status}</p>
                            <p className="text-xs text-muted-foreground">{update.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="w-full max-w-md border-none shadow-lg">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="p-4 bg-orange-50 rounded-full">
                      <Package className="h-12 w-12 text-orange-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">No Tracking Information</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter a valid tracking number to see shipment details and status updates
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
