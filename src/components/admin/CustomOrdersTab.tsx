'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCustomOrders } from '@/lib/database'

interface CustomOrder {
  id: string
  name: string
  email: string
  phone?: string
  description: string
  budget_range?: string
  deadline?: string
  status: string
  quoted_price?: number
  created_at: string
}

export default function CustomOrdersTab() {
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteData, setQuoteData] = useState({
    quotedPrice: '',
    adminNotes: '',
    deliveryTime: '',
    terms: ''
  })

  const fetchCustomOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCustomOrders()
      setCustomOrders(data)
    } catch (error) {
      console.error('Error fetching custom orders:', error)
      setError('Failed to load custom orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomOrders()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
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

  const handleSendQuote = (order: CustomOrder) => {
    setSelectedOrder(order)
    setQuoteData({
      quotedPrice: '',
      adminNotes: '',
      deliveryTime: '',
      terms: 'Payment: 50% advance, 50% on delivery\nCustomizations included as discussed\nDelivery charges may apply based on location'
    })
    setShowQuoteModal(true)
  }

  const submitQuote = async () => {
    if (!selectedOrder || !quoteData.quotedPrice) {
      alert('Please enter a quoted price')
      return
    }

    try {
      const response = await fetch('/api/admin/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          quotedPrice: parseFloat(quoteData.quotedPrice),
          adminNotes: quoteData.adminNotes,
          deliveryTime: quoteData.deliveryTime,
          terms: quoteData.terms,
          customerEmail: selectedOrder.email,
          customerName: selectedOrder.name,
          orderDescription: selectedOrder.description
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send quote')
      }

      setCustomOrders(orders =>
        orders.map(order =>
          order.id === selectedOrder.id
            ? { ...order, status: 'quoted', quoted_price: parseFloat(quoteData.quotedPrice) }
            : order
        )
      )

      setShowQuoteModal(false)
      setSelectedOrder(null)
      alert('Quote sent successfully!')
    } catch (error) {
      console.error('Error sending quote:', error)
      alert('Error sending quote. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cream-300 mx-auto mb-3"></div>
        <p className="text-charcoal/60">Loading custom orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchCustomOrders} className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-charcoal">Custom Order Requests</h2>
        <button
          onClick={fetchCustomOrders}
          className="btn-secondary"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {customOrders.length === 0 ? (
        <div className="text-center py-8 bg-cream-50 rounded-lg">
          <p className="text-charcoal/60">No custom orders found yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {customOrders.map((order) => (
            <div key={order.id} className="p-4 bg-cream-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-charcoal">{order.name}</p>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-sm text-charcoal/60 mb-2">
                {order.name} • {order.email}
                {order.phone && ` • ${order.phone}`}
              </p>
              <p className="text-sm text-charcoal mb-2">
                {order.description.slice(0, 150)}
                {order.description.length > 150 && '...'}
              </p>
              {order.budget_range && (
                <p className="text-sm text-charcoal/60 mb-2">
                  Budget: {order.budget_range}
                </p>
              )}
              {order.deadline && (
                <p className="text-sm text-charcoal/60 mb-2">
                  Deadline: {formatDate(order.deadline)}
                </p>
              )}
              <p className="text-xs text-charcoal/50 mb-3">
                Submitted: {formatDate(order.created_at)}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSendQuote(order)}
                  className="btn-secondary text-sm"
                  disabled={order.status === 'quoted'}
                >
                  {order.status === 'quoted' ? 'Quote Sent' : 'Send Quote'}
                </button>
                <button className="text-sm text-charcoal/60 hover:text-charcoal">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-charcoal mb-4">
              Send Quote for {selectedOrder.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Quoted Price (₹) *
                </label>
                <input
                  type="number"
                  value={quoteData.quotedPrice}
                  onChange={(e) => setQuoteData({...quoteData, quotedPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  placeholder="Enter price in rupees"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Delivery Time
                </label>
                <input
                  type="text"
                  value={quoteData.deliveryTime}
                  onChange={(e) => setQuoteData({...quoteData, deliveryTime: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  placeholder="e.g., 7-10 business days"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={quoteData.adminNotes}
                  onChange={(e) => setQuoteData({...quoteData, adminNotes: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  rows={3}
                  placeholder="Internal notes about this quote"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={quoteData.terms}
                  onChange={(e) => setQuoteData({...quoteData, terms: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  rows={4}
                  placeholder="Terms and conditions for this order"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowQuoteModal(false)
                  setSelectedOrder(null)
                }}
                className="px-4 py-2 text-charcoal/60 hover:text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={submitQuote}
                className="btn-primary"
              >
                Send Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}