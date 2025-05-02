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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingNumber) {
      setIsSearching(true)
      // Simulate API call
      setTimeout(() => {
        setIsSearching(false)
        // Mock data
        setTrackingResult({
          id: trackingNumber,
          status: "in_transit",
          origin: "New York, NY",
          destination: "Los Angeles, CA",
          estimatedDelivery: "May 5, 2025",
          updates: [
            {
              date: "Apr 30, 2025",
              time: "10:24 AM",
              location: "Chicago, IL",
              status: "In transit to next facility",
            },
            {
              date: "Apr 29, 2025",
              time: "8:15 PM",
              location: "Columbus, OH",
              status: "Departed sorting facility",
            },
            {
              date: "Apr 29, 2025",
              time: "2:30 PM",
              location: "Columbus, OH",
              status: "Arrived at sorting facility",
            },
            {
              date: "Apr 28, 2025",
              time: "9:45 AM",
              location: "New York, NY",
              status: "Shipment picked up",
            },
          ],
        })
      }, 1500)
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
  )
}
