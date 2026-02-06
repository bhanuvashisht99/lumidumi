'use client'

import { useState, useEffect } from 'react'

interface ColorVariant {
  id: string
  color_name: string
  color_code: string
  stock_quantity: number
  price_modifier: number
  is_available: boolean
  image_urls?: string[]
  primary_image?: string
}

interface ImprovedColorSelectorProps {
  colors: ColorVariant[]
  basePrice: number
  onColorChange?: (color: ColorVariant) => void
  className?: string
  variantLabel?: string
  useImageSwatches?: boolean
}

export default function ImprovedColorSelector({
  colors = [],
  basePrice,
  onColorChange,
  className = '',
  variantLabel = 'Color',
  useImageSwatches = false
}: ImprovedColorSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null)

  // Initialize with first available color
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) {
      const defaultColor = colors.find(c => c.is_available && c.stock_quantity > 0) || colors[0]
      if (defaultColor) {
        setSelectedColor(defaultColor)
        onColorChange?.(defaultColor)
      }
    }
  }, [colors, selectedColor, onColorChange])

  const handleColorSelect = (color: ColorVariant) => {
    if (!color.is_available || color.stock_quantity <= 0) return

    setSelectedColor(color)
    onColorChange?.(color)

    console.log('🎨 Color selected:', color.color_name)
    console.log('🖼️ Color images:', color.image_urls)
  }

  const getColorPrice = (color: ColorVariant) => {
    return basePrice + (color.price_modifier || 0)
  }

  if (!colors.length) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500 text-sm">No color variants available</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Selection */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-charcoal">
          {variantLabel}: <span className="text-cream-300">{selectedColor?.color_name || `Select a ${variantLabel.toLowerCase()}`}</span>
        </h3>
        {selectedColor && selectedColor.price_modifier !== 0 && (
          <span className={`text-sm font-medium px-2 py-1 rounded ${selectedColor.price_modifier > 0
            ? 'bg-orange-100 text-orange-600'
            : 'bg-green-100 text-green-600'
            }`}>
            {selectedColor.price_modifier > 0 ? '+' : ''}₹{selectedColor.price_modifier}
          </span>
        )}
      </div>

      {/* Color Options Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {colors.map((color) => {
          const isSelected = selectedColor?.id === color.id
          const isAvailable = color.is_available && color.stock_quantity > 0
          const finalPrice = getColorPrice(color)

          // Determine image to show for swatch if enabled
          const swatchImage = useImageSwatches
            ? (color.primary_image || (color.image_urls && color.image_urls[0]))
            : null

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => handleColorSelect(color)}
              disabled={!isAvailable}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-center
                ${isSelected
                  ? 'border-cream-300 bg-cream-50 shadow-lg scale-105'
                  : isAvailable
                    ? 'border-cream-200 hover:border-cream-300 hover:shadow-md hover:scale-102'
                    : 'border-gray-200 opacity-50 cursor-not-allowed'
                }
              `}
              title={`${color.color_name} - ₹${finalPrice.toLocaleString()}`}
            >
              {/* Color Swatch / Image Swatch */}
              <div
                className={`
                  w-12 h-12 mx-auto rounded-full border-3 mb-3 transition-all duration-200 overflow-hidden
                  ${isSelected ? 'border-white shadow-lg scale-110' : 'border-gray-300'}
                  ${!isAvailable ? 'opacity-50' : ''}
                `}
                style={!swatchImage ? { backgroundColor: color.color_code } : {}}
              >
                {swatchImage ? (
                  <img
                    src={swatchImage}
                    alt={color.color_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Selection Indicator for pure color swatches
                  isSelected && (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-600 shadow"></div>
                    </div>
                  )
                )}
              </div>

              {/* Color Name */}
              <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-cream-300' : 'text-charcoal'
                }`}>
                {color.color_name}
              </div>

              {/* Price */}
              <div className="text-xs text-gray-600">
                ₹{finalPrice.toLocaleString()}
              </div>

              {/* Price Modifier */}
              {color.price_modifier !== 0 && (
                <div className={`text-xs font-medium mt-1 ${color.price_modifier > 0 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                  {color.price_modifier > 0 ? '+' : ''}₹{Math.abs(color.price_modifier)}
                </div>
              )}

              {/* Stock Info - REMOVED per request */}
              {/* <div className="text-xs text-gray-500 mt-1">
                {color.stock_quantity} left
              </div> */}

              {/* Image Count Indicator */}
              {color.image_urls && color.image_urls.length > 0 && !useImageSwatches && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-cream-300 text-white text-xs rounded-full flex items-center justify-center">
                  {color.image_urls.length}
                </div>
              )}

              {/* Out of Stock Overlay */}
              {!isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                  <span className="text-xs text-gray-600 font-medium">
                    {color.stock_quantity <= 0 ? 'Out of Stock' : 'Unavailable'}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Color Details */}
      {selectedColor && (
        <div className="p-4 bg-cream-50 rounded-lg border border-cream-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-charcoal text-lg">{selectedColor.color_name}</h4>
              <p className="text-sm text-charcoal/70">
                ₹{getColorPrice(selectedColor).toLocaleString()}
                {selectedColor.price_modifier !== 0 && (
                  <span className="text-xs ml-2">
                    (Base: ₹{basePrice.toLocaleString()}
                    {selectedColor.price_modifier > 0 ? ' + ' : ' - '}
                    ₹{Math.abs(selectedColor.price_modifier)})
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              {/* Stock info removed per request */}
              {/* <p className="text-sm font-medium text-charcoal">
                {selectedColor.stock_quantity} in stock
              </p> */}
              {selectedColor.image_urls && selectedColor.image_urls.length > 0 && (
                <p className="text-xs text-cream-300 mt-1">
                  📸 {selectedColor.image_urls.length} custom images
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}