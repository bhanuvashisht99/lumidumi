'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getAllProducts } from '@/lib/database'
import { supabase } from '@/lib/supabase'

interface PreloadedData {
  products: any[]
  categories: any[]
  orders: any[]
  customers: any[]
  content: {
    hero: any
    about: any
    pricing: any
    contact: any
    footer: any
  }
  stats: {
    totalProducts: number
    totalOrders: number
    revenue: number
    totalCustomers: number
  }
}

interface DataPreloadContextType {
  data: PreloadedData | null
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

const DataPreloadContext = createContext<DataPreloadContextType | undefined>(undefined)

export function DataPreloadProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PreloadedData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAllData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔄 Starting global data preload...')

      // Load all data in parallel for speed
      const [
        productsResult,
        categoriesResult,
        ordersResult,
        customersResult,
        contentResults
      ] = await Promise.allSettled([
        // Products
        getAllProducts().catch(() => []),

        // Categories
        supabase.from('categories').select('*').then(res => res.data || []),

        // Orders (for stats)
        supabase.from('orders').select('total_amount').then(res => res.data || []),

        // Customers (for stats)
        supabase.from('profiles').select('*').then(res => res.data || []),

        // Content sections
        Promise.allSettled([
          fetch('/api/admin/content?section=hero').then(res => res.ok ? res.json() : { data: null }),
          fetch('/api/admin/content?section=about').then(res => res.ok ? res.json() : { data: null }),
          fetch('/api/admin/content?section=pricing').then(res => res.ok ? res.json() : { data: null }),
          fetch('/api/admin/content?section=contact').then(res => res.ok ? res.json() : { data: null }),
          fetch('/api/admin/content?section=footer').then(res => res.ok ? res.json() : { data: null })
        ])
      ])

      // Extract results
      const products = productsResult.status === 'fulfilled' ? productsResult.value : []
      const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []
      const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : []
      const customers = customersResult.status === 'fulfilled' ? customersResult.value : []

      // Process content
      const contentSections = contentResults.status === 'fulfilled' ? contentResults.value : []
      const content = {
        hero: contentSections[0]?.status === 'fulfilled' ? contentSections[0].value?.data?.additional_data : null,
        about: contentSections[1]?.status === 'fulfilled' ? contentSections[1].value?.data?.additional_data : null,
        pricing: contentSections[2]?.status === 'fulfilled' ? contentSections[2].value?.data?.additional_data : null,
        contact: contentSections[3]?.status === 'fulfilled' ? contentSections[3].value?.data?.additional_data : null,
        footer: contentSections[4]?.status === 'fulfilled' ? contentSections[4].value?.data?.additional_data : null
      }

      // Calculate stats
      const stats = {
        totalProducts: products.length,
        totalOrders: orders.length,
        revenue: orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0),
        totalCustomers: customers.length
      }

      const preloadedData: PreloadedData = {
        products,
        categories,
        orders,
        customers,
        content,
        stats
      }

      setData(preloadedData)
      console.log('✅ Global data preload completed:', {
        products: products.length,
        categories: categories.length,
        orders: orders.length,
        customers: customers.length,
        stats
      })

    } catch (err) {
      console.error('❌ Global data preload failed:', err)
      setError('Failed to load application data')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    await loadAllData()
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const value = {
    data,
    isLoading,
    error,
    refreshData
  }

  return (
    <DataPreloadContext.Provider value={value}>
      {children}
    </DataPreloadContext.Provider>
  )
}

export function usePreloadedData() {
  const context = useContext(DataPreloadContext)
  if (context === undefined) {
    throw new Error('usePreloadedData must be used within a DataPreloadProvider')
  }
  return context
}

// Hook for specific data types
export function usePreloadedProducts() {
  const { data } = usePreloadedData()
  return data?.products || []
}

export function usePreloadedStats() {
  const { data } = usePreloadedData()
  return data?.stats || { totalProducts: 0, totalOrders: 0, revenue: 0, totalCustomers: 0 }
}

export function usePreloadedContent() {
  const { data } = usePreloadedData()
  return data?.content || { hero: null, about: null, pricing: null, contact: null, footer: null }
}