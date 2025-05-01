"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Package, Truck, Clock, Settings, CreditCard, Home, BarChart3, HelpCircle, LogOut, Menu } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Shipments",
    href: "/dashboard/shipments",
    icon: Package,
  },
  {
    title: "Tracking",
    href: "/dashboard/tracking",
    icon: Truck,
  },
  {
    title: "History",
    href: "/dashboard/history",
    icon: Clock,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function MobileDashboardNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="grid gap-2 py-4">
          {navItems.map((item, index) => (
            <Link key={index} href={item.href} onClick={() => setOpen(false)}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href &&
                    "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 hover:text-orange-500",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          ))}
          <div className="mt-4 grid gap-2">
            <Link href="/dashboard/help" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </Button>
            </Link>
            <Link href="/auth/logout" onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
