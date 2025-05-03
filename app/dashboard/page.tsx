"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Package, Truck, Bell, Search, SlidersHorizontal, MoreVertical } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { getUser, getAddress } from "@/lib/api"
import { useSession } from "next-auth/react"
import { useAuth } from "@/components/auth-provider"
import { getShipments } from "@/lib/shipment"

interface Shipment {
  id: string
  trackingNumber: string
  status: string
  receiverName: string
  deliveryAddress: {
    city: string
  }
  pickupAddress: {
    city: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [userData, setUserData] = useState({ firstName: "User" })
  const [addresses, setAddresses] = useState<any[]>([])

  useEffect(() => {
    // if (token) {
      loadData()
    // }
  }, [token])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const authToken = token ||JSON.parse(localStorage.getItem('accessToken') || '{}')
      // Fetch user data
      const userResponse = await getUser(authToken as string)
      console.log(userResponse)
      setUserData(userResponse)

      // Fetch addresses
      const addressesResponse = await getAddress(authToken as string)
      if (addressesResponse.success) {
        setAddresses(addressesResponse.data)
      }

     await fetchShipmentHistory();

      // For now, using mock data until you implement the shipments API
      // const mockShipments: Shipment[] = [
      //   {
      //     id: "1",
      //     trackingNumber: "JL-2023001",
      //     status: "In Transit",
      //     receiverName: "Sarah Johnson",
      //     deliveryAddress: { city: "New York" },
      //     pickupAddress: { city: "Los Angeles" }
      //   },
      //   {
      //     id: "2",
      //     trackingNumber: "JL-2023002",
      //     status: "Delivered",
      //     receiverName: "Michael Brown",
      //     deliveryAddress: { city: "Chicago" },
      //     pickupAddress: { city: "Miami" }
      //   }
      // ]
      // setShipments(mockShipments)

    } catch (error: any) {
      console.error("Error loading data:", error)
      setError(error.response?.data?.message || "Failed to load data")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchShipmentHistory = async () => {
    try {

      const authToken = token ||JSON.parse(localStorage.getItem('accessToken') || '{}')
      const response = await getShipments(authToken as string);
      // const token = localStorage.getItem('accessToken');
      if (!authToken) {
        setError('Authentication required');
        return;
      }

      if (response.success) {
        // Validate each shipment
        const validShipments = response.data.filter((shipment: Shipment) => {
          if(shipment.receiverName !== ""){
            return (
              shipment.id &&
              shipment.trackingNumber &&
              shipment.status &&
              shipment.pickupAddress &&
              shipment.deliveryAddress
            );
          }
        });
        // console.log(response.data);
        setShipments(validShipments);
        setError(null);
      } else {
        setError('Failed to fetch shipments');
      }
    } catch (err:any) {
      console.log(err.response.data);
      setError('An error occurred while fetching shipments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewShipment = () => {
    router.push("/dashboard/shipments/create")
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsLoading(true)
      // Implement search functionality
      // const searchResponse = await searchShipments(searchQuery, session?.user?.accessToken as string)
      // setShipments(searchResponse.data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Search Error",
        description: error.response?.data?.message || "Failed to search shipments",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, {userData.firstName}
          </h2>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            0
          </span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Track your package"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Promotional Card */}
      <Card className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Start Shipping</h3>
              <h2 className="text-2xl font-bold">World-wide</h2>
              <p className="text-blue-200">on your next shipping</p>
              <Button 
                variant="secondary" 
                className="mt-4"
                onClick={handleNewShipment}
              >
                Send Package
              </Button>
            </div>
            <div className="w-32 h-32 relative">
              <Package className="w-full h-full text-blue-200/20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Deliveries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Deliveries</h3>
          <Button variant="link" onClick={() => router.push("/dashboard/shipments")}>
            See all
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : shipments.length > 0 ? (
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <Card 
                key={shipment.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/dashboard/shipments/${shipment.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {shipment.receiverName} - {shipment.deliveryAddress.city}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tracking ID: {shipment.trackingNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: {shipment.status}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              No recent deliveries found.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
