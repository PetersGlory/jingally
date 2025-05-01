"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Truck, MapPin, Calendar, Clock, FileText, Download, Share2 } from "lucide-react"

export default function ShipmentDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("tracking")

  // Mock shipment data
  const shipment = {
    id: params.id,
    date: "Apr 28, 2025",
    origin: "New York, NY",
    originAddress: "123 Broadway, New York, NY 10001",
    originContact: "John Doe",
    originPhone: "(555) 123-4567",
    destination: "Los Angeles, CA",
    destinationAddress: "456 Hollywood Blvd, Los Angeles, CA 90028",
    destinationContact: "Jane Smith",
    destinationPhone: "(555) 987-6543",
    type: "Standard",
    status: "In Transit",
    statusColor: "bg-orange-500",
    estimatedDelivery: "May 5, 2025",
    weight: "5.2 kg",
    dimensions: "30 × 20 × 15 cm",
    service: "Standard (3-5 business days)",
    additionalServices: ["Shipping Insurance"],
    trackingUpdates: [
      {
        date: "Apr 30, 2025",
        time: "10:24 AM",
        location: "Chicago, IL",
        status: "In transit to next facility",
        description: "Package is in transit to the next facility",
      },
      {
        date: "Apr 29, 2025",
        time: "8:15 PM",
        location: "Columbus, OH",
        status: "Departed sorting facility",
        description: "Package has left the sorting facility",
      },
      {
        date: "Apr 29, 2025",
        time: "2:30 PM",
        location: "Columbus, OH",
        status: "Arrived at sorting facility",
        description: "Package has arrived at the sorting facility",
      },
      {
        date: "Apr 28, 2025",
        time: "9:45 AM",
        location: "New York, NY",
        status: "Shipment picked up",
        description: "Package has been picked up by carrier",
      },
    ],
    documents: [
      { name: "Shipping Label", type: "PDF" },
      { name: "Commercial Invoice", type: "PDF" },
      { name: "Proof of Pickup", type: "PDF" },
    ],
  }

  return (
    
        <main className="flex flex-col">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex items-center space-x-2">
                <Link href="/dashboard/shipments">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Shipments
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">Shipment {shipment.id}</CardTitle>
                  <Badge className={`${shipment.statusColor} text-white`}>{shipment.status}</Badge>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="tracking">Tracking</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tracking" className="space-y-4">
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-orange-500" />
                            <span className="font-medium">Current Status:</span>
                          </div>
                          <span>{shipment.trackingUpdates[0].status}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            <span className="font-medium">Estimated Delivery:</span>
                          </div>
                          <span>{shipment.estimatedDelivery}</span>
                        </div>

                        <div className="relative mt-8 pl-6">
                          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                          {shipment.trackingUpdates.map((update, index) => (
                            <div key={index} className="relative mb-8 last:mb-0">
                              <div
                                className={`absolute left-[-18px] top-0 h-4 w-4 rounded-full border-2 border-white ${
                                  index === 0 ? "bg-orange-500" : "bg-gray-300"
                                }`}
                              ></div>
                              <div className="mb-1 flex items-center justify-between">
                                <span className="font-medium">{update.status}</span>
                                <span className="text-sm text-muted-foreground">
                                  {update.date} • {update.time}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{update.location}</span>
                              </div>
                              <p className="mt-1 text-sm">{update.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="details" className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <h3 className="mb-2 font-medium">Sender</h3>
                            <div className="rounded-lg border p-3">
                              <p className="font-medium">{shipment.originContact}</p>
                              <p className="text-sm">{shipment.originAddress}</p>
                              <p className="text-sm">{shipment.originPhone}</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="mb-2 font-medium">Package Information</h3>
                            <div className="rounded-lg border p-3 text-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <span className="text-muted-foreground">Weight:</span>
                                <span>{shipment.weight}</span>
                                <span className="text-muted-foreground">Dimensions:</span>
                                <span>{shipment.dimensions}</span>
                                <span className="text-muted-foreground">Service:</span>
                                <span>{shipment.service}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h3 className="mb-2 font-medium">Recipient</h3>
                            <div className="rounded-lg border p-3">
                              <p className="font-medium">{shipment.destinationContact}</p>
                              <p className="text-sm">{shipment.destinationAddress}</p>
                              <p className="text-sm">{shipment.destinationPhone}</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="mb-2 font-medium">Additional Services</h3>
                            <div className="rounded-lg border p-3">
                              {shipment.additionalServices.length > 0 ? (
                                <ul className="list-inside list-disc text-sm">
                                  {shipment.additionalServices.map((service, index) => (
                                    <li key={index}>{service}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground">No additional services</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="documents" className="space-y-4">
                      <div className="space-y-4">
                        {shipment.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-orange-500" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.type} Document</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Shipment Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tracking Number:</span>
                        <span className="font-medium">{shipment.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ship Date:</span>
                        <span>{shipment.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Service Type:</span>
                        <span>{shipment.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Estimated Delivery:</span>
                        <span>{shipment.estimatedDelivery}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Route Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900 text-white">
                            <MapPin className="h-3 w-3" />
                          </div>
                          <span className="font-medium">Origin</span>
                        </div>
                        <p className="pl-8 text-sm">{shipment.origin}</p>
                      </div>

                      <div className="relative pl-3">
                        <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-orange-500" />
                          <span className="text-xs text-muted-foreground">In Transit</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">
                            <MapPin className="h-3 w-3" />
                          </div>
                          <span className="font-medium">Destination</span>
                        </div>
                        <p className="pl-8 text-sm">{shipment.destination}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Clock className="mr-2 h-4 w-4 text-orange-500" />
                        Modify Delivery
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Package className="mr-2 h-4 w-4 text-orange-500" />
                        Report an Issue
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4 text-orange-500" />
                        Request Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
  )
}
