'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  revenue: number
  totalCustomers: number
}

export default function SimpleAdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    totalCustomers: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const { user } = useAuth()

  const tabs = [
    { id: 'stats', name: 'Dashboard', icon: '📊' },
    { id: 'products', name: 'Products', icon: '📦' },
    { id: 'orders', name: 'Orders', icon: '📋' },
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'content', name: 'Content', icon: '📝' },
  ]

  // Fetch dashboard stats once on mount
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        setStatsLoading(true)

        // Fetch basic stats with simple queries
        const [productsResult, ordersResult, customersResult] = await Promise.allSettled([
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('orders').select('total_amount'),
          supabase.from('profiles').select('*', { count: 'exact', head: true })
        ])

        let totalProducts = 0
        let totalOrders = 0
        let revenue = 0
        let totalCustomers = 0

        if (productsResult.status === 'fulfilled' && !productsResult.value.error) {
          totalProducts = productsResult.value.count || 0
        }

        if (ordersResult.status === 'fulfilled' && !ordersResult.value.error) {
          const orders = ordersResult.value.data || []
          totalOrders = orders.length
          revenue = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
        }

        if (customersResult.status === 'fulfilled' && !customersResult.value.error) {
          totalCustomers = customersResult.value.count || 0
        }

        setStats({
          totalProducts,
          totalOrders,
          revenue,
          totalCustomers
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [user])

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <StatsContent stats={stats} loading={statsLoading} />
      case 'products':
        return <ProductsContent />
      case 'orders':
        return <OrdersContent />
      case 'customers':
        return <CustomersContent />
      case 'content':
        return <ContentContent />
      default:
        return <StatsContent stats={stats} loading={statsLoading} />
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">Admin Dashboard</h1>
          <p className="text-charcoal/60 mt-2">Welcome back, {user?.email}</p>
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
        {renderContent()}
      </div>
    </div>
  )
}

function StatsContent({ stats, loading }: { stats: DashboardStats; loading: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-cream-200">
        <h3 className="text-sm font-medium text-charcoal/60">Total Products</h3>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mt-2"></div>
        ) : (
          <p className="text-2xl font-bold text-charcoal mt-2">{stats.totalProducts}</p>
        )}
        <p className="text-sm text-cream-300 mt-1">Active products</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-cream-200">
        <h3 className="text-sm font-medium text-charcoal/60">Total Orders</h3>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mt-2"></div>
        ) : (
          <p className="text-2xl font-bold text-charcoal mt-2">{stats.totalOrders}</p>
        )}
        <p className="text-sm text-cream-300 mt-1">All time</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-cream-200">
        <h3 className="text-sm font-medium text-charcoal/60">Revenue</h3>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded mt-2"></div>
        ) : (
          <p className="text-2xl font-bold text-charcoal mt-2">₹{stats.revenue.toLocaleString()}</p>
        )}
        <p className="text-sm text-cream-300 mt-1">Total earned</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-cream-200">
        <h3 className="text-sm font-medium text-charcoal/60">Customers</h3>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mt-2"></div>
        ) : (
          <p className="text-2xl font-bold text-charcoal mt-2">{stats.totalCustomers}</p>
        )}
        <p className="text-sm text-cream-300 mt-1">Registered</p>
      </div>
    </div>
  )
}

function ProductsContent() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, stock_quantity, is_active')
          .order('created_at', { ascending: false })
          .limit(10)

        if (!error && data) {
          setProducts(data)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-cream-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-charcoal">Products</h2>
          <button className="btn-primary">+ Add Product</button>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-cream-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-charcoal">Products ({products.length})</h2>
        <button className="btn-primary">+ Add Product</button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8 text-charcoal/60">
          <div className="text-4xl mb-4">📦</div>
          <p>No products found.</p>
          <p className="text-sm mt-2">Click "Add Product" to create your first product.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-lg">
              <div>
                <p className="font-medium text-charcoal">{product.name}</p>
                <p className="text-sm text-charcoal/60">
                  ₹{product.price.toLocaleString()} • Stock: {product.stock_quantity}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
                <button className="text-sm text-cream-300 hover:text-cream-400">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OrdersContent() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          profiles (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-cream-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-charcoal">Recent Orders</h2>
          <button className="btn-secondary">🔄 Refresh</button>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-cream-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-charcoal">Recent Orders ({orders.length})</h2>
        <button onClick={fetchOrders} className="btn-secondary">🔄 Refresh</button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-charcoal/60">
          <div className="text-4xl mb-4">📋</div>
          <p>No orders found.</p>
          <p className="text-sm mt-2">Orders will appear here when customers make purchases.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-lg">
              <div>
                <p className="font-medium text-charcoal">#{order.id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-charcoal/60">
                  {order.profiles?.first_name} {order.profiles?.last_name} • ₹{order.total_amount?.toLocaleString()}
                </p>
                <p className="text-xs text-charcoal/50">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CustomersContent() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-cream-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-charcoal">Customers</h2>
          <button className="btn-secondary">🔄 Refresh</button>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-cream-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-charcoal">Customers ({customers.length})</h2>
        <button onClick={fetchCustomers} className="btn-secondary">🔄 Refresh</button>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-8 text-charcoal/60">
          <div className="text-4xl mb-4">👥</div>
          <p>No customers found.</p>
          <p className="text-sm mt-2">Customer registrations will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-lg">
              <div>
                <p className="font-medium text-charcoal">
                  {customer.first_name} {customer.last_name}
                </p>
                <p className="text-sm text-charcoal/60">{customer.email}</p>
                <p className="text-xs text-charcoal/50">
                  Joined: {new Date(customer.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                customer.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {customer.role?.charAt(0).toUpperCase() + customer.role?.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ContentContent() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-cream-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-charcoal">Content Management</h2>
        <button className="btn-secondary">💾 Save Changes</button>
      </div>
      <div className="text-center py-8 text-charcoal/60">
        <div className="text-4xl mb-4">📝</div>
        <p>Content management tools will be available here.</p>
        <p className="text-sm mt-2">Edit website content, pages, and settings.</p>
      </div>
    </div>
  )
}