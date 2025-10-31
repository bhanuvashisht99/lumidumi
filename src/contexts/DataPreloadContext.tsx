'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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
  publicProducts: any[] // Only active products for public use
}

const DataPreloadContext = createContext<DataPreloadContextType | undefined>(undefined)

export function DataPreloadProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PreloadedData | null>(null)
  const [publicProducts, setPublicProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { loading: authLoading, user } = useAuth()

  const loadAllData = async () => {
    if (authLoading) return

    try {
      setIsLoading(true)
      setError(null)

      console.log('📊 [DataPreload] Loading all data (minimal)...', user?.email || 'anonymous')
      console.log('📊 [DataPreload] Auth loading:', authLoading, 'User:', user?.email)

      // Load products with images and colors (all products for admin)
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            url,
            alt_text,
            sort_order,
            is_primary
          ),
          product_colors (
            id,
            color_name,
            color_code,
            price_modifier,
            stock_quantity,
            is_available
          )
        `)
        .order('created_at', { ascending: false })

      // Load categories (all categories for admin)
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')

      // Load customers
      const { data: customersData } = await supabase
        .from('profiles')
        .select('*')

      console.log('📊 [DataPreload] Raw products data:', productsData?.length || 0, 'products')

      // Transform products data to flatten images and colors
      const products = (productsData || []).map((product: any) => ({
        ...product,
        images: product.product_images || [],
        colors: product.product_colors || []
      }))

      console.log('📊 [DataPreload] Transformed products:', products.length)

      // Filter only active products for public use
      const activeProducts = products.filter((product: any) => product.is_active === true)

      console.log('📊 [DataPreload] Active products for public:', activeProducts.length)

      const categories = categoriesData || []
      const customers = customersData || []

      const preloadedData: PreloadedData = {
        products, // All products for admin
        categories,
        orders: [], // No orders table yet
        customers,
        content: {
          hero: null,
          about: null,
          pricing: null,
          contact: null,
          footer: null
        },
        stats: {
          totalProducts: products.length,
          totalOrders: 0,
          revenue: 0,
          totalCustomers: customers.length
        }
      }

      setData(preloadedData)
      setPublicProducts(activeProducts)

      console.log('✅ [DataPreload] Data loaded successfully (minimal):', {
        products: products.length,
        categories: categories.length,
        customers: customers.length,
        activeProducts: activeProducts.length
      })
      console.log('✅ [DataPreload] Setting publicProducts state:', activeProducts)

    } catch (err) {
      console.error('❌ Data load failed:', err)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    await loadAllData()
  }

  // Load data when auth is ready
  useEffect(() => {
    console.log('📊 [DataPreload] useEffect triggered - authLoading:', authLoading)
    if (!authLoading) {
      console.log('📊 [DataPreload] Auth ready, calling loadAllData()')
      loadAllData()
    } else {
      console.log('📊 [DataPreload] Auth still loading, waiting...')
    }
  }, [authLoading])

  return (
    <DataPreloadContext.Provider value={{
      data,
      isLoading,
      error,
      refreshData,
      publicProducts
    }}>
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