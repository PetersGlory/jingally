import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Simulate a delay to mimic a real API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock comprehensive invoice data
    const invoice = {
      id: id,
      trackingNumber: `JL-${id}`,
      status: 'in_transit',
      packageType: 'Standard Package',
      serviceType: 'Express Delivery',
      packageDescription: 'Electronics and documents',
      priceGuides: 'Standard pricing applied',
      fragile: true,
      weight: 5.2,
      dimensions: {
        length: 30,
        width: 20,
        height: 15
      },
      pickupAddress: {
        street: '123 Broadway',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postcode: '10001',
        type: 'business'
      },
      deliveryAddress: {
        street: '456 Hollywood Blvd',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postcode: '90028',
        type: 'residential'
      },
      scheduledPickupTime: '2025-04-28T09:00:00Z',
      estimatedDeliveryTime: '2025-05-05T17:00:00Z',
      receiverName: 'Jane Smith',
      receiverPhoneNumber: '+1 (555) 987-6543',
      receiverEmail: 'jane.smith@example.com',
      paymentMethod: 'credit_card',
      price: '89.99',
      paymentStatus: 'paid',
      notes: 'Handle with care - fragile items inside',
      createdAt: '2025-04-28T08:00:00Z',
      updatedAt: '2025-04-30T10:30:00Z',
      // Additional invoice-specific fields
      invoiceNumber: `INV-${id}`,
      issueDate: '2025-04-28T08:00:00Z',
      dueDate: '2025-05-28T08:00:00Z',
      subtotal: '79.99',
      tax: '10.00',
      total: '89.99',
      currency: 'USD',
      companyInfo: {
        name: 'Jingally Logistics',
        address: '123 Logistics Way, Shipping District, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'contact@jingally.com',
        website: 'www.jingally.com',
        taxId: 'TAX-123456789'
      },
      lineItems: [
        {
          description: 'Express Delivery Service',
          quantity: 1,
          unitPrice: '69.99',
          total: '69.99'
        },
        {
          description: 'Fragile Handling Fee',
          quantity: 1,
          unitPrice: '10.00',
          total: '10.00'
        }
      ]
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
} 