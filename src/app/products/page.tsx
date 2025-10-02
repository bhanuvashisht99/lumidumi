'use client'

import { useState, useEffect } from 'react'
import { getProducts, Product } from '@/lib/database'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    async function loadProducts() {
      try {
        const allProducts = await getProducts()
        setProducts(allProducts)
      } catch (error) {
        console.error('Error loading products:', error)
        // Fallback to sample products
        setProducts([
          {
            id: '1',
            name: 'Vanilla Dreams',
            price: 899,
            scent_description: 'Warm vanilla with hints of caramel',
            description: 'Handcrafted vanilla candle with hints of caramel and warm spices. Perfect for creating a cozy atmosphere.',
            stock_quantity: 15,
            is_active: true,
            featured: true,
            slug: 'vanilla-dreams',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Lavender Bliss',
            price: 799,
            scent_description: 'Calming lavender for relaxation',
            description: 'Calming lavender candle infused with natural lavender essential oils for relaxation and stress relief.',
            stock_quantity: 20,
            is_active: true,
            featured: true,
            slug: 'lavender-bliss',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Citrus Burst',
            price: 749,
            scent_description: 'Fresh citrus energizing blend',
            description: 'Energizing citrus blend with notes of orange, lemon, and grapefruit to brighten any space.',
            stock_quantity: 18,
            is_active: true,
            featured: true,
            slug: 'citrus-burst',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Sandalwood Serenity',
            price: 999,
            scent_description: 'Rich sandalwood with earthy notes',
            description: 'Rich sandalwood candle with earthy undertones, perfect for meditation and peaceful moments.',
            stock_quantity: 12,
            is_active: true,
            featured: true,
            slug: 'sandalwood-serenity',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '5',
            name: 'Rose Garden',
            price: 899,
            scent_description: 'Elegant rose with floral notes',
            description: 'Elegant rose-scented candle with a delicate floral fragrance, ideal for romantic settings.',
            stock_quantity: 14,
            is_active: true,
            featured: false,
            slug: 'rose-garden',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '6',
            name: 'Ocean Breeze',
            price: 849,
            scent_description: 'Fresh ocean and marine scents',
            description: 'Fresh ocean-inspired candle with marine and aquatic notes for a refreshing ambiance.',
            stock_quantity: 16,
            is_active: true,
            featured: false,
            slug: 'ocean-breeze',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'scented', name: 'Scented Candles' },
    { id: 'pillar', name: 'Pillar Candles' },
    { id: 'tea-light', name: 'Tea Light Candles' }
  ]

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.featured === (selectedCategory === 'featured'))

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal mb-4">Our Products</h1>
          <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
            Discover our complete collection of handcrafted candles, each made with premium ingredients and unique fragrances
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-cream-300 text-white'
                  : 'bg-white text-charcoal hover:bg-cream-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-cream-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-cream-200 rounded"></div>
                  <div className="h-4 bg-cream-200 rounded w-3/4"></div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-6 bg-cream-200 rounded w-20"></div>
                    <div className="h-8 bg-cream-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="aspect-square bg-cream-100 rounded-lg mb-4 flex items-center justify-center text-8xl overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    '🕯️'
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-charcoal group-hover:text-cream-300 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-charcoal/60 text-sm leading-relaxed">
                    {product.scent_description || product.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-cream-300">
                      ₹{product.price}
                    </span>
                    <button
                      className="bg-cream-300 hover:bg-cream-300/90 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={product.stock_quantity === 0}
                    >
                      {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                  {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                    <p className="text-orange-600 text-xs font-medium">Only {product.stock_quantity} left in stock!</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-charcoal/60 text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}