'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getAllProducts, getAllProductsWithImages } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { loading: authLoading } = useAuth()

  const loadAllData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔄 Starting background data preload...', 'Auth loading:', authLoading)

      // Load critical data first, then everything else in background
      const [
        productsResult,
        categoriesResult,
        ordersResult,
        customersResult,
        contentResults
      ] = await Promise.allSettled([
        // Products with images and colors
        getAllProductsWithImages().catch(() => []),

        // Categories
        supabase.from('categories').select('*').then((res: any) => res.data || []),

        // Orders (for stats) - fallback to empty array since orders table doesn't exist yet
        Promise.resolve([]),

        // Customers (for stats)
        supabase.from('profiles').select('*').then((res: any) => res.data || []),

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
        revenue: 0, // No orders table yet, so revenue is 0
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
    // Wait for auth to complete before loading data
    if (!authLoading) {
      loadAllData()
    }
  }, [authLoading])

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