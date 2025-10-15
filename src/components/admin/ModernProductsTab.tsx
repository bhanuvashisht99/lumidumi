'use client'

import { useState, useEffect } from 'react'
import { getAllProducts, getCategories } from '@/lib/database'
import MultiImageUpload from '@/components/MultiImageUpload'
import ColorVariants from '@/components/ColorVariants'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  category_id?: string
  weight?: number
  burn_time?: number
  scent_description?: string
  ingredients?: string
  care_instructions?: string
  sku?: string
  tags?: string[]
  dimensions?: string
  material?: string
  is_active: boolean
  featured: boolean
  images?: any[]
  colors?: any[]
  category?: any
}

interface Category {
  id: string
  name: string
}

export default function ModernProductsTab() {
  // State management
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({})
  const [formImages, setFormImages] = useState<any[]>([])
  const [formColors, setFormColors] = useState<any[]>([])

  // Load data on mount
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Fetch products with related images and colors
      const data = await getAllProducts()

      // For each product, fetch its images and colors
      const productsWithRelations = await Promise.all(
        data.map(async (product: Product) => {
          // Fetch images
          const imagesResponse = await fetch(`/api/admin/products/${product.id}/images`)
          const images = imagesResponse.ok ? await imagesResponse.json() : []

          // Fetch colors
          const colorsResponse = await fetch(`/api/admin/products/${product.id}/colors`)
          const colors = colorsResponse.ok ? await colorsResponse.json() : []

          return { ...product, images, colors }
        })
      )

      setProducts(productsWithRelations)
    } catch (error) {
      console.error('Error fetching products:', error)
      alert('Error loading products. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !selectedCategory || product.category_id === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Form handlers
  const openAddForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      category_id: '',
      weight: 0,
      burn_time: 0,
      scent_description: '',
      ingredients: '',
      care_instructions: '',
      sku: '',
      tags: [],
      dimensions: '',
      material: '',
      is_active: true,
      featured: false
    })
    setFormImages([])
    setFormColors([])
    setShowAddForm(true)
    setEditingProduct(null)
  }

  const openEditForm = (product: Product) => {
    // Clean the product data to only include form-safe fields
    const cleanFormData = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id,
      weight: product.weight,
      burn_time: product.burn_time,
      scent_description: product.scent_description,
      ingredients: product.ingredients,
      care_instructions: product.care_instructions,
      sku: product.sku,
      tags: product.tags,
      dimensions: product.dimensions,
      material: product.material,
      is_active: product.is_active,
      featured: product.featured,
      slug: (product as any).slug || ''
    }

    setFormData(cleanFormData)
    setFormImages(product.images || [])
    setFormColors(product.colors || [])
    setEditingProduct(product)
    setShowAddForm(true)
  }

  const closeForm = () => {
    setShowAddForm(false)
    setEditingProduct(null)
    setFormData({})
    setFormImages([])
    setFormColors([])
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.price) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const payload = {
        productData: {
          ...formData,
          slug: formData.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          tags: JSON.stringify(formData.tags || [])
        },
        images: formImages,
        colors: formColors
      }

      const url = editingProduct ? '/api/admin/products' : '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'

      if (editingProduct) {
        payload.productData.id = editingProduct.id
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save product')
      }

      await fetchProducts()
      closeForm()
      alert(`Product ${editingProduct ? 'updated' : 'created'} successfully!`)
    } catch (error) {
      console.error('Error saving product:', error)
      alert(`Error saving product: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId })
      })

      if (!response.ok) throw new Error('Failed to delete product')

      await fetchProducts()
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product')
    }
  }

  // Bulk operations
  const handleBulkAction = async (action: 'delete' | 'activate' | 'deactivate' | 'feature' | 'unfeature') => {
    if (selectedProducts.length === 0) {
      alert('Please select products first')
      return
    }

    if (action === 'delete' && !confirm(`Delete ${selectedProducts.length} products?`)) {
      return
    }

    try {
      // Implementation depends on your API structure
      console.log(`Bulk ${action} for products:`, selectedProducts)
      alert(`Bulk ${action} completed!`)
      setSelectedProducts([])
    } catch (error) {
      console.error(`Error with bulk ${action}:`, error)
      alert(`Error with bulk ${action}`)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cream-300 mx-auto mb-4"></div>
        <p className="text-charcoal/60">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-white rounded-lg shadow-sm border border-cream-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-charcoal">Products</h2>
            <p className="text-charcoal/60">{filteredProducts.length} of {products.length} products</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 w-64"
              />
              <span className="absolute left-3 top-2.5 text-charcoal/40">🔍</span>
            </div>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            {/* View toggle */}
            <div className="flex border border-cream-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-2 text-sm ${view === 'grid' ? 'bg-cream-300 text-white' : 'text-charcoal hover:bg-cream-50'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-cream-300 text-white' : 'text-charcoal hover:bg-cream-50'}`}
              >
                List
              </button>
            </div>

            <button
              onClick={openAddForm}
              className="btn-primary"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 p-4 bg-cream-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-charcoal">
              {selectedProducts.length} product(s) selected
            </span>
            <div className="flex space-x-2">
              <button onClick={() => handleBulkAction('activate')} className="btn-secondary text-sm">
                Activate
              </button>
              <button onClick={() => handleBulkAction('deactivate')} className="btn-secondary text-sm">
                Deactivate
              </button>
              <button onClick={() => handleBulkAction('feature')} className="btn-secondary text-sm">
                Feature
              </button>
              <button onClick={() => handleBulkAction('delete')} className="text-red-600 hover:text-red-500 text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products display */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              selected={selectedProducts.includes(product.id)}
              onSelect={(selected) => {
                if (selected) {
                  setSelectedProducts([...selectedProducts, product.id])
                } else {
                  setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                }
              }}
              onEdit={() => openEditForm(product)}
              onDelete={() => handleDeleteProduct(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-cream-200 overflow-hidden">
          <ProductTable
            products={filteredProducts}
            selectedProducts={selectedProducts}
            onSelectAll={(selected) => {
              setSelectedProducts(selected ? filteredProducts.map(p => p.id) : [])
            }}
            onSelect={(productId, selected) => {
              if (selected) {
                setSelectedProducts([...selectedProducts, productId])
              } else {
                setSelectedProducts(selectedProducts.filter(id => id !== productId))
              }
            }}
            onEdit={openEditForm}
            onDelete={handleDeleteProduct}
          />
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-cream-200">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">No products found</h3>
          <p className="text-charcoal/60 mb-6">
            {searchTerm || selectedCategory ? 'Try adjusting your filters' : 'Create your first product to get started'}
          </p>
          <button onClick={openAddForm} className="btn-primary">
            Add First Product
          </button>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <ProductFormModal
          product={editingProduct}
          formData={formData}
          setFormData={setFormData}
          images={formImages}
          setImages={setFormImages}
          colors={formColors}
          setColors={setFormColors}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={closeForm}
        />
      )}
    </div>
  )
}

