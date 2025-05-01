import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-blue-950 text-white">
      <div className="container px-4 py-12 md:px-6 md:py-16 lg:py-20">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Jingally Logistics" width={50} height={50} className="h-10 w-auto" />
              <span className="font-bold text-xl">Jingally</span>
            </Link>
            <p className="text-sm text-gray-300">
              Your trusted partner for global shipping and logistics solutions since 2010.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-300 hover:text-orange-500">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-300 hover:text-orange-500">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-300 hover:text-orange-500">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-300 hover:text-orange-500">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-orange-500">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-orange-500">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-gray-300 hover:text-orange-500">
                  Track Shipment
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-orange-500">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-orange-500">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services/road-freight" className="text-gray-300 hover:text-orange-500">
                  Road Freight
                </Link>
              </li>
              <li>
                <Link href="/services/sea-freight" className="text-gray-300 hover:text-orange-500">
                  Sea Freight
                </Link>
              </li>
              <li>
                <Link href="/services/air-freight" className="text-gray-300 hover:text-orange-500">
                  Air Freight
                </Link>
              </li>
              <li>
                <Link href="/services/warehousing" className="text-gray-300 hover:text-orange-500">
                  Warehousing
                </Link>
              </li>
              <li>
                <Link href="/services/express-delivery" className="text-gray-300 hover:text-orange-500">
                  Express Delivery
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-orange-500 shrink-0" />
                <span className="text-gray-300">123 Logistics Way, Shipping City, SC 12345</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-orange-500 shrink-0" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-orange-500 shrink-0" />
                <span className="text-gray-300">info@jingallylogistics.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm text-gray-300">
          <p>© {new Date().getFullYear()} Jingally Logistics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
