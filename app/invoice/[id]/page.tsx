"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Printer, Mail, Package, MapPin, Calendar, Clock, DollarSign, User, Phone, Mail as MailIcon } from "lucide-react"
import { toast } from "sonner"
import { getInvoice } from "@/lib/api"

interface Address {
  id?: string
  city: string
  type: string
  unit?: string | null
  state: string
  street: string
  country: string
  postcode?: string | null
  zipCode?: string | null
  latitude: string | number
  longitude: string | number
  placeId?: string
  isVerified?: boolean
  verificationDetails?: any
}

interface Dimensions {
  width: number
  height: number
  length: number
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  jingallyId?: string
}

interface Container {
  id: string
  containerNumber: string
  type: string
  capacity: number
}

export interface Shipment {
  id: string
  userId: string
  status: string
  packageType: string | null
  serviceType: string | null
  packageDescription: string | null
  fragile: boolean | null
  priceGuides: string | Array<{
    id: string
    guideName: string
    price: number
    guideNumber: string
  }>
  weight: number | null
  dimensions: Dimensions | null
  pickupAddress: Address | string
  deliveryAddress: Address | string
  deliveryType: string | null
  scheduledPickupTime: string | null
  estimatedDeliveryTime: string | null
  trackingNumber: string
  receiverName: string | null
  receiverPhoneNumber: string | null
  receiverEmail: string | null
  price: string | null
  paymentStatus: string
  notes: string | null
  driverId: string | null
  images: string[]
  createdAt: string
  updatedAt: string
  user: User | null
  driver: User | null
  container: Container | null
  paymentMethod: string | null
  containerID?: string | null
}

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  customerInfo: {
    name: string
    email: string
    phone: string
    jingallyId: string
  }
  container: Container | null
  items: Array<{
    description: string
    quantity: number
    price: number
  }>
  subtotal: number
  tax: number
  total: number
}

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const shipmentId = params.id as string

  const fetchShipmentDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getInvoice(shipmentId)
     
      // Handle the nested data structure
      if (result.success && result.data) {
        // Parse JSON strings for addresses and price guides
        const shipmentData = {
          ...result.data,
          pickupAddress: typeof result.data.pickupAddress === 'string' 
            ? JSON.parse(result.data.pickupAddress) 
            : result.data.pickupAddress,
          deliveryAddress: typeof result.data.deliveryAddress === 'string' 
            ? JSON.parse(result.data.deliveryAddress) 
            : result.data.deliveryAddress,
          priceGuides: typeof result.data.priceGuides === 'string' 
            ? JSON.parse(result.data.priceGuides) 
            : result.data.priceGuides
        }
        setShipment(shipmentData)
      } else {
        setError('Invalid shipment data received')
      }
    } catch (err) {
      console.error('Error fetching shipment details:', err)
      setError('Failed to load shipment details')
      toast.error('Failed to load shipment details')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {

    if (shipmentId && shipmentId !== '#') {
      fetchShipmentDetails()
    } else {
      setError('Invalid shipment ID')
      setLoading(false)
    }
  }, [shipmentId])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Implementation for PDF download
    toast.info('PDF download feature coming soon')
  }

