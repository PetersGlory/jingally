"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Package, Truck, MapPin, Calendar, Clock, FileText, Download, AlertCircle, X, Phone, Mail, HelpCircle, Check } from "lucide-react"
import { getShipmentDetails, cancelShipment } from "@/lib/shipment"
import PackagePayment from "@/components/package/PackagePayment"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Shipment {
  id: string;
  trackingNumber: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  packageType: string | null;
  serviceType: string | null;
  packageDescription: string | null;
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
  price: number | null;
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes: string | null;
  driverId: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
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
        setShipment(response.data)
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
        description: 'Your payment has been processed successfully',
        icon: <Check className="h-5 w-5 text-green-500" />,
        status: 'completed'
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
        steps[0].status = 'completed';
        steps[1].status = 'in-progress';
        break;
      case 'picked_up':
        steps[0].status = 'completed';
        steps[1].status = 'completed';
        steps[2].status = 'in-progress';
        break;
      case 'in_transit':
        steps[0].status = 'completed';
        steps[1].status = 'completed';
        steps[2].status = 'completed';
        steps[3].status = 'in-progress';
        break;
      case 'delivered':
        steps.forEach(step => step.status = 'completed');
        break;
      case 'cancelled':
        steps[0].status = 'completed';
        steps[1].status = 'cancelled';
        steps[2].status = 'cancelled';
        steps[3].status = 'cancelled';
        break;
    }

    return steps;
  }, []);

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
    router.refresh();
  }, [router]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="w-1/2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Shipment Found</AlertTitle>
          <AlertDescription>
            The shipment you are looking for does not exist.
          </AlertDescription>
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
            {/* <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button> */}
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

        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
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
                    <p className="text-lg font-semibold">${shipment?.price}</p>
                  )}
                  {shipment?.paymentStatus !== 'paid' && (
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
                    <HelpCircle className="mr-2 h-4 w-4 text-orange-500" />
                    Contact Support
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
