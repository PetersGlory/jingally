"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Package, Truck, MapPin, Calendar, Clock, FileText, Download, AlertCircle, X, Phone, Mail, HelpCircle, Check, Share2, PenBoxIcon } from "lucide-react"
import { getShipmentDetails, cancelShipment } from "@/lib/shipment"
import PackagePayment from "@/components/package/PackagePayment"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Shipment {
  id: string;
  userId: string;
  trackingNumber: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  packageType: string | null;
  serviceType: string | null;
  packageDescription: string | null;
  priceGuides:string;
  fragile: boolean | null;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
    latitude: number;
    longitude: number;
    placeId: string;
    type: 'residential' | 'business';
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
    latitude: number;
    longitude: number;
    placeId: string;
    type: 'residential' | 'business';
  };
  scheduledPickupTime: string;
  estimatedDeliveryTime: string;
  receiverName: string;
  receiverPhoneNumber: string;
  receiverEmail: string;
  paymentMethod: string;
  price: string | null;
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes: string | null;
  driverId: string | null;
  containerID: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  driver: {
    id: string;
    name: string;
    phone: string;
    email: string;
  } | null;
  container?: {
    containerNumber: string;
    type: string;
    capacity: number;
    location: string;
    status: string;
  } | null;
}

interface TrackingEvent {
  id: string;
  title: string;
  time: string;
  status: 'completed' | 'in-progress' | 'pending';
  hasCheck?: boolean;
  hasImage?: boolean;
  image?: any;
  description?: string;
  hasButton?: boolean;
  buttonText?: string;
  hasNotification?: boolean;
}

