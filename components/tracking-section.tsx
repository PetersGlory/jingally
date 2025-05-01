"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Package } from "lucide-react"

export function TrackingSection() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingNumber) {
      setIsSearching(true)
      // Simulate API call
      setTimeout(() => {
        setIsSearching(false)
      }, 1500)
    }
  }

  return (
    <section className="py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Track Your Shipment</h2>
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
        </div>
      </div>
    </section>
  )
}
