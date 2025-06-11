"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Filter, ArrowUpDown, Plus, Loader2 } from "lucide-react"
import { getShipments } from "@/lib/shipment"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  packageType: string | null;
  serviceType: string | null;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  statusColor: string;
}

export default function ShipmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('accessToken')
        if (!token) {
          throw new Error('No access token found')
        }

        const response = await getShipments(JSON.parse(token))
        if (response.success) {
          const transformedShipments = response.data.map((shipment: any) => ({
            id: shipment.id,
            trackingNumber: shipment.trackingNumber,
            status: shipment.status,
            packageType: shipment.packageType || 'Not specified',
            serviceType: shipment.serviceType || 'Not specified',
            createdAt: new Date(shipment.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            paymentStatus: shipment.paymentStatus,
            paymentMethod: shipment.paymentMethod,
            statusColor: getStatusColor(shipment.status)
          }))
          setShipments(transformedShipments)
        } else {
          throw new Error(response.message || 'Failed to fetch shipments')
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching shipments')
        console.error('Error fetching shipments:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShipments()
  }, [])

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_transit':
        return 'bg-orange-100 text-orange-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string): string => {
    return status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
  }

  // Filter shipments based on search term and filters
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      searchTerm === "" ||
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || shipment.status.toLowerCase() === statusFilter.toLowerCase()

    const matchesType = typeFilter === "all" || shipment.packageType?.toLowerCase() === typeFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesType
  })

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h2 className="text-2xl font-bold">Error loading shipments</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="flex flex-col w-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Shipments</h2>
            <p className="text-muted-foreground mt-1">Manage and track your shipments</p>
          </div>
            <Button onClick={()=>{
              localStorage.setItem('currentStep', '1')
              router.push('/dashboard/shipments/create')
            }} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> New Shipment
            </Button>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>All Shipments</CardTitle>
            <CardDescription>View and manage all your shipments</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)] md:w-full lg:w-full w-screen">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex w-full items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by tracking number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-9 w-[180px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="parcel">Parcel</SelectItem>
                      <SelectItem value="pallet">Pallet</SelectItem>
                      <SelectItem value="container">Container</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-md border">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <div className="relative">
                  <div className="w-full max-h-[calc(100vh-300px)]">
                    <div className="w-full">
                      <Table className="w-auto">
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="w-[120px] sticky left-0 bg-background z-20">
                              <div className="flex items-center space-x-1">
                                <span>Tracking #</span>
                                <ArrowUpDown className="h-3 w-3" />
                              </div>
                            </TableHead>
                            <TableHead className="w-[120px]">
                              <div className="flex items-center space-x-1">
                                <span>Date</span>
                                <ArrowUpDown className="h-3 w-3" />
                              </div>
                            </TableHead>
                            <TableHead className="w-[120px]">Package Type</TableHead>
                            <TableHead className="w-[120px]">Service Type</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[120px]">Payment</TableHead>
                            <TableHead className="w-[120px]">Payment Method</TableHead>
                            <TableHead className="w-[120px] text-right sticky right-0 bg-background z-20">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredShipments.length > 0 ? (
                            filteredShipments.map((shipment) => (
                              <TableRow key={shipment.id}>
                                <TableCell className="font-medium sticky left-0 bg-background z-10">
                                  {shipment.trackingNumber}
                                </TableCell>
                                <TableCell>{shipment.createdAt}</TableCell>
                                <TableCell>{shipment.packageType}</TableCell>
                                <TableCell>{shipment.serviceType}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${shipment.statusColor}`}>
                                    {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(shipment.paymentStatus)}`}>
                                    {shipment.paymentStatus.charAt(0).toUpperCase() + shipment.paymentStatus.slice(1)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center capitalize">
                                  {'Scheduled'}
                                </TableCell>
                                <TableCell className="text-right sticky right-0 bg-background z-10">
                                  <Link href={`/dashboard/shipments/${shipment.id}`}>
                                    <Button variant="ghost" size="sm">
                                      View Details
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                  <Package className="h-8 w-8 text-muted-foreground" />
                                  <p className="text-muted-foreground">No shipments found</p>
                                  {searchTerm && (
                                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                                      Clear search
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
