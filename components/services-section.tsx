import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Ship, Plane, Package, Clock, Globe } from "lucide-react"

export function ServicesSection() {
  const services = [
    {
      icon: Truck,
      title: "Road Freight",
      description:
        "Efficient road transportation services for local and interstate deliveries with real-time tracking.",
    },
    {
      icon: Ship,
      title: "Sea Freight",
      description: "Reliable sea freight solutions for international shipping with competitive rates.",
    },
    {
      icon: Plane,
      title: "Air Freight",
      description: "Express air freight services for time-sensitive shipments across the globe.",
    },
    {
      icon: Package,
      title: "Warehousing",
      description: "Secure storage solutions with inventory management and distribution services.",
    },
    {
      icon: Clock,
      title: "Express Delivery",
      description: "Same-day and next-day delivery options for urgent shipments.",
    },
    {
      icon: Globe,
      title: "Global Logistics",
      description: "End-to-end logistics solutions for businesses with international operations.",
    },
  ]

  return (
    <section className="py-12 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Services</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Comprehensive logistics solutions tailored to your business needs
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card key={index} className="transition-all hover:shadow-lg">
              <CardHeader className="pb-2">
                <service.icon className="h-12 w-12 text-orange-500 mb-2" />
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
