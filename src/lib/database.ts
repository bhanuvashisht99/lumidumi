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
      .select(`
        *,
        category:categories(*)
      `)
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
    .select(`
      *,
      category:categories(*)
    `)
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
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching product by slug:', error)
    return null
  }

  return data
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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

  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all products:', error)
    return []
  }

  return data || []
}

export async function createProduct(productData: Partial<Product>) {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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