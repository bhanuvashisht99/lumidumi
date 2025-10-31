import { supabase } from './supabase'

// Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  category_id?: string
  stock_quantity: number
  is_active: boolean
  featured: boolean
  weight?: number
  burn_time?: number
  scent_description?: string
  ingredients?: string
  care_instructions?: string
  slug: string
  created_at: string
  updated_at: string
  category?: Category
}

export interface Category {
  id: string
  name: string
  description?: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  status: string
  total_amount: number
  currency: string
  payment_status: string
  payment_id?: string
  shipping_address?: any
  billing_address?: any
  notes?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: Product
}

export interface CustomOrder {
  id: string
  user_id?: string
  name: string
  email: string
  phone?: string
  description: string
  requirements?: string
  budget_range?: string
  deadline?: string
  status: string
  quoted_price?: number
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  created_at: string
  updated_at: string
}

// Products
export async function getProducts(featured?: boolean) {
  try {
    // Check if we have valid Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      throw new Error('Supabase not configured')
    }

    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (featured) {
      query = query.eq('featured', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getProducts:', error)
    throw error
  }
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}

export async function getProductBySlug(slug: string) {
  console.log('🔍 getProductBySlug called with:', slug)

  // First try to find by slug
  let { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  console.log('📊 Database query result:', { data, error })

  // If not found and slug looks like a UUID, try to find by ID
  if (error && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
    console.log('🔄 Trying UUID lookup for:', slug)
    const result = await supabase
      .from('products')
      .select('*')
      .eq('id', slug)
      .eq('is_active', true)
      .single()

    data = result.data
    error = result.error
    console.log('📊 UUID query result:', { data, error })
  }

  if (error) {
    console.error('❌ Error fetching product by slug/id:', error)
    return null
  }

  console.log('✅ Returning product data:', data)
  console.log('🔍 Product ID:', (data as any)?.id, 'Type:', typeof (data as any)?.id)
  return data
}

export async function getAllProductsWithImages() {
  try {
    // Get products
    const products = await getAllProducts()

    if (!products || products.length === 0) {
      return []
    }

    // For each product, fetch its images and colors
    const productsWithRelations = await Promise.allSettled(
      products.map(async (product: any) => {
        try {
          // Fetch images and colors in parallel
          const [imagesResult, colorsResult] = await Promise.allSettled([
            supabase
              .from('product_images')
              .select('*')
              .eq('product_id', product.id)
              .order('sort_order', { ascending: true }),
            supabase
              .from('product_colors')
              .select('*')
              .eq('product_id', product.id)
              .order('created_at', { ascending: true })
          ])

          const images = imagesResult.status === 'fulfilled' && imagesResult.value.data ? imagesResult.value.data : []
          const colors = colorsResult.status === 'fulfilled' && colorsResult.value.data ? colorsResult.value.data : []

          return { ...product, images, colors }
        } catch (error) {
          console.warn(`Failed to fetch relations for product ${product.name}:`, error)
          return { ...product, images: [], colors: [] }
        }
      })
    )

    // Extract successful results
    const results = productsWithRelations
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value)

    return results
  } catch (error) {
    console.error('Error in getAllProductsWithImages:', error)
    return []
  }
}

// Categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export async function getCategory(id: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return data
}

// Orders
export async function createOrder(orderData: Partial<Order>) {
  const { data, error } = await (supabase as any)
    .from('orders')
    .insert([orderData])
    .select()
    .single()

  if (error) {
    console.error('Error creating order:', error)
    throw error
  }

  return data
}

export async function getUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        product:products(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user orders:', error)
    return []
  }

  return data || []
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await (supabase as any)
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    console.error('Error updating order status:', error)
    throw error
  }

  return data
}

// Order Items
export async function createOrderItems(orderItems: Partial<OrderItem>[]) {
  const { data, error } = await (supabase as any)
    .from('order_items')
    .insert(orderItems)
    .select()

  if (error) {
    console.error('Error creating order items:', error)
    throw error
  }

  return data
}

// Custom Orders
export async function createCustomOrder(customOrderData: Partial<CustomOrder>) {
  const { data, error } = await (supabase as any)
    .from('custom_orders')
    .insert([customOrderData])
    .select()
    .single()

  if (error) {
    console.error('Error creating custom order:', error)
    throw error
  }

  return data
}

export async function getCustomOrders(userId?: string) {
  let query = supabase
    .from('custom_orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching custom orders:', error)
    return []
  }

  return data || []
}

export async function updateCustomOrderStatus(customOrderId: string, status: string, adminNotes?: string) {
  const updateData: any = { status }
  if (adminNotes) {
    updateData.admin_notes = adminNotes
  }

  const { data, error } = await (supabase as any)
    .from('custom_orders')
    .update(updateData)
    .eq('id', customOrderId)
    .select()
    .single()

  if (error) {
    console.error('Error updating custom order status:', error)
    throw error
  }

  return data
}

// Profiles
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export async function createProfile(profileData: Partial<Profile>) {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .insert([profileData])
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    throw error
  }

  return data
}

export async function updateProfile(userId: string, profileData: Partial<Profile>) {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw error
  }

  return data
}

// Admin functions
export async function getAllProducts() {
  try {
    // First try with category join
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!category_id(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error with category join, trying without:', error)
      // Fallback: fetch without category join
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (productsError) {
        console.error('Error fetching products:', productsError)
        return []
      }

      return productsData || []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllProducts:', error)
    return []
  }
}

export async function createProduct(productData: Partial<Product>) {
  const { data, error } = await (supabase as any)
    .from('products')
    .insert([productData])
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    throw error
  }

  return data
}

export async function updateProduct(productId: string, productData: Partial<Product>) {
  const { data, error } = await (supabase as any)
    .from('products')
    .update(productData)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    throw error
  }

  return data
}

export async function deleteProduct(productId: string) {
  const { data, error } = await (supabase as any)
    .from('products')
    .update({ is_active: false })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    console.error('Error deleting product:', error)
    throw error
  }

  return data
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profile:profiles(*),
      order_items(
        *,
        product:products(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all orders:', error)
    return []
  }

  return data || []
}