export default function ShipmentDetailPage() {
  const router = useRouter()
  const {id} = useParams();
  const [activeTab, setActiveTab] = useState("tracking")
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [paymentModal, setPaymentModal] = useState(false)
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const fetchShipmentDetails = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.replace('/')
        return
      }

      const response = await getShipmentDetails(id as string, JSON.parse(token))
      if (response.success) {
        // Parse the JSON strings in the response data
        const parsedData = {
          ...response.data,
          dimensions: JSON.parse(response.data.dimensions),
          pickupAddress: JSON.parse(response.data.pickupAddress),
          deliveryAddress: JSON.parse(response.data.deliveryAddress),
          images: JSON.parse(response.data.images).filter((item: string) => item !== '[' && item !== ']')
        }
        
        setShipment(parsedData)
        
        // Check if any required fields are missing
        const hasMissingInfo = !parsedData.receiverName || 
                             !parsedData.receiverEmail || 
                             !parsedData.deliveryAddress || 
                             !parsedData.pickupAddress ||
                             !parsedData.receiverPhoneNumber ||
                             !parsedData.receiverEmail
        setShowContinueButton(hasMissingInfo)
      } else {
        setError(response.message || 'Failed to fetch shipment details')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching shipment details')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchShipmentDetails()
  }, [fetchShipmentDetails])

  const handleCancelOrder = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.replace('/')
        return
      }

      const response = await cancelShipment(id as string, JSON.parse(token))
      if (response.success) {
        router.replace('/dashboard/shipments')
      } else {
        setError(response.message || 'Failed to cancel shipment')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while cancelling the shipment')
    }
  }, [id, router])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500'
      case 'in_transit':
        return 'bg-blue-500'
      case 'picked_up':
        return 'bg-orange-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }, [])

  const getProgressValue = useCallback((status: string) => {
    switch (status) {
      case 'cancelled':
        return 0
      case 'pending':
        return 20
      case 'picked_up':
        return 40
      case 'in_transit':
        return 60
      case 'delivered':
        return 100
      default:
        return 0
    }
  }, [])

  const getTrackingSteps = useCallback((status: string) => {
    const steps = [
      {
        id: 'payment',
        title: 'Payment Successful',
        description: shipment?.paymentStatus === 'paid' 
          ? 'Your payment has been processed successfully'
          : 'Payment is pending',
        icon: <Check className="h-5 w-5 text-green-500" />,
        status: shipment?.paymentStatus === 'paid' ? 'completed' : 'pending'
      },
      {
        id: 'pickup',
        title: 'Package Pickup',
        description: 'Your package is scheduled for pickup',
        icon: <Package className="h-5 w-5" />,
        status: 'pending'
      },
      {
        id: 'transit',
        title: 'In Transit',
        description: 'Your package is on its way',
        icon: <Truck className="h-5 w-5" />,
        status: 'pending'
      },
      {
        id: 'delivery',
        title: 'Package Delivered',
        description: 'Your package has been delivered',
        icon: <Check className="h-5 w-5" />,
        status: 'pending'
      }
    ];

    switch (status) {
      case 'pending':
        steps[1].status = 'in-progress';
        break;
      case 'picked_up':
        steps[1].status = 'completed';
        steps[2].status = 'in-progress';
        break;
      case 'in_transit':
        steps[1].status = 'completed';
        steps[2].status = 'completed';
        steps[3].status = 'in-progress';
        break;
      case 'delivered':
        steps[1].status = 'completed';
        steps[2].status = 'completed';
        steps[3].status = 'completed';
        break;
      case 'cancelled':
        steps[1].status = 'cancelled';
        steps[2].status = 'cancelled';
        steps[3].status = 'cancelled';
        break;
    }

    return steps;
  }, [shipment?.paymentStatus, shipment?.status]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const handlePaymentSuccess = useCallback(() => {
    setPaymentModal(false);
    fetchShipmentDetails();
  }, [fetchShipmentDetails]);

  const handlePaymentClose = useCallback(() => {
    setPaymentModal(false);
  }, []);

  const paymentModalContent = useMemo(() => (
    <Dialog open={paymentModal} onOpenChange={setPaymentModal}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="top-0 bg-transparent z-10">
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Please complete your payment to proceed with the shipment.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <PackagePayment
            handleNextStep={handlePaymentSuccess}
            handlePreviousStep={handlePaymentClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  ), [paymentModal, handlePaymentSuccess, handlePaymentClose]);

  const handleContinueShipment = useCallback(() => {
    if (shipment) {
      localStorage.setItem('packageInfo', JSON.stringify(shipment))
      const currentStep = localStorage.getItem('currentStep');
      if(currentStep){
        router.push('/dashboard/shipments/create')
      }else{
        localStorage.setItem('currentStep', '3')
        router.push('/dashboard/shipments/create')
      }
    }
  }, [shipment, router])

  const handleSharePDF = useCallback(async () => {
    try {
      setIsGeneratingPDF(true)
      
      // Dynamically import the required libraries
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Add company header with logo placeholder
      pdf.setFillColor(255, 140, 0) // Orange color
      pdf.rect(0, 0, 210, 30, 'F')
      pdf.setFontSize(32)
      pdf.setTextColor(255, 255, 255)
      pdf.text('Jingally Logistics', 20, 20)
      
      // Add shipment header with background
      pdf.setFillColor(245, 245, 245)
      pdf.rect(0, 30, 210, 20, 'F')
      pdf.setFontSize(24)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Shipment Details', 20, 45)
      
      // Add tracking info in a styled box
      pdf.setFillColor(255, 255, 255)
      pdf.setDrawColor(200, 200, 200)
      pdf.roundedRect(15, 55, 180, 25, 3, 3, 'FD')
      pdf.setFontSize(14)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Tracking Number: ${shipment?.trackingNumber || 'N/A'}`, 20, 65)
      pdf.text(`Status: ${shipment?.status ? shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1) : 'N/A'}`, 20, 72)
      
      // Add container information with styled header
      pdf.setFillColor(245, 245, 245)
      pdf.rect(15, 85, 180, 10, 'F')
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Container Information', 20, 92)
      
      // Container details in a styled box
      pdf.setFillColor(255, 255, 255)
      pdf.setDrawColor(200, 200, 200)
      pdf.roundedRect(15, 95, 180, 35, 3, 3, 'FD')
      pdf.setFontSize(12)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Container Number: ${shipment?.container?.containerNumber || 'N/A'}`, 20, 105)
      pdf.text(`Container Type: ${shipment?.container?.type || 'N/A'}`, 20, 112)
      pdf.text(`Container Size: ${shipment?.container?.capacity || 'N/A'} kg`, 20, 119)
      pdf.text(`Location: ${shipment?.container?.location || 'N/A'}`, 20, 126)
      
      // Add dates in a styled box
      pdf.setFillColor(255, 255, 255)
      pdf.setDrawColor(200, 200, 200)
      pdf.roundedRect(15, 135, 180, 25, 3, 3, 'FD')
      pdf.setFontSize(12)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Scheduled Pickup: ${formatDate(shipment?.scheduledPickupTime || '')}`, 20, 145)
      pdf.text(`Estimated Delivery: ${formatDate(shipment?.estimatedDeliveryTime || '')}`, 20, 152)
      
      // Add sender info with styled header
      pdf.setFillColor(245, 245, 245)
      pdf.rect(15, 165, 180, 10, 'F')
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Sender Information', 20, 172)
      
      // Sender details in a styled box
      pdf.setFillColor(255, 255, 255)
      pdf.setDrawColor(200, 200, 200)
      pdf.roundedRect(15, 175, 180, 35, 3, 3, 'FD')
      pdf.setFontSize(12)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`${shipment?.pickupAddress?.street}`, 20, 185)
      pdf.text(`${shipment?.pickupAddress?.city}, ${shipment?.pickupAddress?.state}`, 20, 192)
      pdf.text(`${shipment?.pickupAddress?.country} ${shipment?.pickupAddress?.postcode}`, 20, 199)
      // pdf.text(`Type: ${shipment?.pickupAddress?.type?.charAt(0).toUpperCase() + shipment?.pickupAddress?.type?.slice(1) || 'N/A'}`, 20, 206)
      
      // Add recipient info with styled header
      pdf.setFillColor(245, 245, 245)
      pdf.rect(15, 215, 180, 10, 'F')
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Recipient Information', 20, 222)
      
      // Recipient details in a styled box
      pdf.setFillColor(255, 255, 255)
      pdf.setDrawColor(200, 200, 200)
      pdf.roundedRect(15, 225, 180, 45, 3, 3, 'FD')
      pdf.setFontSize(12)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Name: ${shipment?.receiverName}`, 20, 235)
      pdf.text(`Phone: ${shipment?.receiverPhoneNumber}`, 20, 242)
      pdf.text(`Email: ${shipment?.receiverEmail}`, 20, 249)
      pdf.text(`${shipment?.deliveryAddress?.street}`, 20, 256)
      pdf.text(`${shipment?.deliveryAddress?.city}, ${shipment?.deliveryAddress?.state}`, 20, 263)
      pdf.text(`${shipment?.deliveryAddress?.country} ${shipment?.deliveryAddress?.postcode}`, 20, 270)
      // pdf.text(`Type: ${shipment?.serviceType || 'N/A'}`, 20, 277)
      
      // Add package details with styled header
      pdf.setFillColor(245, 245, 245)
      pdf.rect(15, 275, 180, 10, 'F')
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Package Details', 20, 282)
      
      // Package details in a styled box
      pdf.setFillColor(255, 255, 255)
      pdf.setDrawColor(200, 200, 200)
      pdf.roundedRect(15, 285, 180, 35, 3, 3, 'FD')
      pdf.setFontSize(12)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Weight: ${shipment?.weight} kg`, 20, 295)
      pdf.text(`Dimensions: ${shipment?.dimensions?.length} × ${shipment?.dimensions?.width} × ${shipment?.dimensions?.height} cm`, 20, 302)
      pdf.text(`Type: ${shipment?.packageType || 'Not specified'}`, 20, 309)
      pdf.text(`Service: ${shipment?.serviceType || 'Not specified'}`, 20, 316)
      pdf.text(`Fragile: ${shipment?.fragile ? 'Yes' : 'No'}`, 20, 323)
      
      // Add footer with gradient background
      pdf.setFillColor(245, 245, 245)
      pdf.rect(0, 277, 210, 20, 'F')
      pdf.setFontSize(10)
      pdf.setTextColor(150, 150, 150)
      pdf.text('Generated on: ' + new Date().toLocaleDateString(), 20, 287)
      pdf.text('© 2024 Jingally Logistics. All rights reserved.', 20, 292)

      // Generate PDF blob
      const pdfBlob = pdf.output('blob')
      
      // Create a shareable file
      const file = new File([pdfBlob], `shipment-${shipment?.trackingNumber}.pdf`, { type: 'application/pdf' })

      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: `Shipment Details - ${shipment?.trackingNumber}`,
          text: `Here are the details for shipment ${shipment?.trackingNumber}`,
          files: [file]
        })
      } else {
        // Fallback: Download the PDF
        const url = URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `shipment-${shipment?.trackingNumber}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('PDF downloaded successfully')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }, [shipment, formatDate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 animate-pulse">Loading shipment details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Alert variant="destructive" className="w-full max-w-md mx-4 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div className="space-y-1">
              <AlertTitle className="text-base font-semibold">Error</AlertTitle>
              <AlertDescription className="text-sm text-gray-600">
                {error}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Alert variant="destructive" className="w-full max-w-md mx-4 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div className="space-y-1">
              <AlertTitle className="text-base font-semibold">No Shipment Found</AlertTitle>
              <AlertDescription className="text-sm text-gray-600">
                The shipment you are looking for does not exist.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </div>
    )
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSharePDF}
              disabled={isGeneratingPDF}
            >
              <Share2 className="mr-2 h-4 w-4" />
              {isGeneratingPDF ? 'Generating...' : 'Share PDF'}
            </Button>
            {showCancelConfirmation && (
              <Button variant="outline" size="sm" onClick={handleContinueShipment}>
                <Download className="mr-2 h-4 w-4" />
                Continue Shipment
              </Button>
            )}
            {shipment?.status !== 'cancelled' && (              
              <Button variant="outline" size="sm" onClick={()=>{
                localStorage.setItem('packageInfo', JSON.stringify(shipment))
                router.push(`/dashboard/shipments/${shipment?.id}/edit`)
              }}>
                <PenBoxIcon className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            <Button 
              onClick={() => setShowCancelConfirmation(true)} 
              variant="outline" 
              size="sm"
              disabled={shipment?.status === 'cancelled' || shipment?.status === 'delivered'}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>

        <div id="shipment-details" className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Shipment {shipment?.trackingNumber}</CardTitle>
              <Badge className={`${getStatusColor(shipment?.status || '')} text-white`}>
                {shipment?.status?.charAt(0).toUpperCase() + shipment?.status?.slice(1)}
              </Badge>
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
                      <span className="font-semibold">{shipment?.status?.charAt(0).toUpperCase() + shipment?.status?.slice(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Estimated Delivery:</span>
                      </div>
                      <span className="font-semibold">{formatDate(shipment?.estimatedDeliveryTime || '')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Scheduled Pickup:</span>
                      </div>
                      <span className="font-semibold">{formatDate(shipment?.scheduledPickupTime || '')}</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h3 className="mb-2 font-medium">Sender</h3>
                        <div className="rounded-lg border p-3">
                          <p className="font-medium">{shipment?.pickupAddress?.street}</p>
                          <p className="text-sm">{shipment?.pickupAddress?.city}, {shipment?.pickupAddress?.state}</p>
                          <p className="text-sm">{shipment?.pickupAddress?.country} {shipment?.pickupAddress?.postcode}</p>
                          <p className="text-sm mt-2">
                            <span className="capitalize">{shipment?.pickupAddress?.type}</span> Address
                          </p>
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-2 font-medium">Package Information</h3>
                        <div className="rounded-lg border p-3 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-muted-foreground">Weight:</span>
                            <span>{shipment?.weight} kg</span>
                            <span className="text-muted-foreground">Dimensions:</span>
                            <span>{shipment?.dimensions?.length} × {shipment?.dimensions?.width} × {shipment?.dimensions?.height} cm</span>
                            <span className="text-muted-foreground">Package Type:</span>
                            <span>{shipment?.packageType || 'Not specified'}</span>
                            <span className="text-muted-foreground">Service Type:</span>
                            <span>{shipment?.serviceType || 'Not specified'}</span>
                            <span className="text-muted-foreground">Fragile:</span>
                            <span>{shipment?.fragile ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>

                      {shipment?.priceGuides && (
                        <div>
                          <h3 className="mb-2 font-medium">Price Guides</h3>
                          <div className="rounded-lg border p-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              {(() => {
                                const guides = typeof shipment.priceGuides === 'string' 
                                  ? JSON.parse(shipment.priceGuides) 
                                  : shipment.priceGuides;
                                return guides.map((guide: any) => (
                                  <React.Fragment key={guide.id}>
                                    <span className="text-muted-foreground">{guide.guideName}:</span>
                                    <span>${guide.price}</span>
                                  </React.Fragment>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      )}

                      {shipment?.container && (
                        <div>
                          <h3 className="mb-2 font-medium">Container Information</h3>
                          <div className="rounded-lg border p-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <span className="text-muted-foreground">Container Number:</span>
                              <span>{shipment.container.containerNumber}</span>
                              <span className="text-muted-foreground">Type:</span>
                              <span>{shipment.container.type}</span>
                              <span className="text-muted-foreground">Capacity:</span>
                              <span>{shipment.container.capacity} kg</span>
                              <span className="text-muted-foreground">Location:</span>
                              <span>{shipment.container.location}</span>
                              <span className="text-muted-foreground">Status:</span>
                              <span className="capitalize">{shipment.container.status}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="mb-2 font-medium">Recipient</h3>
                        <div className="rounded-lg border p-3">
                          <p className="font-medium">{shipment?.receiverName}</p>
                          <div className="flex items-center space-x-2 text-sm mt-1">
                            <Phone className="h-4 w-4" />
                            <span>{shipment?.receiverPhoneNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm mt-1">
                            <Mail className="h-4 w-4" />
                            <span>{shipment?.receiverEmail}</span>
                          </div>
                          <div className="mt-2">
                            <p className="font-medium">{shipment?.deliveryAddress?.street}</p>
                            <p className="text-sm">{shipment?.deliveryAddress?.city}, {shipment?.deliveryAddress?.state}</p>
                            <p className="text-sm">{shipment?.deliveryAddress?.country} {shipment?.deliveryAddress?.postcode}</p>
                            <p className="text-sm mt-2">
                              <span className="capitalize">{shipment?.deliveryAddress?.type}</span> Address
                            </p>
                          </div>
                        </div>
                      </div>
                      {shipment?.packageDescription && (
                        <div>
                          <h3 className="mb-2 font-medium">Package Description</h3>
                          <div className="rounded-lg border p-3">
                            <p className="text-sm">{shipment.packageDescription}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="documents" className="space-y-4">
                  {shipment?.images && shipment?.images?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {shipment?.images?.map((image, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={image}
                            alt={`Package image ${index + 1}`}
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No documents or images available</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-4">
          {(!shipment?.receiverName || !shipment?.receiverEmail || !shipment?.deliveryAddress || !shipment?.pickupAddress) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Complete Shipment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Some required information is missing. Please complete the shipment details.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      className="w-full mt-2"
                      onClick={handleContinueShipment}
                    >
                      Continue Shipment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}


            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Shipment Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Progress value={getProgressValue(shipment?.status || '')} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Started</span>
                    <span>{getProgressValue(shipment?.status || '')}% Complete</span>
                    <span>Delivered</span>
                  </div>
                  
                  <div className="space-y-4">
                    {getTrackingSteps(shipment?.status || '').map((step, index) => (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'completed' ? 'bg-green-100' :
                          step.status === 'in-progress' ? 'bg-blue-100' :
                          step.status === 'cancelled' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${
                              step.status === 'completed' ? 'text-green-700' :
                              step.status === 'in-progress' ? 'text-blue-700' :
                              step.status === 'cancelled' ? 'text-red-700' :
                              'text-gray-700'
                            }`}>
                              {step.title}
                            </h4>
                            {step.status === 'completed' && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge 
                    className={`${
                      shipment?.paymentStatus === 'paid' 
                        ? 'bg-green-500' 
                        : shipment?.paymentStatus === 'failed' 
                          ? 'bg-red-500' 
                          : 'bg-yellow-500'
                    } text-white`}
                  >
                    {shipment?.paymentStatus?.charAt(0).toUpperCase() + shipment?.paymentStatus?.slice(1)}
                  </Badge>
                  {shipment?.price && (
                    <p className="text-lg font-semibold">£{parseFloat(shipment.price).toFixed(2)}</p>
                  )}
                  {shipment?.paymentStatus !== 'paid' && shipment?.status !== "cancelled" && (
                    <Button 
                      className="w-full mt-2"
                      onClick={() => {
                        localStorage.setItem('packageInfo', JSON.stringify(shipment))
                        setPaymentModal(true)
                      }}
                    >
                      Pay Now
                    </Button>
                  )}
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
                    <Package className="mr-2 h-4 w-4 text-orange-500" />
                    Report an Issue
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                  <Link href="https://jingally.com/contact-us-1/" className="flex flex-row items-center gap-2">
                    <HelpCircle className="mr-2 h-4 w-4 text-orange-500" />
                    Contact Support
                  </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Cancel Shipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to cancel this shipment? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirmation(false)}
                >
                  No, Keep It
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelOrder}
                >
                  Yes, Cancel Shipment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {paymentModal && paymentModalContent}
    </main>
  )
}
