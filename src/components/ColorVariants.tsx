'use client'

import { useState } from 'react'

interface ColorVariant {
  id?: string
  color_name: string
  color_code: string
  stock_quantity: number
  price_modifier: number
  is_available: boolean
  image_urls?: string[]  // Array of image URLs for this color
  primary_image?: string // Primary image URL for this color
}

interface ColorVariantsProps {
  colors: ColorVariant[]
  onColorsChange: (colors: ColorVariant[]) => void
  basePrice: number
  availableImages?: { url: string; alt_text?: string }[] // All available product images
}

export default function ColorVariants({ colors = [], onColorsChange, basePrice, availableImages = [] }: ColorVariantsProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedColorIndex, setExpandedColorIndex] = useState<number | null>(null)
  const [newColor, setNewColor] = useState<ColorVariant>({
    color_name: '',
    color_code: '#000000',
    stock_quantity: 0,
    price_modifier: 0,
    is_available: true,
    image_urls: [],
    primary_image: ''
  })

  const addColor = () => {
    if (!newColor.color_name.trim()) {
      alert('Please enter a color name')
      return
    }

    onColorsChange([...colors, { ...newColor }])
    setNewColor({
      color_name: '',
      color_code: '#000000',
      stock_quantity: 0,
      price_modifier: 0,
      is_available: true,
      image_urls: [],
      primary_image: ''
    })
    setShowAddForm(false)
  }

  const updateColor = (index: number, updatedColor: Partial<ColorVariant>) => {
    const newColors = colors.map((color, idx) =>
      idx === index ? { ...color, ...updatedColor } : color
    )
    onColorsChange(newColors)
  }

  const removeColor = (index: number) => {
    const newColors = colors.filter((_, idx) => idx !== index)
    onColorsChange(newColors)
    if (expandedColorIndex === index) {
      setExpandedColorIndex(null)
    }
  }

  const toggleImageForColor = (colorIndex: number, imageUrl: string) => {
    const newColors = [...colors]
    const color = newColors[colorIndex]

    if (!color.image_urls) {
      color.image_urls = []
    }

    if (color.image_urls.includes(imageUrl)) {
      // Remove image
      color.image_urls = color.image_urls.filter(url => url !== imageUrl)
      // If this was the primary image, clear it
      if (color.primary_image === imageUrl) {
        color.primary_image = color.image_urls[0] || ''
      }
    } else {
      // Add image
      color.image_urls.push(imageUrl)
      // If no primary image set, make this the primary
      if (!color.primary_image) {
        color.primary_image = imageUrl
      }
    }

    onColorsChange(newColors)
  }

  const setPrimaryImageForColor = (colorIndex: number, imageUrl: string) => {
    const newColors = [...colors]
    newColors[colorIndex].primary_image = imageUrl
    onColorsChange(newColors)
  }

  const predefinedColors = [
    { name: 'Natural White', code: '#F8F6F0' },
    { name: 'Cream', code: '#F5F5DC' },
    { name: 'Vanilla', code: '#F3E5AB' },
    { name: 'Lavender', code: '#E6E6FA' },
    { name: 'Rose Pink', code: '#FFB6C1' },
    { name: 'Sage Green', code: '#9CAF88' },
    { name: 'Ocean Blue', code: '#4682B4' },
    { name: 'Sunset Orange', code: '#FF7F50' },
    { name: 'Deep Purple', code: '#8B008B' },
    { name: 'Charcoal Gray', code: '#36454F' },
    { name: 'Burgundy', code: '#800020' },
    { name: 'Forest Green', code: '#355E3B' }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-charcoal">
          Color Variants ({colors.length})
        </label>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm text-cream-300 hover:text-cream-300/80 font-medium"
        >
          {showAddForm ? 'Cancel' : '+ Add Color'}
        </button>
      </div>

      {/* Add Color Form */}
      {showAddForm && (
        <div className="bg-cream-50 p-4 rounded-lg border border-cream-200 space-y-4">
          <h4 className="font-medium text-charcoal">Add New Color Variant</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Color Name *
              </label>
              <input
                type="text"
                value={newColor.color_name}
                onChange={(e) => setNewColor({ ...newColor, color_name: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                placeholder="e.g., Natural White"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Color Code
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={newColor.color_code}
                  onChange={(e) => setNewColor({ ...newColor, color_code: e.target.value })}
                  className="w-12 h-10 border border-cream-200 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={newColor.color_code}
                  onChange={(e) => setNewColor({ ...newColor, color_code: e.target.value })}
                  className="flex-1 px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                value={newColor.stock_quantity}
                onChange={(e) => setNewColor({ ...newColor, stock_quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Price Modifier (₹)
              </label>
              <input
                type="number"
                value={newColor.price_modifier}
                onChange={(e) => setNewColor({ ...newColor, price_modifier: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                step="0.01"
                placeholder="0.00"
              />
              <p className="text-xs text-charcoal/60 mt-1">
                Additional cost for this color (can be negative for discounts)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_available"
                checked={newColor.is_available}
                onChange={(e) => setNewColor({ ...newColor, is_available: e.target.checked })}
                className="rounded border-cream-200 text-cream-300 focus:ring-cream-300"
              />
              <label htmlFor="is_available" className="text-sm text-charcoal">
                Available for purchase
              </label>
            </div>
          </div>

          {/* Quick color selection */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Quick Select (Popular Candle Colors)
            </label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.code}
                  type="button"
                  onClick={() => setNewColor({
                    ...newColor,
                    color_name: color.name,
                    color_code: color.code
                  })}
                  className="flex flex-col items-center p-2 border border-cream-200 rounded-lg hover:border-cream-300 transition-colors"
                  title={color.name}
                >
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.code }}
                  ></div>
                  <span className="text-xs text-charcoal/60 mt-1 truncate w-full text-center">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-charcoal/60 hover:text-charcoal"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={addColor}
              className="btn-primary"
            >
              Add Color
            </button>
          </div>
        </div>
      )}

      {/* Existing Colors */}
      {colors.length > 0 && (
        <div className="space-y-3">
          {colors.map((color, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-cream-200 hover:border-cream-300 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: color.color_code }}
                  ></div>
                  <div>
                    <p className="font-medium text-charcoal">{color.color_name}</p>
                    <p className="text-xs text-charcoal/60">{color.color_code}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal/60 mb-1">Stock</label>
                  <input
                    type="number"
                    value={color.stock_quantity}
                    onChange={(e) => updateColor(index, { stock_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-sm border border-cream-200 rounded focus:outline-none focus:ring-1 focus:ring-cream-300"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal/60 mb-1">Price</label>
                  <div className="text-sm">
                    <span className="text-charcoal">₹{(basePrice + color.price_modifier).toLocaleString()}</span>
                    {color.price_modifier !== 0 && (
                      <span className={`ml-1 text-xs ${color.price_modifier > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        ({color.price_modifier > 0 ? '+' : ''}₹{color.price_modifier})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={color.is_available}
                    onChange={(e) => updateColor(index, { is_available: e.target.checked })}
                    className="rounded border-cream-200 text-cream-300 focus:ring-cream-300"
                  />
                  <label className="ml-2 text-sm text-charcoal">Available</label>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setExpandedColorIndex(expandedColorIndex === index ? null : index)}
                    className="text-cream-300 hover:text-cream-300/80 text-sm font-medium"
                  >
                    {color.image_urls?.length || 0} Images
                  </button>
                  <button
                    type="button"
                    onClick={() => removeColor(index)}
                    className="text-red-600 hover:text-red-500 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Image Selection for this color */}
              {expandedColorIndex === index && availableImages.length > 0 && (
                <div className="mt-4 pt-4 border-t border-cream-200">
                  <h4 className="text-sm font-medium text-charcoal mb-3">
                    Select Images for {color.color_name}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableImages.map((image, imgIndex) => {
                      const isSelected = color.image_urls?.includes(image.url) || false
                      const isPrimary = color.primary_image === image.url

                      return (
                        <div
                          key={imgIndex}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-cream-300 ring-2 ring-cream-300/20'
                              : 'border-cream-200 hover:border-cream-300'
                          }`}
                          onClick={() => toggleImageForColor(index, image.url)}
                        >
                          <img
                            src={image.url}
                            alt={image.alt_text || 'Product image'}
                            className="w-full h-full object-cover"
                          />

                          {/* Selection indicator */}
                          <div className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 border-white transition-colors ${
                            isSelected ? 'bg-cream-300' : 'bg-transparent'
                          }`}>
                            {isSelected && (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                            )}
                          </div>

                          {/* Primary indicator */}
                          {isPrimary && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}

                          {/* Set as primary button */}
                          {isSelected && !isPrimary && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setPrimaryImageForColor(index, image.url)
                              }}
                              className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs py-1 rounded hover:bg-black/80 transition-colors"
                            >
                              Set as Primary
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {availableImages.length === 0 && (
                    <p className="text-sm text-charcoal/60 italic">
                      Upload product images first to assign them to colors
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {colors.length === 0 && !showAddForm && (
        <div className="text-center py-8 bg-cream-50 rounded-lg">
          <div className="text-4xl mb-2">🎨</div>
          <p className="text-charcoal/60">No color variants added yet</p>
          <p className="text-sm text-charcoal/50">Add different colors to give customers more options</p>
        </div>
      )}
    </div>
  )
}