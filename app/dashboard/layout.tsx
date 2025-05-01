import type { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { DashboardNav } from "@/components/dashboard-nav"
import { MobileDashboardNav } from "@/components/mobile-dashboard-nav"
import { UserNav } from "@/components/user-nav"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2 md:mr-6">
            <Image src="/logo.png" alt="Jingally Logistics" width={40} height={40} className="h-8 w-auto" />
            <span className="hidden font-bold sm:inline-block">Jingally</span>
          </Link>
          <MobileDashboardNav />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r bg-muted/40 md:block">
          <DashboardNav />
        </aside>
        <main className="flex flex-col">{children}</main>
      </div>
    </div>
  )
}
