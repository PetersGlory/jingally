"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone, Globe } from "lucide-react"

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    {
      id: "general",
      title: "1. General Terms of Use",
      content: "By accessing and using the Jingally Logistics website or services, you agree to be bound by the following Terms and Conditions. These terms may be updated periodically, and your continued use of the services constitutes acceptance of those changes."
    },
    {
      id: "scope",
      title: "2. Scope of Services",
      content: "Jingally Logistics provides local and international shipping, freight forwarding, customs clearance, warehousing, and last-mile delivery services. Additional services may include eCommerce logistics support, express delivery, and fulfillment."
    },
    {
      id: "prohibited",
      title: "3. Prohibited Shipments",
      content: "The following items may not be shipped via Jingally Logistics under any circumstances:",
      list: [
        "Firearms, ammunition, or weapons",
        "Explosives or hazardous materials",
        "Live animals or perishable biological substances",
        "Counterfeit goods or items prohibited by law in the origin or destination country",
        "Human remains",
        "Illegal drugs or narcotics"
      ]
    },
    {
      id: "customs",
      title: "4. Customs Clearance",
      content: "By using Jingally Logistics for international shipments, you authorize us or our designated agent to act as your representative with customs and other government authorities. You are responsible for providing accurate documentation and may be liable for duties, taxes, or customs penalties."
    },
    {
      id: "liability",
      title: "5. Liability and Limitations",
      content: "Jingally Logistics' liability is limited as follows:",
      list: [
        "For loss or damage to parcels, our maximum liability is $100 USD or equivalent, unless declared value coverage was purchased at the time of shipment.",
        "We are not liable for delays caused by customs, acts of nature, government action, or incorrect addresses provided by the sender."
      ]
    },
    {
      id: "delivery",
      title: "6. Delivery Timeframes",
      content: "Delivery estimates are not guaranteed. While we strive to meet delivery schedules, unforeseen events may cause delays. Jingally is not liable for any direct or indirect losses resulting from delayed deliveries."
    },
    {
      id: "conduct",
      title: "7. User Conduct on Website",
      content: "By accessing www.jingally.com, you agree not to:",
      list: [
        "Violate any applicable law or regulation",
        "Interfere with the security or functionality of our website",
        "Use our website to distribute spam, malware, or unauthorized advertisements"
      ]
    },
    {
      id: "property",
      title: "8. Intellectual Property",
      content: "All content on www.jingally.com including text, images, logos, and designs are the property of Jingally Logistics or its licensors. Reproduction or redistribution without express written permission is prohibited."
    },
    {
      id: "indemnification",
      title: "9. Indemnification",
      content: "You agree to indemnify and hold harmless Jingally Logistics and its affiliates, employees, and agents from any claims or liabilities resulting from your use of our services, website, or any violation of these Terms."
    },
    {
      id: "governing",
      title: "10. Governing Law",
      content: "These Terms and Conditions are governed by the laws of the United Kingdom. Any disputes shall be resolved under the exclusive jurisdiction of the courts of London, England."
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
              <CardTitle className="text-2xl font-bold text-center">
                Terms and Conditions of Jingally Logistics
              </CardTitle>
              <div className="text-center text-muted-foreground space-y-1">
                <p>Effective Date: May 23, 2025</p>
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
                  If you have any questions or concerns regarding these Terms, please contact:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-500" />
                    <a href="mailto:support@jingally.com" className="text-orange-500 hover:underline">
                      support@jingally.com
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
