'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/solid'
import { CubeIcon } from '@heroicons/react/24/outline'

interface Order {
  id: string
  razorpay_order_id: string
  razorpay_payment_id: string
  total_amount: number
  status: string
  customer_name: string
  customer_email: string
  shipping_address: any
  created_at: string
  order_items: Array<{
    product_name: string
    quantity: number
    price: number
    selected_color?: string
    product_image_url?: string
  }>
}

export default function TrackOrderPage() {
  const [email, setEmail] = useState('')
  const [orderId, setOrderId] = useState('')
  const [mobile, setMobile] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalFound, setTotalFound] = useState(0)

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)
    setTotalFound(0)

    // Validate that at least one field is provided
    const trimmedEmail = email.trim()
    const trimmedOrderId = orderId.trim()
    const trimmedMobile = mobile.trim()

    if (!trimmedEmail && !trimmedOrderId && !trimmedMobile) {
      setError('Please provide at least one: email, mobile number, or order ID')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail || undefined,
          orderId: trimmedOrderId || undefined,
          mobile: trimmedMobile || undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Order not found')
      } else {
        setOrder(data.order)
        setTotalFound(data.totalFound || 1)
      }
    } catch (err) {
      setError('Failed to track order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case 'processing':
        return <CubeIcon className="h-6 w-6 text-blue-500" />
      case 'shipped':
        return <TruckIcon className="h-6 w-6 text-purple-500" />
      case 'delivered':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />
      default:
        return <ClockIcon className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Order Confirmed'
      case 'processing':
        return 'Being Crafted'
      case 'shipped':
        return 'Shipped'
      case 'delivered':
        return 'Delivered'
      default:
        return 'Pending'
    }
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-4">Track Your Order</h1>
          <p className="text-lg text-charcoal/70">
            Enter any of the following to find your order: email, mobile number, or order ID
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <p className="text-sm text-charcoal/60 mb-4 text-center">
            💡 Fill in any one or more fields below to find your order
          </p>
          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                  Email Address <span className="text-charcoal/40">(optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:ring-2 focus:ring-cream-300 focus:border-cream-300"
                />
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-charcoal mb-2">
                  Mobile Number <span className="text-charcoal/40">(optional)</span>
                </label>
                <input
                  type="tel"
                  id="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:ring-2 focus:ring-cream-300 focus:border-cream-300"
                />
              </div>

              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-charcoal mb-2">
                  Order / Payment ID <span className="text-charcoal/40">(optional)</span>
                </label>
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Order or Payment ID"
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:ring-2 focus:ring-cream-300 focus:border-cream-300"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cream-300 text-white px-6 py-3 rounded-lg hover:bg-cream-400 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Tracking...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  Track Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {totalFound > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-700 text-sm">
                  📋 Found {totalFound} orders matching your search. Showing your most recent order below.
                </p>
              </div>
            )}
            <div className="border-b border-cream-200 pb-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-charcoal">Order Details</h2>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="font-semibold text-charcoal">
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-charcoal mb-2">Order Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-charcoal/70">Order ID:</span> {order.id}</p>
                    <p><span className="text-charcoal/70">Payment ID:</span> {order.razorpay_payment_id}</p>
                    <p><span className="text-charcoal/70">Order Date:</span> {formatDate(order.created_at)}</p>
                    <p><span className="text-charcoal/70">Total Amount:</span> {formatPrice(order.total_amount)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-charcoal mb-2">Shipping Address</h3>
                  <div className="text-sm text-charcoal/70">
                    <p>{order.customer_name}</p>
                    <p>{order.shipping_address.address}</p>
                    <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                    <p>{order.shipping_address.pincode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-charcoal mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.order_items.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-cream-50 rounded-lg">
                    {item.product_image_url && (
                      <img
                        src={item.product_image_url}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-charcoal">{item.product_name}</h4>
                      {item.selected_color && (
                        <p className="text-sm text-charcoal/70">Color: {item.selected_color}</p>
                      )}
                      <p className="text-sm text-charcoal/70">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-charcoal">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="mt-8 pt-6 border-t border-cream-200">
              <h3 className="font-semibold text-charcoal mb-4">Order Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-charcoal">Order placed and payment confirmed</span>
                </div>
                <div className={`flex items-center gap-3 ${order.status === 'confirmed' ? 'text-charcoal/50' : ''}`}>
                  <CubeIcon className={`h-5 w-5 ${order.status !== 'confirmed' ? 'text-blue-500' : 'text-gray-300'}`} />
                  <span className="text-sm">Handcrafting your candles</span>
                </div>
                <div className={`flex items-center gap-3 ${['confirmed', 'processing'].includes(order.status) ? 'text-charcoal/50' : ''}`}>
                  <TruckIcon className={`h-5 w-5 ${order.status === 'shipped' ? 'text-purple-500' : 'text-gray-300'}`} />
                  <span className="text-sm">Order shipped</span>
                </div>
                <div className={`flex items-center gap-3 ${order.status !== 'delivered' ? 'text-charcoal/50' : ''}`}>
                  <CheckCircleIcon className={`h-5 w-5 ${order.status === 'delivered' ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className="text-sm">Order delivered</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-2">Need Help?</h3>
          <p className="text-sm text-charcoal/70 mb-4">
            Can't find your order or have questions? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:support@lumidumi.com"
              className="bg-cream-300 text-white px-4 py-2 rounded-lg hover:bg-cream-400 transition-colors text-sm font-medium text-center"
            >
              Email Support
            </a>
            <a
              href="/login"
              className="border border-cream-300 text-cream-300 px-4 py-2 rounded-lg hover:bg-cream-50 transition-colors text-sm font-medium text-center"
            >
              Login to View All Orders
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}