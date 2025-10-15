'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProducts, Product } from '@/lib/database'
import { useCart } from '@/contexts/CartContext'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// ProductCard component with image carousel
function ProductCard({ product, images, hasColors, onClick }: {
  product: Product
  images: any[]
  hasColors: boolean
  onClick: () => void
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addToCart, isInCart, getCartItemQuantity } = useCart()

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const currentImage = images[currentImageIndex] || images[0]

  return (
    <div
      className="card group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="aspect-square bg-cream-100 rounded-lg mb-4 flex items-center justify-center text-8xl overflow-hidden relative">
        {currentImage ? (
          <>
            <img
              src={currentImage.url}
              alt={currentImage.alt_text || product.name}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
              decoding="async"
            />

            {/* Navigation arrows - only show if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-charcoal w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 hover:bg-white hover:scale-110 shadow-lg flex items-center justify-center"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-charcoal w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 hover:bg-white hover:scale-110 shadow-lg flex items-center justify-center"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}

            {/* Image count indicator */}
            {images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                {currentImageIndex + 1}/{images.length}
              </div>
            )}

            {/* Dot indicators */}
            {images.length > 1 && images.length <= 5 && (
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex space-x-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex(index)
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 hover:scale-125 ${
                      currentImageIndex === index ? 'bg-white shadow-sm' : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
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

        {/* Color options */}
        {hasColors && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-charcoal/60">Colors:</span>
            <div className="flex space-x-1">
              {(product as any).colors.slice(0, 4).map((color: any, index: number) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.color_code }}
                  title={`${color.color_name} - ₹${(product.price + (color.price_modifier || 0)).toLocaleString()}`}
                />
              ))}
              {(product as any).colors.length > 4 && (
                <span className="text-xs text-charcoal/60">+{(product as any).colors.length - 4}</span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold text-cream-300">
            ₹{product.price.toLocaleString()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              addToCart(product)
            }}
            className="bg-cream-300 hover:bg-cream-300/90 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <p className="text-orange-600 text-xs font-medium">Only {product.stock_quantity} left in stock!</p>
        )}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { addToCart, isInCart, getCartItemQuantity } = useCart()

  const loadProducts = async () => {
    try {
      setLoading(true)
      const allProducts = await getProducts()

      // Load products first, then lazy load images and colors
      setProducts(allProducts.map(product => ({ ...product, images: [], colors: [] })))
      setLoading(false)

      // Batch load images and colors for visible products (first 6)
      const visibleProducts = allProducts.slice(0, 6)
      const productsWithDetails = await Promise.all(
        visibleProducts.map(async (product: Product) => {
          try {
            // Fetch product images and colors in parallel
            const [imagesResponse, colorsResponse] = await Promise.all([
              fetch(`/api/admin/products/${product.id}/images`),
              fetch(`/api/admin/products/${product.id}/colors`)
            ])

            const images = imagesResponse.ok ? await imagesResponse.json() : []
            const colors = colorsResponse.ok ? await colorsResponse.json() : []

            return { ...product, images, colors }
          } catch (error) {
            console.error(`Error fetching details for product ${product.id}:`, error)
            return { ...product, images: [], colors: [] }
          }
        })
      )

      // Update products with details
      setProducts(prevProducts =>
        prevProducts.map(product => {
          const updatedProduct = productsWithDetails.find(p => p.id === product.id)
          return updatedProduct || product
        })
      )

      // Load remaining products in background
      if (allProducts.length > 6) {
        const remainingProducts = allProducts.slice(6)
        setTimeout(async () => {
          const remainingWithDetails = await Promise.all(
            remainingProducts.map(async (product: Product) => {
              try {
                const [imagesResponse, colorsResponse] = await Promise.all([
                  fetch(`/api/admin/products/${product.id}/images`),
                  fetch(`/api/admin/products/${product.id}/colors`)
                ])

                const images = imagesResponse.ok ? await imagesResponse.json() : []
                const colors = colorsResponse.ok ? await colorsResponse.json() : []

                return { ...product, images, colors }
              } catch (error) {
                console.error(`Error fetching details for product ${product.id}:`, error)
                return { ...product, images: [], colors: [] }
              }
            })
          )

          setProducts(prevProducts =>
            prevProducts.map(product => {
              const updatedProduct = remainingWithDetails.find(p => p.id === product.id)
              return updatedProduct || product
            })
          )
        }, 100)
      }
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
    }
  }

  useEffect(() => {
    loadProducts()

    // Listen for product updates from admin panel
    const handleProductUpdate = (event: MessageEvent) => {
      if (event.data.type === 'PRODUCTS_UPDATED') {
        console.log('Received product update notification, refreshing products...')
        loadProducts()
      }
    }

    window.addEventListener('message', handleProductUpdate)

    return () => {
      window.removeEventListener('message', handleProductUpdate)
    }
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
            {filteredProducts.map((product) => {
              const productImages = (product as any).images || []
              const hasColors = (product as any).colors && (product as any).colors.length > 0

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  images={productImages}
                  hasColors={hasColors}
                  onClick={() => {
                    const productSlug = product.slug || product.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || product.id
                    router.push(`/products/${productSlug}`)
                  }}
                />
              )
            })}
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