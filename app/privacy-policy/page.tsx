"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone, Globe, Shield } from "lucide-react"

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      content: "Jingally Logistics ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services."
    },
    {
      id: "information-collection",
      title: "2. Information We Collect",
      content: "We collect several types of information to provide and improve our services:",
      list: [
        "Personal Information: Name, email address, phone number, and shipping address",
        "Payment Information: Credit card details and billing information",
        "Shipment Information: Package details, tracking numbers, and delivery preferences",
        "Device Information: IP address, browser type, and device identifiers",
        "Usage Data: How you interact with our website and services"
      ]
    },
    {
      id: "information-use",
      title: "3. How We Use Your Information",
      content: "We use the collected information for various purposes:",
      list: [
        "To provide and maintain our shipping and logistics services",
        "To process your shipments and payments",
        "To communicate with you about your shipments and services",
        "To improve our website and services",
        "To comply with legal obligations",
        "To send you marketing communications (with your consent)"
      ]
    },
    {
      id: "information-sharing",
      title: "4. Information Sharing and Disclosure",
      content: "We may share your information with:",
      list: [
        "Service providers who assist in our operations",
        "Shipping partners and carriers",
        "Payment processors",
        "Legal authorities when required by law",
        "Business partners with your consent"
      ]
    },
    {
      id: "data-security",
      title: "5. Data Security",
      content: "We implement appropriate security measures to protect your personal information:",
      list: [
        "Encryption of sensitive data",
        "Regular security assessments",
        "Access controls and authentication",
        "Secure data storage and transmission",
        "Employee training on data protection"
      ]
    },
    {
      id: "cookies",
      title: "6. Cookies and Tracking Technologies",
      content: "We use cookies and similar tracking technologies to:",
      list: [
        "Remember your preferences",
        "Analyze website usage",
        "Improve user experience",
        "Provide personalized content",
        "Track shipment status"
      ]
    },
    {
      id: "user-rights",
      title: "7. Your Rights and Choices",
      content: "You have the right to:",
      list: [
        "Access your personal information",
        "Correct inaccurate data",
        "Request deletion of your data",
        "Opt-out of marketing communications",
        "Withdraw consent for data processing"
      ]
    },
    {
      id: "data-retention",
      title: "8. Data Retention",
      content: "We retain your personal information for as long as necessary to:",
      list: [
        "Fulfill the purposes outlined in this policy",
        "Comply with legal obligations",
        "Resolve disputes",
        "Enforce our agreements"
      ]
    },
    {
      id: "children",
      title: "9. Children's Privacy",
      content: "Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children."
    },
    {
      id: "changes",
      title: "10. Changes to This Policy",
      content: "We may update this Privacy Policy periodically. We will notify you of any changes by posting the new policy on this page and updating the effective date."
    }
  ]

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="h-8 w-8 text-orange-500" />
                <CardTitle className="text-2xl font-bold text-center">
                  Privacy Policy
                </CardTitle>
              </div>
              <div className="text-center text-muted-foreground space-y-1">
                <p>Effective Date: May 23, 2025</p>
                <p>Last Updated: May 23, 2025</p>
                <p>Company Name: Jingally Logistics</p>
                <p>Website: www.jingally.com</p>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-6">
            {sections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{section.content}</p>
                  {section.list && (
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      {section.list.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-500" />
                    <a href="mailto:privacy@jingally.com" className="text-orange-500 hover:underline">
                      privacy@jingally.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-500" />
                    <a href="tel:+4402080909183" className="text-orange-500 hover:underline">
                      (+440) 2080909183
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-orange-500" />
                    <a href="https://www.jingally.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                      www.jingally.com
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
