'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { usePreloadedData } from '@/contexts/DataPreloadContext'

export default function FeaturedProducts() {
  const { addToCart, isInCart, getCartItemQuantity } = useCart()
  const router = useRouter()
  const { publicProducts, isLoading: loading, refreshData } = usePreloadedData()

  // Filter for featured products from the preloaded data (which includes images)
  const products = (publicProducts || []).filter((p: any) => p.featured)

  useEffect(() => {
    // Listen for product updates from admin panel
    const handleProductUpdate = (event: MessageEvent) => {
      if (event.data.type === 'PRODUCTS_UPDATED') {
        console.log('Received product update notification, refreshing...')
        refreshData()
      }
    }

    window.addEventListener('message', handleProductUpdate)

    return () => {
      window.removeEventListener('message', handleProductUpdate)
    }
  }, [refreshData])

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
              <div
                key={product.id}
                className="card group cursor-pointer"
                onClick={() => router.push(`/products/${product.slug}`)}
              >
                <div className="aspect-square bg-cream-100 rounded-lg mb-4 flex items-center justify-center text-6xl">
                  {(() => {
                    const images = (product as any).images || []
                    const primaryImage = images.find((img: any) => img.is_primary) || images[0]
                    const imageUrl = primaryImage?.url || product.image_url
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={primaryImage?.alt_text || product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      '🕯️'
                    )
                  })()}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-charcoal group-hover:text-cream-300 transition-colors">
                    {product.name}
                  </h3>
                  {product.scent_description && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-charcoal/60">Scent:</span>
                      <span className="inline-block bg-cream-100 text-cream-400 text-xs px-2 py-1 rounded-full font-medium">
                        {product.scent_description}
                      </span>
                    </div>
                  )}
                  <p className="text-charcoal/60 text-sm">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-cream-300">
                      ₹{product.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Recalculate the image to ensure we pass the one being displayed
                        const images = (product as any).images || []
                        const primaryImage = images.find((img: any) => img.is_primary) || images[0]
                        const imageUrl = primaryImage?.url || product.image_url

                        addToCart({
                          ...product,
                          image_url: imageUrl
                        })
                      }}
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
                  {/* Stock warning removed per request */}
                  {/* {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                    <p className="text-orange-600 text-xs">Only {product.stock_quantity} left!</p>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/products')}
            className="btn-primary text-lg px-8 py-4 hover:bg-cream-300/90 transition-colors"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  )
}