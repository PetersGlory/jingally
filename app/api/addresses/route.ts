import { NextResponse } from "next/server"

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

export async function GET() {
  try {
    // Simulate a delay to mimic a real API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.fullName || !body.street || !body.city || !body.state || !body.zip || !body.country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a new address ID
    const newId = Math.max(...addresses.map((address) => address.id)) + 1

    // Create a new address
    const newAddress = {
      id: newId,
      type: body.type || "home",
      default: body.default || false,
      ...body,
    }

    // In a real application, you would save this to a database
    // For now, we'll just return the new address

    return NextResponse.json({ address: newAddress }, { status: 201 })
  } catch (error) {
    console.error("Error creating address:", error)
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 })
  }
}
