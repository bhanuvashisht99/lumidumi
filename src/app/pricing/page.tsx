export default function PricingPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-charcoal mb-4">Our Products & Pricing</h1>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto">
            Transparent pricing for our handcrafted candle collections and custom services
          </p>
        </div>

        {/* Product Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Standard Collection */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🕯️</div>
              <h3 className="text-2xl font-bold text-charcoal mb-2">Standard Collection</h3>
              <p className="text-charcoal/60">Our signature handcrafted candles</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-charcoal/70">Mini Candles (50g)</span>
                <span className="font-semibold text-charcoal">₹299 - ₹399</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Regular Candles (100g)</span>
                <span className="font-semibold text-charcoal">₹599 - ₹799</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Large Candles (200g)</span>
                <span className="font-semibold text-charcoal">₹899 - ₹1,199</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Gift Sets (3 pieces)</span>
                <span className="font-semibold text-charcoal">₹1,499 - ₹1,999</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-cream-200">
              <p className="text-sm text-charcoal/60">
                Includes: Premium natural wax, cotton wick, elegant packaging
              </p>
            </div>
          </div>

          {/* Premium Collection */}
          <div className="bg-cream-300 text-white rounded-2xl p-8 shadow-lg transform scale-105">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-2xl font-bold mb-2">Premium Collection</h3>
              <p className="text-white/80">Luxury candles with exclusive scents</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white/80">Luxury Mini (50g)</span>
                <span className="font-semibold">₹499 - ₹699</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Luxury Regular (100g)</span>
                <span className="font-semibold">₹899 - ₹1,299</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Luxury Large (200g)</span>
                <span className="font-semibold">₹1,499 - ₹1,999</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Premium Gift Sets</span>
                <span className="font-semibold">₹2,499 - ₹3,999</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-sm text-white/80">
                Includes: Premium soy wax, wooden wick, luxury packaging, unique scents
              </p>
            </div>
            <div className="mt-6">
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Most Popular</span>
            </div>
          </div>

          {/* Custom Collection */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-charcoal mb-2">Custom Orders</h3>
              <p className="text-charcoal/60">Personalized candles for special occasions</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-charcoal/70">Custom Scent Blend</span>
                <span className="font-semibold text-charcoal">+₹200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Custom Label/Design</span>
                <span className="font-semibold text-charcoal">+₹150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Special Packaging</span>
                <span className="font-semibold text-charcoal">+₹100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Bulk Orders (10+)</span>
                <span className="font-semibold text-charcoal">10% Off</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-cream-200">
              <p className="text-sm text-charcoal/60">
                Minimum order: 5 pieces. Lead time: 7-10 days
              </p>
            </div>
          </div>
        </div>

        {/* Shipping & Services */}
        <div className="bg-white rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-charcoal text-center mb-8">Shipping & Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4">🚚</div>
              <h3 className="font-semibold text-charcoal mb-2">Free Shipping</h3>
              <p className="text-sm text-charcoal/60">On orders above ₹999</p>
              <p className="text-sm text-charcoal/60">Standard shipping: ₹99</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-semibold text-charcoal mb-2">Express Delivery</h3>
              <p className="text-sm text-charcoal/60">Same day delivery available</p>
              <p className="text-sm text-charcoal/60">Metro cities: ₹199</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="font-semibold text-charcoal mb-2">Easy Returns</h3>
              <p className="text-sm text-charcoal/60">30-day return policy</p>
              <p className="text-sm text-charcoal/60">Full refund guarantee</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="font-semibold text-charcoal mb-2">Customer Support</h3>
              <p className="text-sm text-charcoal/60">24/7 assistance</p>
              <p className="text-sm text-charcoal/60">Email & phone support</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-cream-100 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-charcoal text-center mb-8">Secure Payment Options</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">💳</div>
              <p className="text-sm font-medium text-charcoal">Credit/Debit Cards</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">📱</div>
              <p className="text-sm font-medium text-charcoal">UPI Payments</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">🏦</div>
              <p className="text-sm font-medium text-charcoal">Net Banking</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-sm font-medium text-charcoal">Cash on Delivery</p>
            </div>
          </div>
          <p className="text-center text-charcoal/60 mt-6">
            All payments are secured by Razorpay with 256-bit SSL encryption
          </p>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-charcoal text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-charcoal mb-2">What materials do you use?</h3>
              <p className="text-charcoal/60 text-sm mb-4">
                We use premium natural soy wax, cotton wicks, and high-quality fragrance oils that are safe and eco-friendly.
              </p>

              <h3 className="font-semibold text-charcoal mb-2">How long do the candles burn?</h3>
              <p className="text-charcoal/60 text-sm mb-4">
                Our 50g candles burn for 12-15 hours, 100g for 25-30 hours, and 200g for 50-60 hours.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal mb-2">Do you offer international shipping?</h3>
              <p className="text-charcoal/60 text-sm mb-4">
                Currently, we deliver within India. International shipping will be available soon.
              </p>

              <h3 className="font-semibold text-charcoal mb-2">Can I track my order?</h3>
              <p className="text-charcoal/60 text-sm mb-4">
                Yes, you'll receive a tracking link via email and SMS once your order is shipped.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}