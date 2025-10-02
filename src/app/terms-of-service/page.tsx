export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-charcoal mb-8">Terms of Service</h1>
        <p className="text-sm text-charcoal/60 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">1. Acceptance of Terms</h2>
            <p className="text-charcoal/70 mb-4">
              By accessing and using the Lumidumi website and services, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">2. Product Information</h2>
            <p className="text-charcoal/70 mb-4">
              We strive to provide accurate product descriptions, images, and pricing. However:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Colors may vary slightly due to monitor settings</li>
              <li>Handmade products may have slight variations</li>
              <li>We reserve the right to correct errors in pricing or product information</li>
              <li>Product availability is subject to change without notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">3. Orders and Payment</h2>
            <p className="text-charcoal/70 mb-4">
              By placing an order, you agree to the following terms:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>All orders are subject to availability and acceptance</li>
              <li>Payment must be received before order processing</li>
              <li>We accept payments through Razorpay (credit cards, debit cards, UPI, net banking)</li>
              <li>Prices include applicable taxes (GST)</li>
              <li>We reserve the right to cancel orders for any reason</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">4. Shipping and Delivery</h2>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Delivery times are estimates and not guaranteed</li>
              <li>Risk of loss passes to you upon delivery</li>
              <li>We are not responsible for delays due to weather, natural disasters, or courier issues</li>
              <li>You must inspect products upon delivery and report damage within 48 hours</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">5. Returns and Refunds</h2>
            <p className="text-charcoal/70 mb-4">
              Please refer to our detailed <a href="/refund-policy" className="text-cream-300 hover:underline">Refund Policy</a> for complete information about returns, exchanges, and refunds.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">6. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>You are responsible for maintaining account security</li>
              <li>Provide accurate and complete information</li>
              <li>You are responsible for all activities under your account</li>
              <li>Notify us immediately of unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">7. Intellectual Property</h2>
            <p className="text-charcoal/70 mb-4">
              All content on this website, including text, images, designs, and trademarks, is the property of Lumidumi
              and is protected by intellectual property laws. You may not use our content without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">8. Limitation of Liability</h2>
            <p className="text-charcoal/70 mb-4">
              Lumidumi shall not be liable for any indirect, incidental, special, or consequential damages arising from
              the use of our products or services. Our liability is limited to the purchase price of the product.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">9. Governing Law</h2>
            <p className="text-charcoal/70 mb-4">
              These terms are governed by the laws of India. Any disputes will be resolved in the courts of
              [Your Jurisdiction], India.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">10. Changes to Terms</h2>
            <p className="text-charcoal/70 mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
              Continued use of our services constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">11. Contact Information</h2>
            <div className="mt-4 p-4 bg-cream-50 rounded-lg">
              <p className="font-medium">Lumidumi</p>
              <p>Email: support@lumidumi.com</p>
              <p>Phone: +91 98765 43210</p>
              <p>Address: 123 Artisan Lane, Craftsville, CS 12345, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}