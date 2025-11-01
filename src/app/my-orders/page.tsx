'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address?: any
  razorpay_payment_id?: string
  order_items?: any[]
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchUserOrders()
  }, [user, router])

  const fetchUserOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Fetching user orders...')

      // Get the current session to get the access token
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.error('❌ No valid session found')
        throw new Error('No valid session found')
      }

      console.log('✅ Valid session found, making API request...')

      const response = await fetch('/api/user/orders', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      console.log('📡 API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API request failed:', response.status, errorText)
        throw new Error(`Failed to fetch orders: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Orders fetched successfully:', data.length, 'orders')
      setOrders(data)
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      setError(`Failed to load your orders: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  if (!user) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cream-300 mx-auto"></div>
          <p className="mt-4 text-charcoal">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">My Orders</h1>
          <p className="text-charcoal/60 mt-2">Track and manage your orders</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cream-300 mx-auto mb-4"></div>
            <p className="text-charcoal/60">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchUserOrders}
              className="bg-cream-300 text-white px-6 py-2 rounded-lg hover:bg-cream-300/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-charcoal/40 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-charcoal mb-2">No orders yet</h3>
            <p className="text-charcoal/60 mb-6">When you place orders, they'll appear here</p>
            <a
              href="/products"
              className="bg-cream-300 text-white px-6 py-3 rounded-lg hover:bg-cream-300/90 transition-colors inline-block"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-cream-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-charcoal">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-charcoal/60">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-semibold text-charcoal mt-1">
                        ₹{order.total_amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-charcoal mb-2">Items:</h4>
                      <div className="space-y-2">
                        {order.order_items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="text-charcoal">{item.product_name || 'Product'}</span>
                              {item.selected_color && (
                                <span className="text-charcoal/60"> • {item.selected_color}</span>
                              )}
                              <span className="text-charcoal/60"> × {item.quantity}</span>
                            </div>
                            <span className="text-charcoal font-medium">
                              ₹{(item.price * item.quantity)?.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  {order.shipping_address && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-charcoal mb-1">Shipping to:</h4>
                      <p className="text-sm text-charcoal/60">
                        {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-cream-100">
                    <div className="text-sm text-charcoal/60">
                      {order.razorpay_payment_id && (
                        <span>Payment ID: {order.razorpay_payment_id.slice(-8)}</span>
                      )}
                    </div>
                    <a
                      href={`/track-order?id=${order.id}`}
                      className="text-cream-300 hover:text-cream-300/80 text-sm font-medium"
                    >
                      Track Order →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}