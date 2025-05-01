"use server"

import { revalidatePath } from "next/cache"

// Types
type ShipmentData = {
  origin: string
  destination: string
  type: string
  weight?: string
  dimensions?: string
  contents?: string
  value?: string
  [key: string]: any
}

type AddressData = {
  name: string
  type: string
  fullName: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  default?: boolean
}

type ProfileData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  company?: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  [key: string]: any
}

// Shipment actions
export async function createShipment(data: ShipmentData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/shipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create shipment")
    }

    const result = await response.json()
    revalidatePath("/dashboard/shipments")
    return { success: true, data: result.shipment }
  } catch (error) {
    console.error("Error creating shipment:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateShipment(id: string, data: Partial<ShipmentData>) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/shipments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update shipment")
    }

    const result = await response.json()
    revalidatePath(`/dashboard/shipments/${id}`)
    revalidatePath("/dashboard/shipments")
    return { success: true, data: result.shipment }
  } catch (error) {
    console.error("Error updating shipment:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deleteShipment(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/shipments/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to delete shipment")
    }

    revalidatePath("/dashboard/shipments")
    return { success: true }
  } catch (error) {
    console.error("Error deleting shipment:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Address actions
export async function createAddress(data: AddressData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create address")
    }

    const result = await response.json()
    revalidatePath("/dashboard/address-book")
    return { success: true, data: result.address }
  } catch (error) {
    console.error("Error creating address:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateAddress(id: number, data: Partial<AddressData>) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/addresses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update address")
    }

    const result = await response.json()
    revalidatePath("/dashboard/address-book")
    return { success: true, data: result.address }
  } catch (error) {
    console.error("Error updating address:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deleteAddress(id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/addresses/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to delete address")
    }

    revalidatePath("/dashboard/address-book")
    return { success: true }
  } catch (error) {
    console.error("Error deleting address:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Profile actions
export async function updateProfile(data: Partial<ProfileData>) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update profile")
    }

    const result = await response.json()
    revalidatePath("/dashboard/profile")
    return { success: true, data: result.profile }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Tracking action
export async function trackShipment(trackingNumber: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/tracking?trackingNumber=${encodeURIComponent(trackingNumber)}`,
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to track shipment")
    }

    const result = await response.json()
    return { success: true, data: result.tracking }
  } catch (error) {
    console.error("Error tracking shipment:", error)
    return { success: false, error: (error as Error).message }
  }
}
