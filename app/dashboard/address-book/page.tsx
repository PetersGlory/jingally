"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DashboardNav } from "@/components/dashboard-nav"
import { MobileDashboardNav } from "@/components/mobile-dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { MapPin, Plus, MoreHorizontal, Pencil, Trash2, Home, Building, Star } from "lucide-react"

// Mock address data
const addresses = [
  {
    id: 1,
    name: "Home",
    type: "home",
    default: true,
    fullName: "John Doe",
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
    phone: "(555) 123-4567",
  },
  {
    id: 2,
    name: "Office",
    type: "business",
    default: false,
    fullName: "John Doe",
    street: "456 Market St",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
    country: "United States",
    phone: "(555) 987-6543",
  },
  {
    id: 3,
    name: "Warehouse",
    type: "business",
    default: false,
    fullName: "Acme Inc.",
    street: "789 Industrial Blvd",
    city: "Chicago",
    state: "IL",
    zip: "60607",
    country: "United States",
    phone: "(555) 456-7890",
  },
]

export default function AddressBookPage() {
  const [addressList, setAddressList] = useState(addresses)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentAddress, setCurrentAddress] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleAddAddress = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setIsAddDialogOpen(false)
      // Would add the new address to the list here
    }, 1000)
  }

  const handleEditAddress = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setIsEditDialogOpen(false)
      // Would update the address in the list here
    }, 1000)
  }

  const handleDeleteAddress = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setIsDeleteDialogOpen(false)
      setAddressList(addressList.filter((address) => address.id !== currentAddress.id))
    }, 1000)
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="h-4 w-4" />
      case "business":
        return <Building className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  return (
  <>

        <main className="flex flex-col">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Address Book</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Address</DialogTitle>
                    <DialogDescription>Add a new address to your address book.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Address Name</Label>
                      <Input id="name" placeholder="Home, Office, etc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input id="street" placeholder="123 Main St" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="City" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input id="state" placeholder="State" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zip">Postal Code</Label>
                        <Input id="zip" placeholder="Postal Code" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" placeholder="Country" defaultValue="United States" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="(555) 123-4567" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddAddress} disabled={isSaving}>
                      {isSaving ? (
                        <div className="flex items-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Saving...
                        </div>
                      ) : (
                        "Save Address"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {addressList.map((address) => (
                <Card key={address.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            address.type === "home" ? "bg-blue-100" : "bg-orange-100"
                          }`}
                        >
                          {getAddressIcon(address.type)}
                        </div>
                        <CardTitle className="text-lg">{address.name}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentAddress(address)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentAddress(address)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {address.default && (
                      <div className="absolute right-2 top-2">
                        <div className="flex items-center space-x-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
                          <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                          <span>Default</span>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{address.fullName}</p>
                      <p>{address.street}</p>
                      <p>
                        {address.city}, {address.state} {address.zip}
                      </p>
                      <p>{address.country}</p>
                      <p className="pt-1 text-muted-foreground">{address.phone}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {!address.default && (
                      <Button variant="outline" size="sm">
                        Set as Default
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="ml-auto">
                      Use This Address
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>

      {/* Edit Address Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>Update your address information.</DialogDescription>
          </DialogHeader>
          {currentAddress && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Address Name</Label>
                <Input id="edit-name" defaultValue={currentAddress.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input id="edit-fullName" defaultValue={currentAddress.fullName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-street">Street Address</Label>
                <Input id="edit-street" defaultValue={currentAddress.street} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input id="edit-city" defaultValue={currentAddress.city} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State/Province</Label>
                  <Input id="edit-state" defaultValue={currentAddress.state} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-zip">Postal Code</Label>
                  <Input id="edit-zip" defaultValue={currentAddress.zip} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Country</Label>
                  <Input id="edit-country" defaultValue={currentAddress.country} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input id="edit-phone" defaultValue={currentAddress.phone} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAddress} disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Address Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
            <DialogDescription>Are you sure you want to delete this address?</DialogDescription>
          </DialogHeader>
          {currentAddress && (
            <div className="py-4">
              <div className="rounded-lg border p-4">
                <p className="font-medium">{currentAddress.name}</p>
                <p className="text-sm">{currentAddress.street}</p>
                <p className="text-sm">
                  {currentAddress.city}, {currentAddress.state} {currentAddress.zip}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAddress} disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Deleting...
                </div>
              ) : (
                "Delete Address"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
