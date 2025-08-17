import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Simulate a delay to mimic a real API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock shipment data in new format
    const shipment = {
      id: id,
      userId: "user-123",
      status: "in_transit",
      packageType: "items",
      serviceType: "seafreight",
      packageDescription: "this is airfrieght and its N/A",
      fragile: false,
      priceGuides: JSON.stringify([
        {
          "id": "02d5c61c-a0fc-4bbe-bf63-17f061a2d084",
          "guideName": "Big Barrel",
          "price": 90,
          "guideNumber": "JLP1749458898328636"
        },
        {
          "id": "0a1d2819-23d4-4ca3-b311-86a27462b056",
          "guideName": "Normal Doors (72cm) With Handle",
          "price": 20,
          "guideNumber": "JLP1749463682133409"
        }
      ]),
      weight: null,
      dimensions: null,
      pickupAddress: JSON.stringify({
        street: "Lawal street Oregun, Inner city Missions Homes",
        city: "Lagos",
        state: "Lagos",
        country: "Nigeria",
        postcode: "100261",
        latitude: 0,
        longitude: 0,
        placeId: "",
        type: "residential"
      }),
      deliveryAddress: JSON.stringify({
        street: "N/A",
        city: "N/A",
        state: "N/A",
        country: "UK",
        postcode: "N/A",
        latitude: 0,
        longitude: 0,
        placeId: "N/A",
        type: "residential"
      }),
      deliveryType: "home",
      scheduledPickupTime: null,
      estimatedDeliveryTime: null,
      trackingNumber: "TRK1755379513574543",
      receiverName: "MShelia Promise",
      receiverPhoneNumber: "09032259456",
      receiverEmail: "msheliapromise@gmail.com",
      price: "310.00",
      paymentStatus: "paid",
      notes: null,
      driverId: "2d5149bb-78a4-41ce-9717-d9ce780b9af2",
      images: ["[", "]", "https://res.cloudinary.com/dctmbqr8l/image/upload/v1755380193/shipments/gynwolt7uzdoktinbx66.png"],
      createdAt: "2025-08-16T21:25:13.000Z",
      updatedAt: "2025-08-17T21:54:08.000Z",
      user: null,
      driver: {
        id: "2d5149bb-78a4-41ce-9717-d9ce780b9af2",
        firstName: "Mshelia",
        lastName: "Promise",
        phone: "+2349032259456"
      },
      container: null,
      paymentMethod: "bank_transfer"
    }

    return NextResponse.json({ 
      success: true, 
      data: shipment 
    })
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
