'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProductBySlug } from '@/lib/database'
import { useCart } from '@/contexts/CartContext'
import ProductColorSelector from '@/components/ProductColorSelector'

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [currentPrice, setCurrentPrice] = useState(0)




  useEffect(() => {
    if (params.slug) {
      loadProduct(params.slug as string)
    }
  }, [params.slug])

  const loadProduct = async (slug: string) => {
    try {
      console.log('🔍 Loading product with slug:', slug)
      setLoading(true)
      const productData = await getProductBySlug(slug)
      console.log('📦 Product data received:', productData)

      if (!productData) {
        console.log('❌ No product data found, redirecting to products')
        router.push('/products')
        return
      }

      // Fetch images and colors
      console.log('🔗 Fetching images and colors for product ID:', productData.id)
      const [imagesResponse, colorsResponse] = await Promise.all([
        fetch(`/api/admin/products/${productData.id}/images`),
        fetch(`/api/admin/products/${productData.id}/colors`)
      ])

      console.log('📸 Images response:', imagesResponse.ok, imagesResponse.status)
      console.log('🎨 Colors response:', colorsResponse.ok, colorsResponse.status)

      const images = imagesResponse.ok ? await imagesResponse.json() : []
      const colors = colorsResponse.ok ? await colorsResponse.json() : []

      console.log('📸 Images received:', images)
      console.log('🎨 Colors received:', colors)

      const productWithDetails = { ...productData, images, colors }
      console.log('✅ Setting product with details:', productWithDetails)
      setProduct(productWithDetails)

      // Set initial images and price
      const initialImages = images.map((img: ProductImage) => img.url)

      // Filter out problematic URLs immediately
      const filteredImages = initialImages.filter((url: any) => {
        if (!url || typeof url !== 'string') return false
        if (url.includes('blob:')) return false
        // Temporarily allow HEIC files (some browsers may not support them)
        // if (url.toLowerCase().includes('.heic') || url.toLowerCase().includes('.heif')) return false
        return url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')
      })
      setCurrentImages(filteredImages)
      setCurrentPrice(productData.price)

      // Set default color if available
      if (colors.length > 0) {
        const defaultColor = colors.find((c: ProductColor) => c.is_available) || colors[0]
        setSelectedColor(defaultColor)
        setCurrentPrice(productData.price + (defaultColor.price_modifier || 0))

        // Update images if color has specific images
        if (defaultColor.image_urls && defaultColor.image_urls.length > 0) {
          setCurrentImages(defaultColor.image_urls)
          setSelectedImageIndex(0)
        }
      }

    } catch (error) {
      console.error('❌ Error loading product:', error)
      router.push('/products')
    } finally {
      console.log('✅ Setting loading to false')
      setLoading(false)
    }
  }

  const handleColorChange = (color: ProductColor) => {
    setSelectedColor(color)
    if (product) {
      const newPrice = product.price + (color.price_modifier || 0)
      setCurrentPrice(newPrice)
    }

    // Try color-specific images first, fallback to product images
    let imagesToUse = []

    // Check if color has valid images
    if (color.image_urls && color.image_urls.length > 0) {
      const filteredColorImages = color.image_urls.filter(url => {
        if (!url || typeof url !== 'string') return false
        if (url.includes('blob:')) return false
        // Temporarily allow HEIC files (they may not display in all browsers)
        return url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')
      })

      if (filteredColorImages.length > 0) {
        imagesToUse = filteredColorImages
      }
    }

    // Fallback to product images if color has no valid images
    if (imagesToUse.length === 0) {
      const productImages = product?.images?.map((img: ProductImage) => img.url) || []
      const filteredProductImages = productImages.filter((url: any) => {
        if (!url || typeof url !== 'string') return false
        if (url.includes('blob:')) return false
        // Temporarily allow HEIC files (they may not display in all browsers)
        return url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')
      })

      // Try to show different images for different colors by starting from different indices
      if (filteredProductImages.length > 1) {
        const colorIndex = product.colors?.findIndex((c: any) => c.id === color.id) || 0
        const startIndex = colorIndex % filteredProductImages.length
        // Rotate the array to start from a different image for each color
        imagesToUse = [
          ...filteredProductImages.slice(startIndex),
          ...filteredProductImages.slice(0, startIndex)
        ]
      } else {
        imagesToUse = filteredProductImages
      }
    }

    setCurrentImages(imagesToUse)
    setSelectedImageIndex(0)
  }

  const handleImageChange = (images: string[], primaryImage?: string) => {
    setCurrentImages(images)
    if (primaryImage) {
      const primaryIndex = images.findIndex(url => url === primaryImage)
      setSelectedImageIndex(primaryIndex >= 0 ? primaryIndex : 0)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cream-300"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal mb-4">Product Not Found</h1>
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
            <div className="aspect-square bg-cream-100 rounded-lg overflow-hidden relative group">
              {currentImages.length > 0 ? (
                <>
                  <img
                    src={currentImages[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If color-specific image fails, fallback to product images
                      if (selectedColor && product.images?.length > 0) {
                        const productImages = product.images.map((img: ProductImage) => img.url)
                        setCurrentImages(productImages)
                        setSelectedImageIndex(0)
                      }
                    }}
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

                  {/* Image counter */}
                  {currentImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded">
                      {selectedImageIndex + 1} / {currentImages.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🕯️</div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {currentImages.length > 0 && (
              <div className="flex space-x-2 overflow-x-auto">
                {currentImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-cream-300' : 'border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
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
              <ProductColorSelector
                colors={product.colors}
                basePrice={product.price}
                onColorChange={handleColorChange}
                onImageChange={handleImageChange}
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
                <p className="text-green-600 text-sm font-medium">✓ In Stock ({product.stock_quantity} available)</p>
              ) : (
                <p className="text-red-600 text-sm font-medium">✗ Out of Stock</p>
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => addToCart({...product, price: currentPrice})}
              className="w-full bg-cream-300 hover:bg-cream-300/90 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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