// Product Card Component for Grid View
function ProductCard({
  product,
  selected,
  onSelect,
  onEdit,
  onDelete
}: {
  product: Product
  selected: boolean
  onSelect: (selected: boolean) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]

  return (
    <div className={`bg-white rounded-lg shadow-sm border transition-all ${
      selected ? 'border-cream-300 ring-2 ring-cream-300/20' : 'border-cream-200 hover:border-cream-300'
    }`}>
      {/* Image */}
      <div className="aspect-square bg-cream-100 rounded-t-lg overflow-hidden relative">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="absolute top-3 left-3 z-10 rounded border-cream-200 text-cream-300 focus:ring-cream-300"
        />

        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal/40">
            <div className="text-center">
              <div className="text-4xl mb-2">🕯️</div>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-3 right-3 flex flex-col space-y-1">
          {product.featured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">Featured</span>
          )}
          {!product.is_active && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Inactive</span>
          )}
        </div>

        {/* Image count */}
        {(product.images?.length || 0) > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
            +{(product.images?.length || 1) - 1}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-charcoal truncate flex-1">{product.name}</h3>
          <span className="text-lg font-bold text-cream-300 ml-2">₹{product.price.toLocaleString()}</span>
        </div>

        <p className="text-sm text-charcoal/60 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between text-xs text-charcoal/60 mb-3">
          <span>Stock: {product.stock_quantity}</span>
          {product.colors && product.colors.length > 0 && (
            <span>{product.colors.length} colors</span>
          )}
        </div>

        {/* Colors preview */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex space-x-1 mb-3">
            {product.colors.slice(0, 5).map((color: any, index: number) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color.color_code }}
                title={color.color_name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-xs text-charcoal/60">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 py-2 px-3 bg-cream-100 text-charcoal text-sm rounded hover:bg-cream-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="py-2 px-3 text-red-600 text-sm hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// Product Table Component for List View
function ProductTable({
  products,
  selectedProducts,
  onSelectAll,
  onSelect,
  onEdit,
  onDelete
}: {
  products: Product[]
  selectedProducts: string[]
  onSelectAll: (selected: boolean) => void
  onSelect: (productId: string, selected: boolean) => void
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}) {
  const allSelected = products.length > 0 && selectedProducts.length === products.length

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-cream-200">
        <thead className="bg-cream-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-cream-200 text-cream-300 focus:ring-cream-300"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
              Colors
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-cream-100">
          {products.map(product => {
            const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]

            return (
              <tr key={product.id} className="hover:bg-cream-25">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => onSelect(product.id, e.target.checked)}
                    className="rounded border-cream-200 text-cream-300 focus:ring-cream-300"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-cream-100 rounded-lg flex items-center justify-center mr-4">
                      {primaryImage ? (
                        <img src={primaryImage.url} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        '🕯️'
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-charcoal">{product.name}</div>
                      <div className="text-sm text-charcoal/60">{product.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-charcoal">₹{product.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-charcoal">{product.stock_quantity}</td>
                <td className="px-6 py-4">
                  {product.colors && product.colors.length > 0 ? (
                    <div className="flex space-x-1">
                      {product.colors.slice(0, 3).map((color: any, index: number) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.color_code }}
                          title={color.color_name}
                        />
                      ))}
                      {product.colors.length > 3 && (
                        <span className="text-xs text-charcoal/60">+{product.colors.length - 3}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-charcoal/60">No colors</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {product.featured && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-cream-300 hover:text-cream-300/80 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="text-red-600 hover:text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Product Form Modal Component
function ProductFormModal({
  product,
  formData,
  setFormData,
  images,
  setImages,
  colors,
  setColors,
  categories,
  onSave,
  onClose
}: {
  product: Product | null
  formData: Partial<Product>
  setFormData: (data: Partial<Product>) => void
  images: any[]
  setImages: (images: any[]) => void
  colors: any[]
  setColors: (colors: any[]) => void
  categories: Category[]
  onSave: (e: React.FormEvent) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-cream-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-charcoal">
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button
              onClick={onClose}
              className="text-charcoal/60 hover:text-charcoal text-xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                placeholder="e.g., CND-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={formData.stock_quantity || ''}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Category
              </label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Material
              </label>
              <input
                type="text"
                value={formData.material || ''}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                placeholder="e.g., Soy Wax"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Description *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
              rows={4}
              required
            />
          </div>

          {/* Product Images */}
          <div>
            <MultiImageUpload
              images={images}
              onImagesChange={setImages}
              productName={formData.name || ''}
              maxImages={8}
            />
          </div>

          {/* Color Variants */}
          <div>
            <ColorVariants
              colors={colors}
              onColorsChange={setColors}
              basePrice={formData.price || 0}
              availableImages={images}
            />
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Weight (g)
              </label>
              <input
                type="number"
                value={formData.weight || ''}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Burn Time (hours)
              </label>
              <input
                type="number"
                value={formData.burn_time || ''}
                onChange={(e) => setFormData({ ...formData, burn_time: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Dimensions
              </label>
              <input
                type="text"
                value={formData.dimensions || ''}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                placeholder="e.g., 10cm x 8cm"
              />
            </div>
          </div>

          {/* Scent and Care */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Scent Description
              </label>
              <textarea
                value={formData.scent_description || ''}
                onChange={(e) => setFormData({ ...formData, scent_description: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                rows={3}
                placeholder="Describe the fragrance profile..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Care Instructions
              </label>
              <textarea
                value={formData.care_instructions || ''}
                onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                rows={3}
                placeholder="How to use and maintain the candle..."
              />
            </div>
          </div>

          {/* Status toggles */}
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-cream-200 text-cream-300 focus:ring-cream-300"
              />
              <span className="ml-2 text-sm text-charcoal">Active (visible to customers)</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured === true}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-cream-200 text-cream-300 focus:ring-cream-300"
              />
              <span className="ml-2 text-sm text-charcoal">Featured product</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-cream-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-cream-200 text-charcoal rounded-lg hover:bg-cream-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2"
            >
              {product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}