//   const handleEmail = () => {
//     // Implementation for emailing invoice
//     toast.info('Email feature coming soon')
//   }

  const generateInvoiceNumber = () => {
    return `INV-${Date.now().toString().slice(-6)}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: string | null) => {
    if (!amount) return '£0.00'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(parseFloat(amount))
  }

  const generateInvoiceData = (shipment: Shipment): InvoiceData => {
    let price = 0
    let items = []
    
    if (Array.isArray(shipment?.priceGuides) && shipment?.priceGuides.length > 0) {
      // Use price guides for detailed breakdown
      price = shipment.priceGuides.reduce((sum, guide) => sum + guide.price, 0)
      items = shipment.priceGuides.map(guide => ({
        description: guide.guideName,
        quantity: 1,
        price: guide.price,
      }))
    } else {
      // Fallback to shipment price
      price = parseFloat(shipment?.price || '0')
      items = [{
        description: `Shipment ${shipment?.trackingNumber}`,
        quantity: 1,
        price: price,
      }]
    }
    
    const tax = price * 0.2 // 20% VAT
    
    return {
      invoiceNumber: generateInvoiceNumber(),
      date: formatDate(shipment?.createdAt) || 'N/A',
      dueDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()) || 'N/A',
      customerInfo: {
        name: shipment?.receiverName || 'N/A',
        email: shipment?.receiverEmail || 'N/A',
        phone: shipment?.receiverPhoneNumber || 'N/A',
        jingallyId: shipment?.user?.jingallyId || 'N/A'
      },
      container: shipment?.container,
      items: items,
      subtotal: price,
      tax: tax,
      total: price + tax,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shipment Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested shipment could not be found.'}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          .invoice-container {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            margin-bottom: 20px !important;
          }
          .bg-blue-600 {
            background-color: #2563eb !important;
            color: white !important;
          }
          .bg-blue-50 {
            background-color: #eff6ff !important;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 invoice-container">
          {/* Header */}
          <div className="mb-8 no-print">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go To Home
            </Button>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
                <p className="text-gray-600 mt-1">
                  Shipment #{shipment?.trackingNumber} • {formatDate(shipment?.createdAt)}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="space-y-6">
            {/* Company & Invoice Info */}
            <Card className="invoice-card">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center mb-4">
                      <img
                        src="/logo.png"
                        alt="JINGALLY Logo"
                        className="h-8 w-8 mr-2"
                        style={{ objectFit: 'contain' }}
                      />
                      <h2 className="text-xl font-semibold text-blue-600">JINGALLY</h2>
                    </div>
                    <div className="space-y-2 text-gray-600">
                      <p>Office Address (UK): 1072 Tyburn Road, Birmingham B24 0SY</p>
                      <p>United Kingdom</p>
                      <p>Phone: +44 20 8090 9183</p>
                      <p>Email: info@jingally.com</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
                    <div className="space-y-2 text-gray-600">
                      <p><span className="font-medium">Invoice #:</span> {generateInvoiceNumber()}</p>
                      <p><span className="font-medium">Tracking #:</span> {shipment?.trackingNumber}</p>
                      <p><span className="font-medium">Date:</span> {formatDate(shipment?.createdAt)}</p>
                      <p><span className="font-medium">Due Date:</span> {formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())}</p>
                      <p><span className="font-medium">Status:</span> 
                        <Badge 
                          variant={shipment?.paymentStatus === 'paid' ? 'default' : 'secondary'}
                          className="ml-2 uppercase"
                        >
                          {shipment?.paymentStatus}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipment Details */}
            <Card className="invoice-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Shipment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Package Information</h4>
                    <div className="space-y-2 text-gray-600">
                      <p><span className="font-medium">Type:</span> {shipment?.packageType || 'Standard'}</p>
                      <p><span className="font-medium">Service:</span> {shipment?.serviceType || 'Standard'}</p>
                      <p><span className="font-medium">Weight:</span> {shipment?.weight || 'N/A'} kg</p>
                      {shipment?.dimensions && (
                        <p><span className="font-medium">Dimensions:</span> {shipment?.dimensions.length} × {shipment?.dimensions.width} × {shipment?.dimensions.height} cm</p>
                      )}
                      {shipment?.fragile && <p><span className="font-medium">Fragile:</span> Yes</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Timing</h4>
                    <div className="space-y-2 text-gray-600">
                      <p><span className="font-medium">Pickup:</span> {formatDate(shipment?.scheduledPickupTime)}</p>
                      <p><span className="font-medium">Estimated Delivery:</span> {formatDate(shipment?.estimatedDeliveryTime)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="invoice-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Pickup Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-gray-600">
                    {typeof shipment?.pickupAddress === 'string' ? (
                      <p>{shipment?.pickupAddress}</p>
                    ) : (
                      <>
                        <p>{shipment?.pickupAddress?.street}</p>
                        <p>{shipment?.pickupAddress?.city}, {shipment?.pickupAddress?.state}</p>
                        <p>{shipment?.pickupAddress?.country} {shipment?.pickupAddress?.postcode || shipment?.pickupAddress?.zipCode}</p>
                        <p className="text-sm text-gray-500 capitalize">Type: {shipment?.pickupAddress?.type}</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="invoice-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-gray-600">
                    {typeof shipment?.deliveryAddress === 'string' ? (
                      <p>{shipment?.deliveryAddress}</p>
                    ) : (
                      <>
                        <p>{shipment?.deliveryAddress?.street}</p>
                        <p>{shipment?.deliveryAddress?.city}, {shipment?.deliveryAddress?.state}</p>
                        <p>{shipment?.deliveryAddress?.country} {shipment?.deliveryAddress?.postcode || shipment?.deliveryAddress?.zipCode}</p>
                        <p className="text-sm text-gray-500 capitalize">Type: {shipment?.deliveryAddress?.type}</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer & Container Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="invoice-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Bill To
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{shipment?.receiverName || 'N/A'}</p>
                    <p className="text-gray-600">{shipment?.receiverEmail || 'N/A'}</p>
                    <p className="text-gray-600">{shipment?.receiverPhoneNumber || 'N/A'}</p>
                    {shipment?.user?.jingallyId && (
                      <p className="text-sm text-gray-500">Jingally ID: {shipment?.user.jingallyId}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="invoice-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Container Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {shipment?.container ? (
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Container Number:</span> {shipment?.container.containerNumber}
                        {shipment?.user?.jingallyId && ` / ${shipment?.user.jingallyId}`}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Type:</span> {shipment?.container.type}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Capacity:</span> {shipment?.container.capacity} tons
                      </p>
                    </div>
                  ) : (
                    <p className="text-red-500">No container assigned</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Price Guides Information */}
            {Array.isArray(shipment?.priceGuides) && shipment?.priceGuides.length > 0 && (
              <Card className="invoice-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Price Guide Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {shipment.priceGuides.map((guide, index) => (
                      <div key={guide.id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{guide.guideName}</p>
                          <p className="text-sm text-gray-500">Guide: {guide.guideNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{formatCurrency(guide.price.toString())}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing */}
            <Card className="invoice-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Pricing & Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Line Items */}
                  {Array.isArray(shipment?.priceGuides) && shipment?.priceGuides.length > 0 ? (
                    shipment.priceGuides.map((guide, index) => (
                      <div key={guide.id || index} className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center py-2">
                          <div>
                            <span className="text-gray-900 font-medium">{guide.guideName}</span>
                            <span className="text-gray-500 text-sm ml-2">Qty: 1</span>
                          </div>
                          <span className="font-medium">{formatCurrency(guide.price.toString())}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <span className="text-gray-900 font-medium">Shipment {shipment?.trackingNumber}</span>
                          <span className="text-sm text-gray-500 ml-2">Qty: 1</span>
                        </div>
                        <span className="font-medium">{formatCurrency(shipment?.price)}</span>
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      {Array.isArray(shipment?.priceGuides) && shipment?.priceGuides.length > 0 
                        ? formatCurrency(shipment.priceGuides.reduce((sum, guide) => sum + guide.price, 0).toString())
                        : formatCurrency(shipment?.price)
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Tax (20% VAT)</span>
                    <span className="font-medium">
                      {Array.isArray(shipment?.priceGuides) && shipment?.priceGuides.length > 0 
                        ? formatCurrency((shipment.priceGuides.reduce((sum, guide) => sum + guide.price, 0) * 0.2).toString())
                        : formatCurrency(shipment?.price ? (parseFloat(shipment?.price) * 0.2).toString() : null)
                      }
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center py-2 bg-blue-600 text-white p-3 rounded-lg">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-semibold text-lg">
                      {Array.isArray(shipment?.priceGuides) && shipment?.priceGuides.length > 0 
                        ? formatCurrency((shipment.priceGuides.reduce((sum, guide) => sum + guide.price, 0) * 1.2).toString())
                        : formatCurrency(shipment?.price ? (parseFloat(shipment?.price) * 1.2).toString() : null)
                      }
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium capitalize">{shipment?.paymentMethod || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Payment Status</span>
                    <Badge 
                      variant={shipment?.paymentStatus === 'paid' ? 'default' : 'secondary'}
                    >
                      {shipment?.paymentStatus}
                    </Badge>
                  </div>
                  
                  {shipment?.notes && (
                    <>
                      <Separator />
                      <div className="py-2">
                        <span className="text-gray-600">Notes:</span>
                        <p className="text-gray-900 mt-1">{shipment?.notes}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-gray-500 text-sm py-8">
              <p>Thank you for choosing JINGALLY</p>
              <p>For questions about this invoice, please contact info@jingally.com</p>
              <p className="mt-2 text-xs">This is a computer-generated invoice, no signature required.</p>
              <p className="text-xs">Terms & Conditions: Payment is due within 30 days.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 