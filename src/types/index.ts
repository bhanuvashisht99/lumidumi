export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  created_at: string
}

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  product: Product
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: ShippingAddress
  items: OrderItem[]
  payment_id?: string
  razorpay_order_id?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product: Product
}

export interface ShippingAddress {
  name: string
  email: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface CustomOrder {
  id: string
  user_id: string
  name: string
  email: string
  phone: string
  description: string
  budget_range: string
  status: 'pending' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  quote_amount?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  role: 'customer' | 'admin'
  created_at: string
}