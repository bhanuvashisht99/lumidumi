'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import OptimizedAdminTabs from './OptimizedAdminTabs'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  revenue: number
  customRequests: number
}

export default function OptimizedAdminDashboard() {
  const [activeTab, setActiveTab] = useState('products')
  const { isAdmin, loading, user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    customRequests: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Memoized auth check
  const shouldRedirect = useMemo(() => {
    return !loading && (!user || !isAdmin)
  }, [loading, user, isAdmin])

  // Redirect if not authenticated/authorized
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/login')
    }
  }, [shouldRedirect, router])

  // Optimized stats fetching with error handling
  const fetchStats = useCallback(async () => {
    if (!user || !isAdmin) return

    try {
      setStatsLoading(true)
      setStatsError(null)

      // Fetch all stats in parallel with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const [productsRes, ordersRes, customOrdersRes] = await Promise.allSettled([
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .abortSignal(controller.signal),

        supabase
          .from('orders')
          .select('total_amount', { count: 'exact' })
          .abortSignal(controller.signal),

        supabase
          .from('custom_orders')
          .select('*', { count: 'exact', head: true })
          .abortSignal(controller.signal)
      ])

      clearTimeout(timeoutId)

      let totalProducts = 0
      let totalOrders = 0
      let revenue = 0
      let customRequests = 0

      // Handle products result
      if (productsRes.status === 'fulfilled' && !productsRes.value.error) {
        totalProducts = productsRes.value.count || 0
      }

      // Handle orders result
      if (ordersRes.status === 'fulfilled' && !ordersRes.value.error) {
        totalOrders = ordersRes.value.count || 0
        revenue = ordersRes.value.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      }

      // Handle custom orders result
      if (customOrdersRes.status === 'fulfilled' && !customOrdersRes.value.error) {
        customRequests = customOrdersRes.value.count || 0
      }

      setStats({
        totalProducts,
        totalOrders,
        revenue,
        customRequests
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStatsError('Failed to load dashboard stats')
    } finally {
      setStatsLoading(false)
    }
  }, [user, isAdmin])

  useEffect(() => {
    if (user && isAdmin && !loading) {
      fetchStats()
    }
  }, [user, isAdmin, loading, fetchStats])

  // Memoized stats data
  const statsData = useMemo(() => [
    { name: 'Total Products', value: stats.totalProducts.toString(), change: 'Active products' },
    { name: 'Total Orders', value: stats.totalOrders.toString(), change: 'All time' },
    { name: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, change: 'Total earned' },
    { name: 'Custom Requests', value: stats.customRequests.toString(), change: 'Received' },
  ], [stats])

  const tabs = useMemo(() => [
    { id: 'products', name: 'Products', icon: '📦' },
    { id: 'orders', name: 'Orders', icon: '📋' },
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'custom', name: 'Custom Orders', icon: '🎨' },
    { id: 'content', name: 'Content', icon: '📝' },
  ], [])

  // Show loading only when first loading auth
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cream-300 mx-auto"></div>
          <p className="mt-4 text-charcoal">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (shouldRedirect) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal mb-4">Access Denied</h1>
          <p className="text-charcoal/60 mb-6">You need admin privileges to access this page.</p>
          <a href="/login" className="btn-primary">
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
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mt-1"></div>
                  ) : statsError ? (
                    <p className="text-sm text-red-500">Error</p>
                  ) : (
                    <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                  )}
                  <p className="text-sm text-cream-300">{stat.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Refresh button for stats */}
        {statsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-600">Failed to load dashboard statistics</p>
              <button onClick={fetchStats} className="btn-secondary text-sm">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-cream-200 mb-8">
          <nav className="-mb-px flex flex-wrap gap-x-4 gap-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-colors ${
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

        {/* Tab Content with optimized loading */}
        <OptimizedAdminTabs activeTab={activeTab} />
      </div>
    </div>
  )
}