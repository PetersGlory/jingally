"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Package, Truck, MapPin, User, Settings, CreditCard, HelpCircle } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  const publicRoutes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/services",
      label: "Services",
      active: pathname === "/services",
    },
    {
      href: "/tracking",
      label: "Track Shipment",
      active: pathname === "/tracking",
    },
    {
      href: "/shipping",
      label: "Ship Now",
      active: pathname === "/shipping",
    },
    {
      href: "/about",
      label: "About Us",
      active: pathname === "/about",
    },
    {
      href: "/contact",
      label: "Contact",
      active: pathname === "/contact",
    },
  ]

  const dashboardRoutes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/shipments",
      label: "My Shipments",
      active: pathname === "/dashboard/shipments",
      icon: Package,
    },
    {
      href: "/dashboard/tracking",
      label: "Track Shipment",
      active: pathname === "/dashboard/tracking",
      icon: Truck,
    },
    {
      href: "/dashboard/addresses",
      label: "Addresses",
      active: pathname === "/dashboard/addresses",
      icon: MapPin,
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      active: pathname === "/dashboard/profile",
      icon: User,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      active: pathname === "/dashboard/settings",
      icon: Settings,
    },
    {
      href: "/dashboard/billing",
      label: "Billing",
      active: pathname === "/dashboard/billing",
      icon: CreditCard,
    },
    {
      href: "/dashboard/help",
      label: "Help & Support",
      active: pathname === "/dashboard/help",
      icon: HelpCircle,
    },
  ]

  return (
    <div className="md:hidden flex items-center">
      <Link href="/" className="mr-auto flex items-center space-x-2">
        <Image src="/logo.png" alt="Jingally Logistics" width={40} height={40} className="h-8 w-auto" />
        <span className="font-bold text-lg">Jingally</span>
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-auto">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <div className="grid gap-6 py-6">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <Image src="/logo.png" alt="Jingally Logistics" width={40} height={40} className="h-8 w-auto" />
              <span className="font-bold">Jingally Logistics</span>
            </Link>
            <div className="grid gap-3">
              {publicRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    route.active ? "text-primary" : "text-muted-foreground",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {route.label}
                </Link>
              ))}
            </div>
            {isAuthenticated && (
              <div className="grid gap-3">
                <h4 className="text-sm font-medium text-muted-foreground">Dashboard</h4>
                {dashboardRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary flex items-center",
                      route.active ? "text-primary" : "text-muted-foreground",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {route.icon && <route.icon className="mr-2 h-4 w-4" />}
                    {route.label}
                  </Link>
                ))}
              </div>
            )}
            <div className="grid gap-2">
              {isAuthenticated ? (
                <Button className="w-full" onClick={() => setOpen(false)} asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full" onClick={() => setOpen(false)} asChild>
                    <Link href="/auth/login">Log in</Link>
                  </Button>
                  <Button className="w-full" onClick={() => setOpen(false)} asChild>
                    <Link href="/auth/register">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
