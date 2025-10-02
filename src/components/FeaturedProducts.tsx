'use client'

import { useState, useEffect } from 'react'
import { getProducts, Product } from '@/lib/database'
import { useCart } from '@/contexts/CartContext'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart, isInCart, getCartItemQuantity } = useCart()

  useEffect(() => {
    async function loadProducts() {
      try {
        // Check if we're in a browser environment with valid Supabase config
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
          const featuredProducts = await getProducts(true) // Get only featured products
          setProducts(featuredProducts)
        } else {
          throw new Error('Supabase not configured or running on server')
        }
      } catch (error) {
        console.error('Error loading products:', error)
        // Fallback to hardcoded products if database fails
        setProducts([
          {
            id: '1',
            name: 'Vanilla Dreams',
            price: 899,
            scent_description: 'Warm vanilla with hints of caramel',
            description: 'Handcrafted vanilla candle with hints of caramel',
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
            description: 'Calming lavender candle for relaxation',
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
            description: 'Energizing citrus blend candle',
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
            description: 'Rich sandalwood candle with earthy notes',
            stock_quantity: 12,
            is_active: true,
            featured: true,
            slug: 'sandalwood-serenity',
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="card group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-cream-100 rounded-lg mb-4 flex items-center justify-center text-6xl">
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

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-charcoal group-hover:text-cream-300 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-charcoal/60 text-sm">
                    {product.scent_description || product.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-cream-300">
                      ₹{product.price}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="text-sm bg-cream-100 hover:bg-cream-200 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      disabled={product.stock_quantity === 0}
                    >
                      {product.stock_quantity === 0
                        ? 'Out of Stock'
                        : isInCart(product.id)
                        ? `In Cart (${getCartItemQuantity(product.id)})`
                        : 'Add to Cart'
                      }
                    </button>
                  </div>
                  {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                    <p className="text-orange-600 text-xs">Only {product.stock_quantity} left!</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button className="btn-primary text-lg px-8 py-4">
            View All Products
          </button>
        </div>
      </div>
    </section>
  )
}