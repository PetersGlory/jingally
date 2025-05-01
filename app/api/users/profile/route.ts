import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulate a delay to mimic a real API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock user profile data
    const profile = {
      id: "user123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "(555) 123-4567",
      company: "Acme Inc.",
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "United States",
      },
      preferences: {
        notifications: {
          shipmentUpdates: true,
          email: true,
          sms: false,
          billing: true,
        },
        security: {
          twoFactor: false,
        },
      },
      accountInfo: {
        memberSince: "January 15, 2023",
        accountType: "Business",
        lastLogin: "April 30, 2025",
      },
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    // In a real application, you would update the user profile in a database
    // For now, we'll just return the updated profile

    return NextResponse.json({
      profile: {
        id: "user123",
        ...body,
      },
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
