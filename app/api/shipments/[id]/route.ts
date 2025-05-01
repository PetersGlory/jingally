import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Simulate a delay to mimic a real API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock shipment data
    const shipment = {
      id: id,
      date: "Apr 28, 2025",
      origin: "New York, NY",
      originAddress: "123 Broadway, New York, NY 10001",
      originContact: "John Doe",
      originPhone: "(555) 123-4567",
      destination: "Los Angeles, CA",
      destinationAddress: "456 Hollywood Blvd, Los Angeles, CA 90028",
      destinationContact: "Jane Smith",
      destinationPhone: "(555) 987-6543",
      type: "Standard",
      status: "In Transit",
      statusColor: "bg-orange-500",
      estimatedDelivery: "May 5, 2025",
      weight: "5.2 kg",
      dimensions: "30 × 20 × 15 cm",
      service: "Standard (3-5 business days)",
      additionalServices: ["Shipping Insurance"],
      trackingUpdates: [
        {
          date: "Apr 30, 2025",
          time: "10:24 AM",
          location: "Chicago, IL",
          status: "In transit to next facility",
          description: "Package is in transit to the next facility",
        },
        {
          date: "Apr 29, 2025",
          time: "8:15 PM",
          location: "Columbus, OH",
          status: "Departed sorting facility",
          description: "Package has left the sorting facility",
        },
        {
          date: "Apr 29, 2025",
          time: "2:30 PM",
          location: "Columbus, OH",
          status: "Arrived at sorting facility",
          description: "Package has arrived at the sorting facility",
        },
        {
          date: "Apr 28, 2025",
          time: "9:45 AM",
          location: "New York, NY",
          status: "Shipment picked up",
          description: "Package has been picked up by carrier",
        },
      ],
    }

    return NextResponse.json({ shipment })
  } catch (error) {
    console.error("Error fetching shipment:", error)
    return NextResponse.json({ error: "Failed to fetch shipment" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Validate required fields
    if (!body.status) {
      return NextResponse.json({ error: "Missing required field: status is required" }, { status: 400 })
    }

    // In a real application, you would update the shipment in a database
    // For now, we'll just return the updated shipment

    return NextResponse.json({
      shipment: {
        id,
        ...body,
      },
    })
  } catch (error) {
    console.error("Error updating shipment:", error)
    return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // In a real application, you would delete the shipment from a database
    // For now, we'll just return a success message

    return NextResponse.json({ message: `Shipment ${id} deleted successfully` })
  } catch (error) {
    console.error("Error deleting shipment:", error)
    return NextResponse.json({ error: "Failed to delete shipment" }, { status: 500 })
  }
}
