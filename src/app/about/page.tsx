export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-charcoal mb-4">About Lumidumi</h1>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto">
            Crafting beautiful, handmade candles that bring warmth and light to your special moments
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-cream-200 rounded-2xl shadow-lg flex items-center justify-center">
              <div className="text-center text-charcoal/40">
                <div className="text-8xl mb-4">✨</div>
                <p className="text-lg">Our Candle Making Process</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-charcoal">Our Story</h2>
            <p className="text-lg text-charcoal/70 leading-relaxed">
              Lumidumi was born from a passion for creating beautiful, sustainable candles that bring joy and tranquility to everyday life.
              Each candle is lovingly handcrafted using traditional techniques combined with modern innovation.
            </p>
            <p className="text-lg text-charcoal/70 leading-relaxed">
              We believe that the perfect candle is more than just wax and wick – it's an experience that engages all your senses
              and creates lasting memories in your home.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-cream-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-charcoal text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="text-xl font-semibold text-charcoal mb-3">Natural Ingredients</h3>
              <p className="text-charcoal/60">
                We use only premium natural wax and carefully sourced fragrances, ensuring a clean burn and authentic scents.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">👐</div>
              <h3 className="text-xl font-semibold text-charcoal mb-3">Handmade Process</h3>
              <p className="text-charcoal/60">
                Each candle is individually crafted with attention to every detail, from pouring to packaging.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-charcoal mb-3">Custom Designs</h3>
              <p className="text-charcoal/60">
                We offer personalized candles for your special moments and occasions, making each piece unique.
              </p>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-charcoal text-center mb-12">Our Crafting Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-cream-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-cream-300">1</span>
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Select Materials</h3>
              <p className="text-sm text-charcoal/60">Premium natural wax and high-quality wicks</p>
            </div>
            <div className="text-center">
              <div className="bg-cream-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-cream-300">2</span>
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Blend Fragrances</h3>
              <p className="text-sm text-charcoal/60">Carefully crafted scent combinations</p>
            </div>
            <div className="text-center">
              <div className="bg-cream-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-cream-300">3</span>
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Hand Pour</h3>
              <p className="text-sm text-charcoal/60">Precision pouring for perfect consistency</p>
            </div>
            <div className="text-center">
              <div className="bg-cream-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-cream-300">4</span>
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Quality Check</h3>
              <p className="text-sm text-charcoal/60">Thorough inspection before packaging</p>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white border border-cream-200 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-charcoal text-center mb-8">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-charcoal mb-4">Company Details</h3>
              <div className="space-y-3 text-charcoal/70">
                <p><strong>Business Name:</strong> Lumidumi Handcrafted Candles</p>
                <p><strong>Founded:</strong> 2024</p>
                <p><strong>Specialization:</strong> Premium Handmade Candles</p>
                <p><strong>Location:</strong> India</p>
                <p><strong>Business Type:</strong> E-commerce / Artisan Crafts</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-charcoal mb-4">Our Commitment</h3>
              <div className="space-y-3 text-charcoal/70">
                <p><strong>Quality Assurance:</strong> Every candle tested for quality</p>
                <p><strong>Customer Service:</strong> 24/7 support available</p>
                <p><strong>Shipping:</strong> Secure packaging, timely delivery</p>
                <p><strong>Returns:</strong> 30-day return policy</p>
                <p><strong>Sustainability:</strong> Eco-friendly materials</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-charcoal mb-4">Ready to Experience Lumidumi?</h2>
          <p className="text-lg text-charcoal/70 mb-8">
            Discover our collection of handcrafted candles and find the perfect scent for your space
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/products" className="btn-primary">
              Shop Our Collection
            </a>
            <a href="/custom-orders" className="btn-secondary">
              Request Custom Order
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}