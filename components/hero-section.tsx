import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Truck, Ship, Plane } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-12 md:py-24 lg:py-32 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Global Logistics Solutions for Your Business
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Reliable shipping and delivery services across air, sea, and land. Track your shipments in real-time
                with Jingally Logistics.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Track Shipment
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Truck className="h-4 w-4 text-orange-500" />
                <span>Road</span>
              </div>
              <div className="flex items-center space-x-1">
                <Ship className="h-4 w-4 text-blue-900" />
                <span>Sea</span>
              </div>
              <div className="flex items-center space-x-1">
                <Plane className="h-4 w-4 text-blue-900" />
                <span>Air</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]">
              <Image src="/logo.png" alt="Jingally Logistics" fill className="object-contain" priority />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
