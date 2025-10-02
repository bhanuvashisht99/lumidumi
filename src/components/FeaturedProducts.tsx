'use client'

export default function FeaturedProducts() {
  const products = [
    {
      id: 1,
      name: 'Vanilla Dreams',
      price: 899,
      image: '🕯️',
      description: 'Warm vanilla with hints of caramel'
    },
    {
      id: 2,
      name: 'Lavender Bliss',
      price: 799,
      image: '🕯️',
      description: 'Calming lavender for relaxation'
    },
    {
      id: 3,
      name: 'Citrus Burst',
      price: 749,
      image: '🕯️',
      description: 'Fresh citrus energizing blend'
    },
    {
      id: 4,
      name: 'Sandalwood Serenity',
      price: 999,
      image: '🕯️',
      description: 'Rich sandalwood with earthy notes'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal mb-4">
            Featured Collection
          </h2>
          <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
            Discover our most beloved candles, each crafted with premium ingredients and unique fragrances
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="card group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-cream-100 rounded-lg mb-4 flex items-center justify-center text-6xl">
                {product.image}
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-charcoal group-hover:text-cream-300 transition-colors">
                  {product.name}
                </h3>
                <p className="text-charcoal/60 text-sm">
                  {product.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-bold text-cream-300">
                    ₹{product.price}
                  </span>
                  <button className="text-sm bg-cream-100 hover:bg-cream-200 px-4 py-2 rounded-lg transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="btn-primary text-lg px-8 py-4">
            View All Products
          </button>
        </div>
      </div>
    </section>
  )
}