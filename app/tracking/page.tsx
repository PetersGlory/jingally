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
    status: "delivered" | "in_transit" | "processing" | "exception"
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
          updates: [
            {
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
              }
            ]
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
      case "processing":
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
      case "processing":
        return "Processing"
      case "exception":
        return "Exception"
      default:
        return "Unknown"
    }
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
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Track Your Shipment</h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Enter your tracking number to get real-time updates on your shipment
                </p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isSearching}>
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
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(trackingResult.status)}
                          <div>
                            <CardTitle>Tracking Number: {trackingResult.id}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Status: {getStatusText(trackingResult.status)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                          <p className="text-sm font-medium">Estimated Delivery</p>
                          <p className="text-lg font-bold">{trackingResult.estimatedDelivery}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium">From</p>
                          <p className="text-lg">{trackingResult.origin}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">To</p>
                          <p className="text-lg">{trackingResult.destination}</p>
                        </div>
                      </div>

                      <h3 className="mb-4 text-lg font-bold">Shipment Progress</h3>
                      <div className="space-y-4">
                        {trackingResult.updates.map((update, index) => (
                          <div key={index} className="flex items-start space-x-4 border-l-2 border-orange-500 pl-4">
                            <div className="min-w-[120px]">
                              <p className="text-sm font-medium">{update.date}</p>
                              <p className="text-xs text-muted-foreground">{update.time}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{update.status}</p>
                              <p className="text-xs text-muted-foreground">{update.location}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="w-full max-w-md">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold">No Tracking Information</h3>
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
      <Footer />
    </div>
  )
}
