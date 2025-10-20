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

interface ProductColorSelectorProps {
  colors: ColorVariant[]
  basePrice: number
  onColorChange?: (color: ColorVariant) => void
  onImageChange?: (images: string[], primaryImage?: string) => void
  defaultColorId?: string
}

export default function ProductColorSelector({
  colors = [],
  basePrice,
  onColorChange,
  onImageChange,
  defaultColorId
}: ProductColorSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null)

  // Initialize with first available color or default
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) {
      const defaultColor = defaultColorId
        ? colors.find(c => c.id === defaultColorId)
        : colors.find(c => c.is_available) || colors[0]

      if (defaultColor) {
        setSelectedColor(defaultColor)
        onColorChange?.(defaultColor)

        // Let the parent handle image switching with proper fallback logic
      }
    }
  }, [colors, defaultColorId])

  const handleColorSelect = (e: React.MouseEvent, color: ColorVariant) => {
    e.preventDefault()
    e.stopPropagation()

    if (!color.is_available || color.stock_quantity <= 0) return

    setSelectedColor(color)
    onColorChange?.(color)

    // Don't pass image change events - let the parent handle it
    // The parent component will handle image switching with proper fallback logic
  }

  const getColorPrice = (color: ColorVariant) => {
    return basePrice + (color.price_modifier || 0)
  }

  if (!colors.length) return null

  return (
    <div className="space-y-4">
      {/* Color Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-charcoal">
            Color: {selectedColor?.color_name}
          </h3>
          {selectedColor && selectedColor.price_modifier !== 0 && (
            <span className={`text-sm font-medium ${
              selectedColor.price_modifier > 0 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {selectedColor.price_modifier > 0 ? '+' : ''}₹{selectedColor.price_modifier}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {colors.map((color) => {
            const isSelected = selectedColor?.id === color.id
            const isAvailable = color.is_available && color.stock_quantity > 0
            const price = getColorPrice(color)

            return (
              <button
                key={color.id}
                type="button"
                onClick={(e) => handleColorSelect(e, color)}
                disabled={!isAvailable}
                className={`relative group p-3 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-cream-300 ring-4 ring-cream-300/30 bg-cream-50 shadow-lg transform scale-105'
                    : isAvailable
                    ? 'border-cream-200 hover:border-cream-300 hover:shadow-sm'
                    : 'border-cream-100 opacity-50 cursor-not-allowed'
                }`}
                title={`${color.color_name} - ₹${price.toLocaleString()}`}
              >
                {/* Color swatch */}
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-white shadow-lg transform scale-110'
                        : 'border-gray-300'
                    } ${!isAvailable ? 'opacity-50' : ''}`}
                    style={{ backgroundColor: color.color_code }}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-600 shadow-sm"></div>
                      </div>
                    )}
                  </div>

                  {/* Color name */}
                  <span className={`text-xs text-center leading-tight font-medium transition-colors duration-200 ${
                    isSelected ? 'text-cream-300 font-semibold' : 'text-charcoal/70'
                  }`}>
                    {color.color_name}
                  </span>

                  {/* Price difference */}
                  {color.price_modifier !== 0 && (
                    <span className={`text-xs font-medium ${
                      color.price_modifier > 0 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {color.price_modifier > 0 ? '+' : ''}₹{Math.abs(color.price_modifier)}
                    </span>
                  )}
                </div>

                {/* Out of stock overlay */}
                {!isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <span className="text-xs text-charcoal/60 font-medium">
                      {color.stock_quantity <= 0 ? 'Out of Stock' : 'Unavailable'}
                    </span>
                  </div>
                )}

                {/* Has custom images indicator */}
                {color.image_urls && color.image_urls.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-cream-300 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📷</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Color Info */}
      {selectedColor && (
        <div className="p-4 bg-cream-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-charcoal">{selectedColor.color_name}</h4>
              <p className="text-sm text-charcoal/60">
                ₹{getColorPrice(selectedColor).toLocaleString()}
                {selectedColor.price_modifier !== 0 && (
                  <span className="ml-1">
                    (Base: ₹{basePrice.toLocaleString()}
                    {selectedColor.price_modifier > 0 ? ' + ' : ' - '}
                    ₹{Math.abs(selectedColor.price_modifier)})
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-charcoal">
                {selectedColor.stock_quantity} in stock
              </p>
              {selectedColor.image_urls && selectedColor.image_urls.length > 0 && (
                <p className="text-xs text-cream-300">
                  {selectedColor.image_urls.length} custom images
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}