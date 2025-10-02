export default function About() {
  return (
    <section className="py-20 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-cream-200 rounded-2xl shadow-lg flex items-center justify-center">
              <div className="text-center text-charcoal/40">
                <div className="text-8xl mb-4">✨</div>
                <p className="text-lg">Candle Making Process</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-charcoal mb-4">
                Crafted with Love
              </h2>
              <p className="text-lg text-charcoal/70 leading-relaxed">
                At Lumidumi, every candle tells a story. We believe in the power of handcrafted beauty
                and the warmth that comes from creating something special with your own hands.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🌿</div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-1">Natural Ingredients</h3>
                  <p className="text-charcoal/60">
                    We use only premium natural wax and carefully sourced fragrances
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="text-2xl">👐</div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-1">Handmade Process</h3>
                  <p className="text-charcoal/60">
                    Each candle is individually crafted with attention to every detail
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="text-2xl">🎨</div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-1">Custom Designs</h3>
                  <p className="text-charcoal/60">
                    Personalized candles for your special moments and occasions
                  </p>
                </div>
              </div>
            </div>

            <button className="btn-secondary mt-8">
              Learn More About Our Process
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}