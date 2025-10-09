'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAllProducts, getAllOrders, getCategories, getCustomOrders } from '@/lib/database'
import ImageUpload from '@/components/ImageUpload'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products')
  const { isAdmin, loading, user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    customRequests: 0
  })

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login')
    }
  }, [loading, user, isAdmin, router])

  useEffect(() => {
    if (!user || !isAdmin || loading) return

    async function fetchStats() {
      try {
        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        // Fetch orders count and revenue
        const { data: orders, count: ordersCount } = await supabase
          .from('orders')
          .select('total_amount', { count: 'exact' })

        // Calculate total revenue
        const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

        // Fetch custom orders count
        const { count: customCount } = await supabase
          .from('custom_orders')
          .select('*', { count: 'exact', head: true })

        setStats({
          totalProducts: productsCount || 0,
          totalOrders: ordersCount || 0,
          revenue: totalRevenue,
          customRequests: customCount || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [user, isAdmin, loading])

  const statsData = [
    { name: 'Total Products', value: stats.totalProducts.toString(), change: 'Active products' },
    { name: 'Total Orders', value: stats.totalOrders.toString(), change: 'All time' },
    { name: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, change: 'Total earned' },
    { name: 'Custom Requests', value: stats.customRequests.toString(), change: 'Received' },
  ]

  const tabs = [
    { id: 'products', name: 'Products', icon: '📦' },
    { id: 'orders', name: 'Orders', icon: '📋' },
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'custom', name: 'Custom Orders', icon: '🎨' },
    { id: 'content', name: 'Content', icon: '📝' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cream-300 mx-auto"></div>
          <p className="mt-4 text-charcoal">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal mb-4">Access Denied</h1>
          <p className="text-charcoal/60 mb-6">You need admin privileges to access this page.</p>
          <a
            href="/login"
            className="btn-primary"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">Admin Dashboard</h1>
          <p className="text-charcoal/60 mt-2">Manage your Lumidumi candle business</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal/60">{stat.name}</p>
                  <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                  <p className="text-sm text-cream-300">{stat.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-cream-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-cream-300 text-cream-300'
                    : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-charcoal/30'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card">
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'custom' && <CustomOrdersTab />}
          {activeTab === 'content' && <ContentTab />}
        </div>
      </div>
    </div>
  )
}

function ProductsTab() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    image_url: '',
    weight: '',
    burn_time: '',
    scent_description: '',
    ingredients: '',
    care_instructions: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getAllProducts()
      setProducts(data)
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock_quantity: parseInt(newProduct.stock_quantity),
        weight: newProduct.weight ? parseFloat(newProduct.weight) : null,
        burn_time: newProduct.burn_time ? parseInt(newProduct.burn_time) : null,
        category_id: newProduct.category_id || null, // Handle empty string as null
        slug: newProduct.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        is_active: true,
        featured: false
      }

      // Debug: Log the data being sent
      console.log('Sending product data:', productData)

      // Use admin API route to bypass RLS
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create product')
      }

      const { data } = await response.json()

      // Refresh the products list to get the latest data
      await fetchProducts()

      setShowAddForm(false)
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_id: '',
        image_url: '',
        weight: '',
        burn_time: '',
        scent_description: '',
        ingredients: '',
        care_instructions: ''
      })

      // Force cache invalidation for frontend
      if (typeof window !== 'undefined') {
        window.postMessage({ type: 'PRODUCTS_UPDATED' }, '*')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert(`Error adding product: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct({
      ...product,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      weight: product.weight?.toString() || '',
      burn_time: product.burn_time?.toString() || '',
      category_id: product.category_id || '',
      scent_description: product.scent_description || '',
      ingredients: product.ingredients || '',
      care_instructions: product.care_instructions || ''
    })
    setShowAddForm(false)
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      // Extract only the database fields, excluding joined data like 'category'
      const { category, created_at, updated_at, id, ...cleanProduct } = editingProduct

      const productData = {
        name: cleanProduct.name,
        description: cleanProduct.description,
        price: parseFloat(cleanProduct.price),
        stock_quantity: parseInt(cleanProduct.stock_quantity),
        weight: cleanProduct.weight ? parseFloat(cleanProduct.weight) : null,
        burn_time: cleanProduct.burn_time ? parseInt(cleanProduct.burn_time) : null,
        category_id: cleanProduct.category_id || null,
        image_url: cleanProduct.image_url || null,
        scent_description: cleanProduct.scent_description || null,
        ingredients: cleanProduct.ingredients || null,
        care_instructions: cleanProduct.care_instructions || null,
        slug: cleanProduct.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        is_active: cleanProduct.is_active,
        featured: cleanProduct.featured
      }

      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editingProduct.id, ...productData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update product')
      }

      const { data } = await response.json()

      // Refresh the products list to get the latest data
      await fetchProducts()

      setEditingProduct(null)

      // Force cache invalidation for frontend
      if (typeof window !== 'undefined') {
        window.postMessage({ type: 'PRODUCTS_UPDATED' }, '*')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert(`Error updating product: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      // Refresh the products list to get the latest data
      await fetchProducts()

      // Force cache invalidation for frontend
      if (typeof window !== 'undefined') {
        window.postMessage({ type: 'PRODUCTS_UPDATED' }, '*')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-charcoal">Products</h2>
        <div className="flex space-x-3">
          <button
            onClick={fetchProducts}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            {showAddForm ? 'Cancel' : 'Add New Product'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Add New Product</h3>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Product Name *</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Price (₹) *</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-2">Description *</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Stock Quantity *</label>
              <input
                type="number"
                value={newProduct.stock_quantity}
                onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Category</label>
              <select
                value={newProduct.category_id}
                onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-2">Product Image</label>
              <ImageUpload
                currentImage={newProduct.image_url}
                onImageUploaded={(url) => setNewProduct({...newProduct, image_url: url})}
                productName={newProduct.name}
              />
              {/* Manual URL input as fallback */}
              <div className="mt-3">
                <input
                  type="url"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 text-sm"
                  placeholder="Or paste image URL directly"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Weight (g)</label>
              <input
                type="number"
                value={newProduct.weight}
                onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Burn Time (hours)</label>
              <input
                type="number"
                value={newProduct.burn_time}
                onChange={(e) => setNewProduct({...newProduct, burn_time: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-2">Scent Description</label>
              <textarea
                value={newProduct.scent_description}
                onChange={(e) => setNewProduct({...newProduct, scent_description: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                rows={2}
              />
            </div>
            <div className="flex justify-end md:col-span-2">
              <button type="submit" className="btn-primary">Add Product</button>
            </div>
          </form>
        </div>
      )}

      {editingProduct && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Edit Product: {editingProduct.name}</h3>
          <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Product Name *</label>
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Price (₹) *</label>
              <input
                type="number"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-2">Description *</label>
              <textarea
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Stock Quantity *</label>
              <input
                type="number"
                value={editingProduct.stock_quantity}
                onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Category</label>
              <select
                value={editingProduct.category_id}
                onChange={(e) => setEditingProduct({...editingProduct, category_id: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-2">Product Image</label>
              <ImageUpload
                currentImage={editingProduct.image_url}
                onImageUploaded={(url) => setEditingProduct({...editingProduct, image_url: url})}
                productName={editingProduct.name}
              />
              <div className="mt-3">
                <input
                  type="url"
                  value={editingProduct.image_url}
                  onChange={(e) => setEditingProduct({...editingProduct, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 text-sm"
                  placeholder="Or paste image URL directly"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Weight (g)</label>
              <input
                type="number"
                value={editingProduct.weight}
                onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Burn Time (hours)</label>
              <input
                type="number"
                value={editingProduct.burn_time}
                onChange={(e) => setEditingProduct({...editingProduct, burn_time: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-2">Scent Description</label>
              <textarea
                value={editingProduct.scent_description}
                onChange={(e) => setEditingProduct({...editingProduct, scent_description: e.target.value})}
                className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                rows={2}
              />
            </div>
            <div className="flex justify-end md:col-span-2 space-x-3">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-charcoal/60 hover:text-charcoal"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">Update Product</button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-cream-200">
          <thead>
            <tr>
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
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-charcoal/60">
                  No products found. Add your first product!
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-cream-100 rounded-lg flex items-center justify-center">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          '🕯️'
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-charcoal">{product.name}</div>
                        <div className="text-sm text-charcoal/60">{product.description?.slice(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">₹{product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">{product.stock_quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-cream-300 hover:text-cream-300/80 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800'
    }

    return (
      <span className={`px-3 py-1 text-sm rounded-full font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-charcoal mb-6">Recent Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-8 bg-cream-50 rounded-lg">
          <p className="text-charcoal/60">No orders found yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-lg">
              <div>
                <p className="font-medium text-charcoal">#{order.id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-charcoal/60">
                  {order.profile?.first_name} {order.profile?.last_name} •
                  {order.order_items?.length || 0} items • ₹{order.total_amount?.toLocaleString()}
                </p>
                <p className="text-xs text-charcoal/50">{formatDate(order.created_at)}</p>
              </div>
              {getStatusBadge(order.status)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching customers:', error)
        } else {
          setCustomers(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading customers...</div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-charcoal mb-6">Customers ({customers.length})</h2>
      <div className="space-y-4">
        {customers.map((customer) => (
          <div key={customer.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-lg">
            <div>
              <p className="font-medium text-charcoal">
                {customer.first_name} {customer.last_name}
              </p>
              <p className="text-sm text-charcoal/60">
                {customer.email} • {customer.role}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-charcoal/60">
                Joined: {new Date(customer.created_at).toLocaleDateString()}
              </span>
              {customer.role === 'admin' && (
                <div className="text-xs bg-cream-300 text-white px-2 py-1 rounded mt-1">
                  Admin
                </div>
              )}
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <div className="text-center py-8 text-charcoal/60">
            No customers found
          </div>
        )}
      </div>
    </div>
  )
}

function CustomOrdersTab() {
  const [customOrders, setCustomOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteData, setQuoteData] = useState({
    quotedPrice: '',
    adminNotes: '',
    deliveryTime: '',
    terms: ''
  })

  useEffect(() => {
    fetchCustomOrders()
  }, [])

  const fetchCustomOrders = async () => {
    try {
      const data = await getCustomOrders()
      setCustomOrders(data)
    } catch (error) {
      console.error('Error fetching custom orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`px-3 py-1 text-sm rounded-full font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleSendQuote = (order: any) => {
    setSelectedOrder(order)
    setQuoteData({
      quotedPrice: '',
      adminNotes: '',
      deliveryTime: '',
      terms: 'Payment: 50% advance, 50% on delivery\nCustomizations included as discussed\nDelivery charges may apply based on location'
    })
    setShowQuoteModal(true)
  }

  const submitQuote = async () => {
    if (!selectedOrder || !quoteData.quotedPrice) {
      alert('Please enter a quoted price')
      return
    }

    try {
      // Update order with quote details
      const response = await fetch('/api/admin/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          quotedPrice: parseFloat(quoteData.quotedPrice),
          adminNotes: quoteData.adminNotes,
          deliveryTime: quoteData.deliveryTime,
          terms: quoteData.terms,
          customerEmail: selectedOrder.email,
          customerName: selectedOrder.name,
          orderDescription: selectedOrder.description
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send quote')
      }

      // Update local state
      setCustomOrders(orders =>
        orders.map(order =>
          order.id === selectedOrder.id
            ? { ...order, status: 'quoted', quoted_price: parseFloat(quoteData.quotedPrice) }
            : order
        )
      )

      setShowQuoteModal(false)
      setSelectedOrder(null)
      alert('Quote sent successfully!')
    } catch (error) {
      console.error('Error sending quote:', error)
      alert('Error sending quote. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading custom orders...</div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-charcoal mb-6">Custom Order Requests</h2>

      {customOrders.length === 0 ? (
        <div className="text-center py-8 bg-cream-50 rounded-lg">
          <p className="text-charcoal/60">No custom orders found yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {customOrders.map((order) => (
            <div key={order.id} className="p-4 bg-cream-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-charcoal">{order.name}</p>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-sm text-charcoal/60 mb-2">
                {order.name} • {order.email}
                {order.phone && ` • ${order.phone}`}
              </p>
              <p className="text-sm text-charcoal mb-2">
                {order.description.slice(0, 150)}
                {order.description.length > 150 && '...'}
              </p>
              {order.budget_range && (
                <p className="text-sm text-charcoal/60 mb-2">
                  Budget: {order.budget_range}
                </p>
              )}
              {order.deadline && (
                <p className="text-sm text-charcoal/60 mb-2">
                  Deadline: {formatDate(order.deadline)}
                </p>
              )}
              <p className="text-xs text-charcoal/50 mb-3">
                Submitted: {formatDate(order.created_at)}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSendQuote(order)}
                  className="btn-secondary text-sm"
                  disabled={order.status === 'quoted'}
                >
                  {order.status === 'quoted' ? 'Quote Sent' : 'Send Quote'}
                </button>
                <button className="text-sm text-charcoal/60 hover:text-charcoal">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-charcoal mb-4">
              Send Quote for {selectedOrder.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Quoted Price (₹) *
                </label>
                <input
                  type="number"
                  value={quoteData.quotedPrice}
                  onChange={(e) => setQuoteData({...quoteData, quotedPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  placeholder="Enter price in rupees"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Delivery Time
                </label>
                <input
                  type="text"
                  value={quoteData.deliveryTime}
                  onChange={(e) => setQuoteData({...quoteData, deliveryTime: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  placeholder="e.g., 7-10 business days"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={quoteData.adminNotes}
                  onChange={(e) => setQuoteData({...quoteData, adminNotes: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  rows={3}
                  placeholder="Internal notes about this quote"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={quoteData.terms}
                  onChange={(e) => setQuoteData({...quoteData, terms: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  rows={4}
                  placeholder="Terms and conditions for this order"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowQuoteModal(false)
                  setSelectedOrder(null)
                }}
                className="px-4 py-2 text-charcoal/60 hover:text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={submitQuote}
                className="btn-primary"
              >
                Send Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ContentTab() {
  const [selectedSection, setSelectedSection] = useState('hero')
  const [heroContent, setHeroContent] = useState({
    title: 'Lumidumi',
    subtitle: 'Handcrafted candles that illuminate your space with warmth and elegance.',
    description: 'Each candle is lovingly made with premium wax and carefully selected fragrances.',
    imageUrl: '',
    stats: [
      { value: '100%', label: 'Natural Wax' },
      { value: '50+', label: 'Unique Scents' },
      { value: '24h', label: 'Burn Time' }
    ]
  })

  const [aboutContent, setAboutContent] = useState({
    title: 'Crafted with Love',
    subtitle: 'At Lumidumi, every candle tells a story.',
    description: 'We believe in the power of handcrafted beauty and the warmth that comes from creating something special with your own hands.',
    imageUrl: '',
    features: [
      { icon: '🌿', title: 'Natural Ingredients', description: 'We use only premium natural wax and carefully sourced fragrances' },
      { icon: '👐', title: 'Handmade Process', description: 'Each candle is individually crafted with attention to every detail' },
      { icon: '🎨', title: 'Custom Designs', description: 'Personalized candles for your special moments and occasions' }
    ]
  })

  const handleSave = async (section: string) => {
    // TODO: Implement save functionality with Supabase
    console.log(`Saving ${section} content...`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-charcoal">Content Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedSection('hero')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedSection === 'hero'
                ? 'bg-cream-300 text-white'
                : 'bg-cream-100 text-charcoal hover:bg-cream-200'
            }`}
          >
            Hero Section
          </button>
          <button
            onClick={() => setSelectedSection('about')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedSection === 'about'
                ? 'bg-cream-300 text-white'
                : 'bg-cream-100 text-charcoal hover:bg-cream-200'
            }`}
          >
            About Section
          </button>
        </div>
      </div>

      {selectedSection === 'hero' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Title
              </label>
              <input
                type="text"
                value={heroContent.title}
                onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={heroContent.imageUrl}
                onChange={(e) => setHeroContent({ ...heroContent, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Subtitle
            </label>
            <textarea
              value={heroContent.subtitle}
              onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Description
            </label>
            <textarea
              value={heroContent.description}
              onChange={(e) => setHeroContent({ ...heroContent, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-4">
              Statistics
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {heroContent.stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...heroContent.stats]
                      newStats[index].value = e.target.value
                      setHeroContent({ ...heroContent, stats: newStats })
                    }}
                    className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                    placeholder="100%"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...heroContent.stats]
                      newStats[index].label = e.target.value
                      setHeroContent({ ...heroContent, stats: newStats })
                    }}
                    className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                    placeholder="Natural Wax"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleSave('hero')}
            className="btn-primary"
          >
            Save Hero Content
          </button>
        </div>
      )}

      {selectedSection === 'about' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Title
              </label>
              <input
                type="text"
                value={aboutContent.title}
                onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={aboutContent.imageUrl}
                onChange={(e) => setAboutContent({ ...aboutContent, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Subtitle
            </label>
            <textarea
              value={aboutContent.subtitle}
              onChange={(e) => setAboutContent({ ...aboutContent, subtitle: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Description
            </label>
            <textarea
              value={aboutContent.description}
              onChange={(e) => setAboutContent({ ...aboutContent, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-4">
              Features
            </label>
            <div className="space-y-4">
              {aboutContent.features.map((feature, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-cream-50 rounded-lg">
                  <input
                    type="text"
                    value={feature.icon}
                    onChange={(e) => {
                      const newFeatures = [...aboutContent.features]
                      newFeatures[index].icon = e.target.value
                      setAboutContent({ ...aboutContent, features: newFeatures })
                    }}
                    className="px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                    placeholder="🌿"
                  />
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => {
                      const newFeatures = [...aboutContent.features]
                      newFeatures[index].title = e.target.value
                      setAboutContent({ ...aboutContent, features: newFeatures })
                    }}
                    className="px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                    placeholder="Feature Title"
                  />
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={feature.description}
                      onChange={(e) => {
                        const newFeatures = [...aboutContent.features]
                        newFeatures[index].description = e.target.value
                        setAboutContent({ ...aboutContent, features: newFeatures })
                      }}
                      className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                      placeholder="Feature description"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleSave('about')}
            className="btn-primary"
          >
            Save About Content
          </button>
        </div>
      )}
    </div>
  )
}