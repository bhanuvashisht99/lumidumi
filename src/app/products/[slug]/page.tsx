'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProductBySlug } from '@/lib/database'
import { useCart } from '@/contexts/CartContext'
import ImprovedColorSelector from '@/components/ImprovedColorSelector'

interface ProductImage {
  id: string
  url: string
  alt_text?: string
  is_primary: boolean
  sort_order: number
}

interface ProductColor {
  id: string
  color_name: string
  color_code: string
  stock_quantity: number
  price_modifier: number
  is_available: boolean
  image_urls?: string[]
  primary_image?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart, isInCart, getCartItemQuantity } = useCart()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    if (params.slug) {
      loadProduct(params.slug as string)
    }
  }, [params.slug])

  const loadProduct = async (slug: string) => {
    try {
      console.log('🔍 Loading product with slug:', slug)
      setLoading(true)
      setError(null)

      const productData = await getProductBySlug(slug)
      console.log('📦 Product data received:', productData)

      if (!productData) {
        console.log('❌ No product data found')
        setError('Product not found')
        setLoading(false)
        return
      }

      // Fetch images and colors in parallel
      const productId = (productData as any)?.id
      if (!productId) {
        console.log('❌ No product ID found')
        setError('Invalid product data')
        setLoading(false)
        return
      }

      const [imagesResponse, colorsResponse] = await Promise.all([
        fetch(`/api/admin/products/${productId}/images`).catch(e => {
          console.error('Images fetch error:', e)
          return { ok: false }
        }),
        fetch(`/api/admin/products/${productId}/colors`).catch(e => {
          console.error('Colors fetch error:', e)
          return { ok: false }
        })
      ])

      console.log('📸 Images response:', imagesResponse.ok, 'status' in imagesResponse ? imagesResponse.status : 'unknown')
      console.log('🎨 Colors response:', colorsResponse.ok, 'status' in colorsResponse ? colorsResponse.status : 'unknown')

      const images = imagesResponse.ok && 'json' in imagesResponse ? await imagesResponse.json() : []
      const colors = colorsResponse.ok && 'json' in colorsResponse ? await colorsResponse.json() : []

      console.log('📸 Images received:', images)
      console.log('🎨 Colors received:', colors)

      const productWithDetails = { ...(productData as any), images, colors }
      console.log('✅ Setting product with details:', productWithDetails)
      setProduct(productWithDetails)

      // Set initial images
      const initialImages = Array.isArray(images)
        ? images.map((img: ProductImage) => img.url).filter(url => url && typeof url === 'string')
        : []

      console.log('🖼️ Initial images:', initialImages)
      setCurrentImages(initialImages)
      setCurrentPrice((productData as any).price)

      // If no colors, just use product images
      if (!colors || colors.length === 0) {
        console.log('ℹ️ No colors found, using product images only')
        setSelectedImageIndex(0)
      }

    } catch (error) {
      console.error('❌ Error loading product:', error)
      setError('Failed to load product')
    } finally {
      console.log('✅ Setting loading to false')
      setLoading(false)
    }
  }

  const handleColorChange = (color: ProductColor) => {
    console.log('🎨 Color changed to:', color.color_name)
    console.log('🖼️ Color image URLs:', color.image_urls)

    setSelectedColor(color)

    if (product) {
      const newPrice = product.price + (color.price_modifier || 0)
      setCurrentPrice(newPrice)
      console.log('💰 Price updated to:', newPrice)
    }

    // Handle image switching
    let imagesToUse = []

    // Try color-specific images first
    if (color.image_urls && Array.isArray(color.image_urls) && color.image_urls.length > 0) {
      const validColorImages = color.image_urls.filter(url => {
        return url && typeof url === 'string' && !url.includes('blob:')
      })

      if (validColorImages.length > 0) {
        console.log('✅ Using color-specific images:', validColorImages)
        imagesToUse = validColorImages
      }
    }

    // Fallback to product images if no color images
    if (imagesToUse.length === 0 && product?.images) {
      const productImages = product.images
        .map((img: ProductImage) => img.url)
        .filter((url: any) => url && typeof url === 'string' && !url.includes('blob:'))

      console.log('🔄 Falling back to product images:', productImages)
      imagesToUse = productImages
    }

    // Update images and reset to first image
    setCurrentImages(imagesToUse)
    setSelectedImageIndex(0)

    console.log('🖼️ Final images to use:', imagesToUse)
  }

  const nextImage = () => {
    if (currentImages.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % currentImages.length)
    }
  }

  const prevImage = () => {
    if (currentImages.length > 1) {
      setSelectedImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)
    }
  }

  // Touch handlers for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentImages.length > 1) {
      nextImage()
    }
    if (isRightSwipe && currentImages.length > 1) {
      prevImage()
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cream-300 mx-auto"></div>
          <p className="mt-4 text-charcoal/60">Loading product...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal mb-4">
            {error || 'Product Not Found'}
          </h1>
          <button
            onClick={() => router.push('/products')}
            className="btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-charcoal/60 mb-8">
          <button type="button" onClick={() => router.push('/')} className="hover:text-charcoal">Home</button>
          <span>/</span>
          <button type="button" onClick={() => router.push('/products')} className="hover:text-charcoal">Products</button>
          <span>/</span>
          <span className="text-charcoal font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="aspect-square bg-cream-100 rounded-lg overflow-hidden relative group select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {currentImages.length > 0 ? (
                <>
                  <img
                    src={currentImages[selectedImageIndex]}
                    alt={`${product.name} - ${selectedColor?.color_name || 'Product'}`}
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => {
                      console.error('Image failed to load:', currentImages[selectedImageIndex])
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1ZjNmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+'
                    }}
                    draggable={false}
                  />

                  {/* Navigation arrows */}
                  {currentImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ←
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        →
                      </button>
                    </>
                  )}

                  {/* Image counter and swipe indicator */}
                  {currentImages.length > 1 && (
                    <>
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded">
                        {selectedImageIndex + 1} / {currentImages.length}
                      </div>
                      {/* Mobile swipe indicator */}
                      <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded sm:hidden">
                        👈 Swipe 👉
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🕯️</div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {currentImages.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {currentImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImageIndex === index
                      ? 'border-cream-300 shadow-md scale-105'
                      : 'border-cream-200 hover:border-cream-300 active:scale-95'
                      }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-charcoal mb-2">{product.name}</h1>
              <p className="text-2xl font-bold text-cream-300">₹{currentPrice.toLocaleString()}</p>
              {selectedColor && selectedColor.price_modifier !== 0 && (
                <p className="text-sm text-charcoal/60">
                  Base price: ₹{product.price.toLocaleString()}
                  {selectedColor.price_modifier > 0 ? ' + ' : ' - '}
                  ₹{Math.abs(selectedColor.price_modifier).toLocaleString()} for {selectedColor.color_name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">Description</h3>
              <p className="text-charcoal/70 leading-relaxed">{product.description}</p>
            </div>

            {/* Scent Description */}
            {product.scent_description && (
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Scent Profile</h3>
                <p className="text-charcoal/70 leading-relaxed">{product.scent_description}</p>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <ImprovedColorSelector
                colors={product.colors}
                basePrice={product.price}
                onColorChange={handleColorChange}
                variantLabel={product.name.toLowerCase().includes('set of 3') ? 'Get Random 3' : 'Color'}
                useImageSwatches={product.name.toLowerCase().includes('set of 3')}
                className="mb-8"
              />
            )}

            {/* Product Details */}
            <div className="space-y-3 text-sm">
              {product.weight && (
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Weight:</span>
                  <span className="text-charcoal">{product.weight}g</span>
                </div>
              )}
              {product.burn_time && (
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Burn Time:</span>
                  <span className="text-charcoal">{product.burn_time} hours</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Dimensions:</span>
                  <span className="text-charcoal">{product.dimensions}</span>
                </div>
              )}
              {product.material && (
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Material:</span>
                  <span className="text-charcoal">{product.material}</span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.stock_quantity > 0 ? (
                <div className="flex items-center text-green-700 font-medium">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  In Stock
                </div>
              ) : (
                <div className="flex items-center text-red-600 font-medium">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Out of Stock
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => addToCart({
                ...product,
                price: currentPrice,
                image_url: currentImages[selectedImageIndex] // Use the currently displayed image
              })}
              className="w-full btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0"
              disabled={product.stock_quantity === 0}
            >
              {product.stock_quantity === 0
                ? 'Out of Stock'
                : isInCart(product.id)
                  ? `In Cart (${getCartItemQuantity(product.id)}) - Add More`
                  : 'Add to Cart'
              }
            </button>

            {/* Care Instructions */}
            {product.care_instructions && (
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Care Instructions</h3>
                <p className="text-charcoal/70 leading-relaxed text-sm">{product.care_instructions}</p>
              </div>
            )}

            {/* Ingredients */}
            {product.ingredients && (
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">Ingredients</h3>
                <p className="text-charcoal/70 leading-relaxed text-sm">{product.ingredients}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}