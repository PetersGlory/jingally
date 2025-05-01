"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Filter, ArrowUpDown, Plus } from "lucide-react"

// Mock data for shipments
const shipments = [
  {
    id: "JL-2023001",
    date: "Apr 28, 2025",
    origin: "New York, NY",
    destination: "Los Angeles, CA",
    type: "Standard",
    status: "In Transit",
    statusColor: "text-orange-500",
  },
  {
    id: "JL-2023002",
    date: "Apr 25, 2025",
    origin: "Chicago, IL",
    destination: "Miami, FL",
    type: "Express",
    status: "Delivered",
    statusColor: "text-green-500",
  },
  {
    id: "JL-2023003",
    date: "Apr 22, 2025",
    origin: "Seattle, WA",
    destination: "Boston, MA",
    type: "Standard",
    status: "Processing",
    statusColor: "text-blue-500",
  },
  {
    id: "JL-2023004",
    date: "Apr 20, 2025",
    origin: "Austin, TX",
    destination: "Denver, CO",
    type: "Overnight",
    status: "Delivered",
    statusColor: "text-green-500",
  },
  {
    id: "JL-2023005",
    date: "Apr 18, 2025",
    origin: "San Francisco, CA",
    destination: "Washington, DC",
    type: "Express",
    status: "Delivered",
    statusColor: "text-green-500",
  },
  {
    id: "JL-2023006",
    date: "Apr 15, 2025",
    origin: "Portland, OR",
    destination: "Nashville, TN",
    type: "Standard",
    status: "Exception",
    statusColor: "text-red-500",
  },
  {
    id: "JL-2023007",
    date: "Apr 12, 2025",
    origin: "Atlanta, GA",
    destination: "Philadelphia, PA",
    type: "Standard",
    status: "Delivered",
    statusColor: "text-green-500",
  },
]

export default function ShipmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Filter shipments based on search term and filters
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      searchTerm === "" ||
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || shipment.status.toLowerCase() === statusFilter.toLowerCase()

    const matchesType = typeFilter === "all" || shipment.type.toLowerCase() === typeFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesType
  })

  return (
        <main className="flex flex-col w-full">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Shipments</h2>
              <Link href="/dashboard/shipments/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> New Shipment
                </Button>
              </Link>
            </div>

            <Card className=" w-full overflow-x-auto">
              <CardHeader>
                <CardTitle>All Shipments</CardTitle>
                <CardDescription>View and manage all your shipments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div className="flex w-full items-center space-x-2 md:w-1/3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search shipments..."
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
                          <SelectItem value="in transit">In Transit</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="exception">Exception</SelectItem>
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
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="express">Express</SelectItem>
                          <SelectItem value="overnight">Overnight</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-md border w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">
                          <div className="flex items-center space-x-1">
                            <span>Tracking #</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-1">
                            <span>Date</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Origin</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredShipments.length > 0 ? (
                        filteredShipments.map((shipment) => (
                          <TableRow key={shipment.id}>
                            <TableCell className="font-medium">{shipment.id}</TableCell>
                            <TableCell>{shipment.date}</TableCell>
                            <TableCell>{shipment.origin}</TableCell>
                            <TableCell>{shipment.destination}</TableCell>
                            <TableCell>{shipment.type}</TableCell>
                            <TableCell>
                              <span className={shipment.statusColor}>{shipment.status}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/dashboard/shipments/${shipment.id}`}>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No shipments found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
  )
}
