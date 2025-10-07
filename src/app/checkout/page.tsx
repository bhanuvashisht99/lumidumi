'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  agreeToTerms: boolean
  agreeToPrivacy: boolean
}

interface FormErrors {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  agreeToTerms?: string
  agreeToPrivacy?: string
}

export default function CheckoutPage() {
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState<CheckoutForm>({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [cartLoaded, setCartLoaded] = useState(false)

  // Wait for cart to load from localStorage before checking if empty
  useEffect(() => {
    const timer = setTimeout(() => {
      setCartLoaded(true)
    }, 100) // Small delay to allow cart context to load from localStorage

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (cartLoaded && items.length === 0) {
      router.push('/cart')
    }
  }, [items, router, cartLoaded])

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const subtotal = getTotalPrice()
  const gst = Math.round(subtotal * 0.18)
  const total = subtotal + gst

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required'
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to terms of service'
    if (!formData.agreeToPrivacy) newErrors.agreeToPrivacy = 'You must agree to privacy policy'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    const phoneRegex = /^[6-9]\d{9}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createRazorpayOrder = async () => {
    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error:', errorData)
        throw new Error(`Failed to create order: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating Razorpay order:', error)
      throw error
    }
  }

  const handlePayment = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const orderData = await createRazorpayOrder()

      // Check if Razorpay key is available - get from environment at build time
      const razorpayKey = 'rzp_test_RQcQeEz3nDpkKm' // Your test key
      if (!razorpayKey) {
        alert('Payment gateway not configured. Please contact support.')
        setLoading(false)
        return
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Lumidumi',
        description: `Order for ${getTotalItems()} items`,
        order_id: orderData.id,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#D4A574' // cream-300 color
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        },
        handler: async function (response: any) {
          // Payment successful
          try {
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  items,
                  customerInfo: formData,
                  total,
                },
              }),
            })

            if (verifyResponse.ok) {
              // Clear cart and redirect to success page
              clearCart()
              router.push(`/order-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&amount=${orderData.amount}`)
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const razor = new window.Razorpay(options)
      razor.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to initiate payment. Please try again.')
      setLoading(false)
    }
  }

  if (!cartLoaded || items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cream-300 mx-auto"></div>
          <p className="mt-4 text-charcoal">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-charcoal mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-charcoal mb-6">Shipping Information</h2>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${
                      errors.firstName ? 'border-red-300' : 'border-cream-200'
                    }`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${
                      errors.lastName ? 'border-red-300' : 'border-cream-200'
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${
                    errors.email ? 'border-red-300' : 'border-cream-200'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${
                    errors.phone ? 'border-red-300' : 'border-cream-200'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House number, street name, area"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${
                    errors.address ? 'border-red-300' : 'border-cream-200'
                  }`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${
                      errors.city ? 'border-red-300' : 'border-cream-200'
                    }`}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${
                      errors.state ? 'border-red-300' : 'border-cream-200'
                    }`}
                  >
                    <option value="">Select State</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit code"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${
                      errors.pincode ? 'border-red-300' : 'border-cream-200'
                    }`}
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <label className="text-sm text-charcoal">
                    I agree to the{' '}
                    <a href="/terms-of-service" target="_blank" className="text-cream-300 hover:underline">
                      Terms of Service
                    </a>
                    *
                  </label>
                </div>
                {errors.agreeToTerms && <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>}

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    name="agreeToPrivacy"
                    checked={formData.agreeToPrivacy}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <label className="text-sm text-charcoal">
                    I agree to the{' '}
                    <a href="/privacy-policy" target="_blank" className="text-cream-300 hover:underline">
                      Privacy Policy
                    </a>
                    *
                  </label>
                </div>
                {errors.agreeToPrivacy && <p className="text-red-500 text-xs">{errors.agreeToPrivacy}</p>}
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-charcoal mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-cream-100 rounded-lg flex items-center justify-center text-2xl">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      '🕯️'
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-charcoal">{item.product.name}</h3>
                    <p className="text-sm text-charcoal/60">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-cream-200 pt-4">
              <div className="flex justify-between">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span>{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-cream-200 pt-3">
                <span>Total</span>
                <span className="text-cream-300">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full btn-primary mt-6 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Pay ${formatPrice(total)}`
              )}
            </button>

            <div className="mt-4 text-center">
              <div className="flex justify-center items-center space-x-2 text-xs text-charcoal/60">
                <span>🔒 Secured by</span>
                <span className="font-medium">Razorpay</span>
              </div>
              <p className="text-xs text-charcoal/60 mt-1">
                Your payment information is secure and encrypted
              </p>
            </div>

            <div className="mt-6 text-xs text-charcoal/60 space-y-1">
              <p>By completing your purchase, you agree to our:</p>
              <div className="flex flex-wrap gap-1">
                <a href="/terms-of-service" className="text-cream-300 hover:underline">Terms</a>
                <span>•</span>
                <a href="/privacy-policy" className="text-cream-300 hover:underline">Privacy</a>
                <span>•</span>
                <a href="/refund-policy" className="text-cream-300 hover:underline">Refund</a>
                <span>•</span>
                <a href="/shipping-policy" className="text-cream-300 hover:underline">Shipping</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}