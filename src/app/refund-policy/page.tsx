export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-charcoal mb-8">Refund & Return Policy</h1>
        <p className="text-sm text-charcoal/60 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">30-Day Return Policy</h2>
            <p className="text-charcoal/70 mb-4">
              We want you to be completely satisfied with your Lumidumi candles. If you're not happy with your purchase,
              you can return it within 30 days of delivery for a full refund or exchange.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Eligible Returns</h2>
            <p className="text-charcoal/70 mb-4">Items eligible for return must be:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Unused and in original condition</li>
              <li>In original packaging with all labels and tags</li>
              <li>Returned within 30 days of delivery</li>
              <li>Not personalized or custom-made items (unless defective)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Non-Returnable Items</h2>
            <p className="text-charcoal/70 mb-4">The following items cannot be returned:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Used or burned candles</li>
              <li>Custom or personalized orders (unless defective)</li>
              <li>Gift cards</li>
              <li>Sale or clearance items (unless defective)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Return Process</h2>
            <p className="text-charcoal/70 mb-4">To initiate a return:</p>
            <ol className="list-decimal pl-6 space-y-2 text-charcoal/70">
              <li>Contact us at returns@lumidumi.com or +91 93548 51086</li>
              <li>Provide your order number and reason for return</li>
              <li>We'll send you a return authorization and instructions</li>
              <li>Pack items securely in original packaging</li>
              <li>Ship to our returns address (prepaid shipping label provided)</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Refund Processing</h2>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Refunds are processed within 5-7 business days after we receive your return</li>
              <li>Refunds are issued to the original payment method</li>
              <li>You'll receive an email confirmation when your refund is processed</li>
              <li>Bank processing times may vary (3-10 business days)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Exchanges</h2>
            <p className="text-charcoal/70 mb-4">
              We offer exchanges for different sizes, colors, or scents (subject to availability).
              The exchange process follows the same steps as returns, but you'll receive a new product instead of a refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Damaged or Defective Items</h2>
            <p className="text-charcoal/70 mb-4">
              If you receive a damaged or defective product:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Contact us within 48 hours of delivery</li>
              <li>Provide photos of the damage</li>
              <li>We'll arrange immediate replacement or full refund</li>
              <li>Return shipping is free for defective items</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Shipping Costs</h2>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>We provide prepaid return labels for most returns</li>
              <li>Return shipping is free for defective or incorrect items</li>
              <li>Original shipping costs are non-refundable (unless our error)</li>
              <li>Free shipping threshold applies to net order value after returns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Custom Orders</h2>
            <p className="text-charcoal/70 mb-4">
              Custom and personalized orders are final sale unless:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>The item is defective or damaged</li>
              <li>We made an error in production</li>
              <li>The item significantly differs from your specifications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Late or Missing Refunds</h2>
            <p className="text-charcoal/70 mb-4">
              If you haven't received your refund within the expected timeframe:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-charcoal/70">
              <li>Check your bank account or credit card statement</li>
              <li>Contact your bank - processing times vary</li>
              <li>Contact us with your order number and refund details</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Contact Us</h2>
            <p className="text-charcoal/70 mb-4">
              For questions about returns or refunds, please contact our customer service team:
            </p>
            <div className="mt-4 p-4 bg-cream-50 rounded-lg">
              <p className="font-medium">Customer Service</p>
              <p>Email: returns@lumidumi.com</p>
              <p>Phone: +91 93548 51086</p>
              <p>Hours: Monday-Friday, 9:00 AM - 6:00 PM IST</p>
              <p>Address: 123 Artisan Lane, Craftsville, CS 12345, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}