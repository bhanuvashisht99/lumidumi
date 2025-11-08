export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-charcoal mb-8">Shipping Policy</h1>
        <p className="text-sm text-charcoal/60 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Shipping Areas</h2>
            <p className="text-charcoal/70 mb-4">
              We currently ship within India to all major cities and towns. International shipping will be available soon.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>All major metros: Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad</li>
              <li>Tier 2 cities and towns across India</li>
              <li>Remote areas may have extended delivery times</li>
              <li>PO Box addresses are not supported</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Shipping Costs</h2>
            <div className="bg-cream-50 p-6 rounded-lg mb-4">
              <h3 className="font-semibold text-charcoal mb-3">Free Shipping</h3>
              <p className="text-charcoal/70">
                ✅ Orders above ₹1,999 qualify for free shipping across India
              </p>
            </div>

            <div className="space-y-4">
              <div className="border border-cream-200 p-4 rounded-lg">
                <h4 className="font-medium text-charcoal mb-2">Standard Shipping</h4>
                <ul className="text-sm text-charcoal/70 space-y-1">
                  <li>Metro cities: ₹99</li>
                  <li>Other cities: ₹149</li>
                  <li>Remote areas: ₹199</li>
                </ul>
              </div>

              <div className="border border-cream-200 p-4 rounded-lg">
                <h4 className="font-medium text-charcoal mb-2">Express Shipping</h4>
                <ul className="text-sm text-charcoal/70 space-y-1">
                  <li>Metro cities: ₹199</li>
                  <li>Other cities: ₹249</li>
                  <li>Available for orders placed before 2 PM</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Delivery Time</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-cream-200 p-4 rounded-lg">
                <h4 className="font-medium text-charcoal mb-3">Standard Delivery</h4>
                <ul className="text-sm text-charcoal/70 space-y-1">
                  <li>Metro cities: 3-5 business days</li>
                  <li>Other cities: 5-7 business days</li>
                  <li>Remote areas: 7-10 business days</li>
                </ul>
              </div>

              <div className="border border-cream-200 p-4 rounded-lg">
                <h4 className="font-medium text-charcoal mb-3">Express Delivery</h4>
                <ul className="text-sm text-charcoal/70 space-y-1">
                  <li>Metro cities: 1-2 business days</li>
                  <li>Other cities: 2-3 business days</li>
                  <li>Order before 2 PM for same-day processing</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Order Processing</h2>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Orders are processed within 1-2 business days</li>
              <li>Custom orders may take 7-10 business days to craft</li>
              <li>Processing time is separate from shipping time</li>
              <li>Orders placed on weekends are processed on Monday</li>
              <li>You'll receive a tracking number once your order ships</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Packaging</h2>
            <p className="text-charcoal/70 mb-4">
              We take special care in packaging your candles to ensure they arrive safely:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Eco-friendly packaging materials</li>
              <li>Secure bubble wrap and cushioning</li>
              <li>Individual candle protection</li>
              <li>Branded packaging for gift orders</li>
              <li>Fragile handling instructions for couriers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Tracking Your Order</h2>
            <ol className="list-decimal pl-6 space-y-2 text-charcoal/70">
              <li>You'll receive an order confirmation email immediately after purchase</li>
              <li>A shipping confirmation with tracking number will be sent when your order ships</li>
              <li>Track your package using the provided tracking number</li>
              <li>Receive delivery confirmation and feedback request</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Delivery Instructions</h2>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Someone must be available to receive the package</li>
              <li>Valid photo ID may be required</li>
              <li>Inspect package for damage before accepting delivery</li>
              <li>Report any damage or missing items within 48 hours</li>
              <li>Safe drop-off can be arranged for repeat customers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Shipping Restrictions</h2>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-medium text-charcoal mb-2">⚠️ Important Notes:</h4>
              <ul className="text-sm text-charcoal/70 space-y-1">
                <li>Candles may be affected by extreme temperatures</li>
                <li>We don't ship during extreme weather conditions</li>
                <li>Some remote PIN codes may not be serviceable</li>
                <li>Hazardous material shipping restrictions apply</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Delays and Issues</h2>
            <p className="text-charcoal/70 mb-4">
              While we strive for timely delivery, delays may occur due to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>Weather conditions and natural disasters</li>
              <li>Local holidays and festivals</li>
              <li>Courier partner issues</li>
              <li>Incorrect or incomplete address</li>
              <li>Customs clearance (for future international shipping)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Address Changes</h2>
            <p className="text-charcoal/70 mb-4">
              Address changes are possible only if:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal/70">
              <li>The order hasn't been processed yet</li>
              <li>You contact us within 2 hours of placing the order</li>
              <li>The new address is in the same shipping zone</li>
              <li>Additional shipping charges may apply</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Contact Us</h2>
            <p className="text-charcoal/70 mb-4">
              For shipping-related questions or issues:
            </p>
            <div className="mt-4 p-4 bg-cream-50 rounded-lg">
              <p className="font-medium">Shipping Support</p>
              <p>Email: shipping@lumidumi.com</p>
              <p>Phone: +91 93548 51086</p>
              <p>WhatsApp: +91 93548 51086</p>
              <p>Hours: Monday-Saturday, 9:00 AM - 7:00 PM IST</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}