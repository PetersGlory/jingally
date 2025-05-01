import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get("trackingNumber")

    if (!trackingNumber) {
      return NextResponse.json({ error: "Missing required parameter: trackingNumber" }, { status: 400 })
    }

    // Simulate a delay to mimic a real API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock tracking data
    const trackingData = {
      trackingNumber,
      status: "In Transit",
      statusCode: "in_transit",
      origin: "New York, NY",
      destination: "Los Angeles, CA",
      estimatedDelivery: "May 5, 2025",
      updates: [
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

    return NextResponse.json({ tracking: trackingData })
  } catch (error) {
    console.error("Error fetching tracking information:", error)
    return NextResponse.json({ error: "Failed to fetch tracking information" }, { status: 500 })
  }
}
