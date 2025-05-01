import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    // Simulate a delay to mimic a real API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock address data
    const address = {
      id,
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
    }

    return NextResponse.json({ address })
  } catch (error) {
    console.error("Error fetching address:", error)
    return NextResponse.json({ error: "Failed to fetch address" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()

    // In a real application, you would update the address in a database
    // For now, we'll just return the updated address

    return NextResponse.json({
      address: {
        id,
        ...body,
      },
    })
  } catch (error) {
    console.error("Error updating address:", error)
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    // In a real application, you would delete the address from a database
    // For now, we'll just return a success message

    return NextResponse.json({ message: `Address ${id} deleted successfully` })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}
