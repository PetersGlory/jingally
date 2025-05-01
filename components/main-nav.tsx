"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Package, Truck, MapPin, User, Settings, CreditCard, HelpCircle } from "lucide-react"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
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
  ]

  return (
    <nav className={cn("hidden md:flex items-center space-x-6 lg:space-x-8", className)} {...props}>
      <Link href="/" className="flex items-center space-x-2">
        <Image src="/logo.png" alt="Jingally Logistics" width={40} height={40} className="h-8 w-auto" />
        <span className="font-bold text-xl hidden lg:inline-block">Jingally Logistics</span>
      </Link>
      {publicRoutes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
          )}
        >
          {route.label}
        </Link>
      ))}
      {isAuthenticated && (
        <div className="flex items-center space-x-4">
          {dashboardRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                route.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {route.icon && <route.icon className="mr-2 h-4 w-4" />}
              {route.label}
            </Link>
          ))}
        </div>
      )}
      <div className="ml-auto flex items-center space-x-4">
        {isAuthenticated ? (
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/register">Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}
