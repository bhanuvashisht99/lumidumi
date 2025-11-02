'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAllOrders, Order } from '@/lib/database'

interface OrderWithExtras extends Order {
  customer_name: string
  customer_email: string
  customer_phone: string
  razorpay_payment_id?: string
  tracking_number?: string
  tracking_url?: string
  status_updated_at?: string
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<OrderWithExtras[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithExtras | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showTrackingForm, setShowTrackingForm] = useState(false)

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

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingData?: { trackingNumber?: string; trackingUrl?: string }) => {
    try {
      setIsUpdatingStatus(true)

      const updateData: Record<string, string | null> = {
        status: newStatus,
        status_updated_at: new Date().toISOString()
      }

      if (trackingData?.trackingNumber) {
        updateData.tracking_number = trackingData.trackingNumber
      }
      if (trackingData?.trackingUrl) {
        updateData.tracking_url = trackingData.trackingUrl
      }

      const response = await fetch('/api/admin/update-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          updateData
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update order status')
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, ...updateData }
            : order
        )
      )

      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updateData } : null)
      }

      setShowTrackingForm(false)

      // Show success message
      alert(`Order status updated to ${newStatus}`)

    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="text-xs text-charcoal/50 mt-1">
                        {order.order_items.slice(0, 2).map((item: any, idx: number) => (
                          <span key={idx}>
                            {item.product_name || 'Product'}
                            {item.selected_color && ` (${item.selected_color})`}
                            {idx < Math.min(order.order_items?.length || 0, 2) - 1 && ', '}
                          </span>
                        ))}
                        {order.order_items.length > 2 && <span> +{order.order_items.length - 2} more</span>}
                      </div>
                    )}
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
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-charcoal">Order Information</h4>
                    <button
                      onClick={() => setShowTrackingForm(!showTrackingForm)}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md border-2 border-blue-600"
                      disabled={isUpdatingStatus}
                    >
                      📝 Update Status
                    </button>
                  </div>

                  {/* Status Update Form */}
                  {showTrackingForm && (
                    <div className="bg-white p-4 rounded-lg border mb-4">
                      <h5 className="font-medium text-charcoal mb-3">Update Order Status</h5>
                      <TrackingForm
                        currentStatus={selectedOrder.status}
                        currentTracking={{
                          trackingNumber: selectedOrder.tracking_number || '',
                          trackingUrl: selectedOrder.tracking_url || ''
                        }}
                        onUpdate={(status, trackingData) => updateOrderStatus(selectedOrder.id, status, trackingData)}
                        onCancel={() => setShowTrackingForm(false)}
                        isLoading={isUpdatingStatus}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-charcoal/60">Status:</span>
                      <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                      {selectedOrder.status_updated_at && (
                        <p className="text-xs text-charcoal/50 mt-1">
                          Updated: {formatDateTime(selectedOrder.status_updated_at)}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-charcoal/60">Total Amount:</span>
                      <p className="font-medium">₹{selectedOrder.total_amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-charcoal/60">Order Date & Time:</span>
                      <p>{formatDateTime(selectedOrder.created_at)}</p>
                    </div>
                    {selectedOrder.razorpay_payment_id && (
                      <div>
                        <span className="text-charcoal/60">Payment ID:</span>
                        <p className="font-mono text-xs">{selectedOrder.razorpay_payment_id}</p>
                      </div>
                    )}
                  </div>

                  {/* Tracking Information */}
                  {(selectedOrder.tracking_number || selectedOrder.tracking_url) && (
                    <div className="mt-4 pt-4 border-t border-cream-200">
                      <h5 className="font-medium text-charcoal mb-2">Tracking Information</h5>
                      <div className="space-y-1 text-sm">
                        {selectedOrder.tracking_number && (
                          <div>
                            <span className="text-charcoal/60">Tracking Number:</span>
                            <p className="font-mono">{selectedOrder.tracking_number}</p>
                          </div>
                        )}
                        {selectedOrder.tracking_url && (
                          <div>
                            <span className="text-charcoal/60">Track Package:</span>
                            <a
                              href={selectedOrder.tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline block"
                            >
                              View Tracking Details →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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

interface TrackingFormProps {
  currentStatus: string
  currentTracking: {
    trackingNumber: string
    trackingUrl: string
  }
  onUpdate: (status: string, trackingData?: { trackingNumber?: string; trackingUrl?: string }) => void
  onCancel: () => void
  isLoading: boolean
}

function TrackingForm({ currentStatus, currentTracking, onUpdate, onCancel, isLoading }: TrackingFormProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [trackingNumber, setTrackingNumber] = useState(currentTracking.trackingNumber)
  const [trackingUrl, setTrackingUrl] = useState(currentTracking.trackingUrl)

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(selectedStatus, {
      trackingNumber: trackingNumber.trim() || undefined,
      trackingUrl: trackingUrl.trim() || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Status Selection */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-2">
          Order Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((status) => (
            <label
              key={status.value}
              className={`relative flex items-center justify-center p-3 text-sm font-medium rounded-lg border cursor-pointer transition-colors ${
                selectedStatus === status.value
                  ? `${status.color} border-current`
                  : 'bg-white text-charcoal/60 border-cream-200 hover:bg-cream-50'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={status.value}
                checked={selectedStatus === status.value}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="sr-only"
              />
              {status.label}
            </label>
          ))}
        </div>
      </div>

      {/* Tracking Information - Show for shipped/delivered status */}
      {(selectedStatus === 'shipped' || selectedStatus === 'delivered') && (
        <div className="space-y-3 bg-cream-50 p-3 rounded-lg">
          <h6 className="font-medium text-charcoal">Tracking Information</h6>

          <div>
            <label className="block text-sm text-charcoal/60 mb-1">
              Tracking Number (Optional)
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g., 1Z999AA1234567890"
              className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-charcoal/60 mb-1">
              Tracking URL (Optional)
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://track.delhivery.com/..."
              className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-500 text-sm"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-md border-2 border-blue-600"
        >
          {isLoading ? 'Updating...' : 'Update Order'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-medium rounded-lg border border-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}