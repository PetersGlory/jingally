import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { TrackingSection } from "@/components/tracking-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
          <MobileNav />
        </div>
      </header>
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <TrackingSection />
      </main>
      <Footer />
    </div>
  )
}
