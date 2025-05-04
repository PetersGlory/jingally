import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Help & Support | Jingally",
  description: "Get help and support for your Jingally account. Find answers to common questions and contact our support team.",
}

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Help & Support</h1>
      
      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium mb-2">What is Jingally?</h3>
            <p className="text-gray-600">
              Jingally is a platform that helps you manage and optimize your business operations. We provide tools and features to streamline your workflow and improve productivity.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium mb-2">How do I get started?</h3>
            <p className="text-gray-600">
              Getting started is easy! Simply create an account, complete your profile setup, and you'll have access to all our features. Our onboarding process will guide you through the initial setup.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium mb-2">What are the pricing plans?</h3>
            <p className="text-gray-600">
              We offer various pricing plans to suit different business needs. You can find detailed information about our pricing on the pricing page or contact our sales team for a custom quote.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium mb-2">How can I manage my account?</h3>
            <p className="text-gray-600">
              You can manage your account settings, update your profile, and modify your subscription through the dashboard. If you need assistance, our support team is always ready to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Contact Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium mb-4">Support</h3>
            <p className="text-gray-600 mb-4">
              Our support team is available 24/7 to help you with any questions or issues you may have.
            </p>
            <div className="space-y-2">
              <p className="flex items-center">
                <span className="font-medium mr-2">Email:</span>
                support@jingally.com
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">Phone:</span>
                <a href="tel:+2349063632381" className="text-blue-500 hover:underline">
                  (+234)9063632381
                </a>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium mb-4">Business Inquiries</h3>
            <p className="text-gray-600 mb-4">
              For partnership opportunities or business-related questions, please contact our business team.
            </p>
            <div className="space-y-2">
              <p className="flex items-center">
                <span className="font-medium mr-2">Email:</span>
                business@jingally.com
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">Phone:</span>
                <a href="tel:+4402080909183" className="text-blue-500 hover:underline">
                  (+440)2080909183
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
