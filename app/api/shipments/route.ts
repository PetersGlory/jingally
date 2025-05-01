import { NextResponse } from "next/server"

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
]

export async function GET() {
  try {
    // Simulate a delay to mimic a real API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({ shipments })
  } catch (error) {
    console.error("Error fetching shipments:", error)
    return NextResponse.json({ error: "Failed to fetch shipments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.origin || !body.destination || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: origin, destination, and type are required" },
        { status: 400 },
      )
    }

    // Generate a new shipment ID
    const newId = `JL-${Math.floor(Math.random() * 1000000)}`

    // Create a new shipment
    const newShipment = {
      id: newId,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      origin: body.origin,
      destination: body.destination,
      type: body.type,
      status: "Processing",
      statusColor: "text-blue-500",
      ...body,
    }

    // In a real application, you would save this to a database
    // For now, we'll just return the new shipment

    return NextResponse.json({ shipment: newShipment }, { status: 201 })
  } catch (error) {
    console.error("Error creating shipment:", error)
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 })
  }
}
