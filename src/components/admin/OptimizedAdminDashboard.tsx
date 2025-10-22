'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePreloadedStats, usePreloadedData } from '@/contexts/DataPreloadContext'
import OptimizedAdminTabs from './OptimizedAdminTabs'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  revenue: number
  customRequests: number
}

export default function OptimizedAdminDashboard() {
  const [activeTab, setActiveTab] = useState('products')
  const { user } = useAuth()
  const { data, isLoading, refreshData } = usePreloadedData()

  // Use preloaded stats, with fallback while loading
  const stats = useMemo(() => {
    if (!data) {
      return { totalProducts: 0, totalOrders: 0, revenue: 0, customRequests: 0 }
    }
    return {
      ...data.stats,
      customRequests: 0 // This can be loaded separately if needed
    }
  }, [data])


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

  // AuthGuard handles loading and auth checks

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
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                  )}
                  <p className="text-sm text-cream-300">{stat.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Refresh Data Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="btn-secondary flex items-center space-x-2"
          >
            <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
            <span>{isLoading ? 'Loading...' : 'Refresh Data'}</span>
          </button>
        </div>

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