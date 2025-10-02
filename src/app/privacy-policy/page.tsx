export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-charcoal mb-8">Privacy Policy</h1>
        <p className="text-sm text-charcoal/60 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">1. Information We Collect</h2>
            <p className="text-charcoal/70 mb-4">
              We collect information you provide directly to us, such as when you create an account, make a purchase,
              or contact us for support.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Personal information (name, email address, phone number)</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information (processed securely through Razorpay)</li>
              <li>Order history and preferences</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">2. How We Use Your Information</h2>
            <p className="text-charcoal/70 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Provide customer support</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Improve our products and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">3. Information Sharing</h2>
            <p className="text-charcoal/70 mb-4">
              We do not sell, rent, or share your personal information with third parties except as described in this policy:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>With service providers who help us operate our business (payment processors, shipping companies)</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or merger</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">4. Payment Security</h2>
            <p className="text-charcoal/70 mb-4">
              We use Razorpay for payment processing. Your payment information is processed securely and we do not store
              your credit card details on our servers. Razorpay complies with PCI DSS standards for secure payment processing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">5. Data Security</h2>
            <p className="text-charcoal/70 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">6. Your Rights</h2>
            <p className="text-charcoal/70 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Access and update your personal information</li>
              <li>Delete your account and personal data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>File a complaint with supervisory authorities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">7. Cookies and Tracking</h2>
            <p className="text-charcoal/70 mb-4">
              We use cookies and similar technologies to enhance your browsing experience, analyze site traffic,
              and remember your preferences. You can control cookie settings through your browser.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">8. Contact Us</h2>
            <p className="text-charcoal/70">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-cream-50 rounded-lg">
              <p className="font-medium">Lumidumi</p>
              <p>Email: privacy@lumidumi.com</p>
              <p>Phone: +91 98765 43210</p>
              <p>Address: 123 Artisan Lane, Craftsville, CS 12345, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}