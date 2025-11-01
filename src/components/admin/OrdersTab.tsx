'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAllOrders } from '@/lib/database'

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

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [])

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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cream-300 mx-auto mb-3"></div>
        <p className="text-charcoal/60">Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchOrders} className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-charcoal">Recent Orders</h2>
        <button
          onClick={fetchOrders}
          className="btn-secondary"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 bg-cream-50 rounded-lg">
          <p className="text-charcoal/60">No orders found yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="p-4 bg-cream-50 rounded-lg border hover:bg-cream-100 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-charcoal">#{order.id.slice(-8).toUpperCase()}</p>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-charcoal">
                      {order.customer_name || 'Unknown Customer'}
                    </p>
                    <p className="text-sm text-charcoal/60">
                      📧 {order.customer_email || 'No email'}
                    </p>
                    {order.customer_phone && (
                      <p className="text-sm text-charcoal/60">
                        📞 {order.customer_phone}
                      </p>
                    )}
                    <p className="text-sm text-charcoal/60">
                      🛍️ {order.order_items?.length || 0} items • ₹{order.total_amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-charcoal/50">
                      📅 {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="ml-4 text-charcoal/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-charcoal">
                  Order #{selectedOrder.id.slice(-8).toUpperCase()}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-charcoal/40 hover:text-charcoal p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Status & Payment */}
                <div className="bg-cream-50 p-4 rounded-lg">
                  <h4 className="font-medium text-charcoal mb-3">Order Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-charcoal/60">Status:</span>
                      <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                    </div>
                    <div>
                      <span className="text-charcoal/60">Total Amount:</span>
                      <p className="font-medium">₹{selectedOrder.total_amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-charcoal/60">Order Date:</span>
                      <p>{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    {selectedOrder.razorpay_payment_id && (
                      <div>
                        <span className="text-charcoal/60">Payment ID:</span>
                        <p className="font-mono text-xs">{selectedOrder.razorpay_payment_id}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-cream-50 p-4 rounded-lg">
                  <h4 className="font-medium text-charcoal mb-3">Customer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-charcoal/60">Name:</span>
                      <p className="font-medium">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <span className="text-charcoal/60">Email:</span>
                      <p>{selectedOrder.customer_email}</p>
                    </div>
                    {selectedOrder.customer_phone && (
                      <div>
                        <span className="text-charcoal/60">Phone:</span>
                        <p>{selectedOrder.customer_phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <div className="bg-cream-50 p-4 rounded-lg">
                    <h4 className="font-medium text-charcoal mb-3">Shipping Address</h4>
                    <div className="text-sm">
                      <p>{selectedOrder.shipping_address.address}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                      <p>PIN: {selectedOrder.shipping_address.pincode}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                  <div className="bg-cream-50 p-4 rounded-lg">
                    <h4 className="font-medium text-charcoal mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.order_items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-cream-200 last:border-b-0">
                          <div>
                            <p className="font-medium text-sm">{item.product_name || 'Product'}</p>
                            {item.selected_color && (
                              <p className="text-xs text-charcoal/60">Color: {item.selected_color}</p>
                            )}
                            <p className="text-xs text-charcoal/60">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">₹{(item.price * item.quantity)?.toLocaleString()}</p>
                            <p className="text-xs text-charcoal/60">₹{item.price} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}