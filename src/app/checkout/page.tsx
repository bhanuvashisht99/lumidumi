'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getProfile, updateProfile } from '@/lib/database'

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
  const [saveAddress, setSaveAddress] = useState(true)
  const [addressLoaded, setAddressLoaded] = useState(false)
  const [paymentInProgress, setPaymentInProgress] = useState(false)

  // Wait for cart to load from localStorage before checking if empty
  useEffect(() => {
    const timer = setTimeout(() => {
      setCartLoaded(true)
    }, 100) // Small delay to allow cart context to load from localStorage

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Don't redirect to cart if we're in the middle of a payment process
    // Also check if we're already on a success page or just completed payment
    const isOnSuccessPage = typeof window !== 'undefined' && window.location.pathname.includes('order-success')
    const hasSuccessParams = typeof window !== 'undefined' && window.location.search.includes('payment_id')

    if (cartLoaded && items.length === 0 && !paymentInProgress && !isOnSuccessPage && !hasSuccessParams) {
      console.log('🛒 Cart is empty, redirecting to cart page')
      console.log('🛒 Cart state:', { cartLoaded, itemsLength: items.length, paymentInProgress, isOnSuccessPage, hasSuccessParams })

      // Add a small delay to prevent race conditions on mobile
      setTimeout(() => {
        router.push('/cart')
      }, 500)
    }
  }, [items, router, cartLoaded, paymentInProgress])

  // Load saved address data for logged-in users
  useEffect(() => {
    const loadSavedAddress = async () => {
      if (user && !addressLoaded) {
        try {
          const profile = await getProfile(user.id)
          if (profile && typeof profile === 'object') {
            setFormData(prev => ({
              ...prev,
              firstName: (profile as any).first_name || '',
              lastName: (profile as any).last_name || '',
              phone: (profile as any).phone || '',
              address: (profile as any).address || '',
              city: (profile as any).city || '',
              state: (profile as any).state || '',
              pincode: (profile as any).pincode || ''
            }))
          }
        } catch (error) {
          console.error('Error loading saved address:', error)
        } finally {
          setAddressLoaded(true)
        }
      }
    }

    loadSavedAddress()
  }, [user, addressLoaded])

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

  const [deliveryCharges, setDeliveryCharges] = useState(0)

  const subtotal = getTotalPrice()
  const total = subtotal + deliveryCharges

  useEffect(() => {
    // Calculate delivery charges based on location
    const calculateDelivery = () => {
      const state = formData.state?.toLowerCase().trim() || ''
      const city = formData.city?.toLowerCase().trim() || ''

      // Specific NCR Cities (excluding Delhi which is handled by state)
      const ncrCities = ['gurgaon', 'gurugram', 'ghaziabad', 'faridabad', 'bahadurgarh']

      // Special check for Noida to exclude Greater Noida
      // User requested "only noida not greater noida"
      const isNoida = city.includes('noida') && !city.includes('greater noida')

      // Check if location is Delhi or NCR
      // 1. State is Delhi
      // 2. City includes one of the specific NCR cities
      // 3. City is Noida (but not Greater Noida)
      // 4. City itself is Delhi/New Delhi (in case user selected different state by mistake)
      const isDelhiNCR =
        state === 'delhi' ||
        state === 'new delhi' ||
        city === 'delhi' ||
        city === 'new delhi' ||
        ncrCities.some(ncrCity => city.includes(ncrCity)) ||
        isNoida

      // Set charges: 99 for Delhi/NCR, 199 for others
      if (state || city) {
        setDeliveryCharges(isDelhiNCR ? 99 : 199)
      } else {
        setDeliveryCharges(0) // Default/Initial state
      }
    }

    calculateDelivery()
  }, [formData.state, formData.city])

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
      // For guest users, create a temporary account using phone number
      if (!user) {
        console.log('🔄 Guest checkout - creating temporary account')
        // We'll handle guest checkout in the payment success handler
        // No need to block payment flow for account creation
      }

      const orderData = await createRazorpayOrder()

      // Check if Razorpay key is available and clean it
      const razorpayKey = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_Ra0RjypHjpQHUZ').replace(/\s/g, '')
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
        config: {
          display: {
            hide: [
              {
                method: 'upi',
                flows: ['qr']
              }
            ]
          }
        },
        handler: async function (response: any) {
          // Payment successful
          console.log('🎉 Razorpay payment successful, processing verification...')
          console.log('💳 Payment response from Razorpay:', {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            hasSignature: !!response.razorpay_signature
          })

          // Set payment in progress to prevent cart redirect
          setPaymentInProgress(true)

          try {
            // If guest user, create account before processing payment
            let isGuestAccount = false
            if (!user) {
              console.log('🔄 Guest checkout detected - creating guest account')
              try {
                // Create guest account with phone and email
                console.log('📞 Creating guest account with:', {
                  phone: formData.phone,
                  email: formData.email,
                  firstName: formData.firstName,
                  lastName: formData.lastName
                })

                const guestResponse = await fetch('/api/auth/create-guest', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    phone: formData.phone,
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                  }),
                })

                console.log('📞 Guest account creation response status:', guestResponse.status)

                if (guestResponse.ok) {
                  isGuestAccount = true
                  const guestData = await guestResponse.json()
                  console.log('✅ Guest account created successfully:', guestData)
                } else {
                  const errorText = await guestResponse.text()
                  console.log('⚠️ Guest account creation failed:', guestResponse.status, errorText)
                  console.log('⚠️ Proceeding with order anyway')
                }
              } catch (guestError) {
                console.error('❌ Guest account error:', guestError)
                // Continue with order even if guest account fails
              }
            } else {
              console.log('👤 Authenticated user checkout')
            }

            console.log('🔐 Starting payment verification request...')
            const verificationPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: {
                items,
                customerInfo: formData,
                total,
                isGuestOrder: !user,
                guestAccountCreated: isGuestAccount,
              },
            }

            console.log('📋 Verification payload:', {
              order_id: verificationPayload.razorpay_order_id,
              payment_id: verificationPayload.razorpay_payment_id,
              hasSignature: !!verificationPayload.razorpay_signature,
              total: verificationPayload.orderDetails.total,
              customerEmail: verificationPayload.orderDetails.customerInfo.email,
              itemsCount: verificationPayload.orderDetails.items.length,
              isGuestOrder: verificationPayload.orderDetails.isGuestOrder,
              guestAccountCreated: verificationPayload.orderDetails.guestAccountCreated
            })

            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(verificationPayload),
            })

            console.log('🔐 Payment verification response status:', verifyResponse.status)

            if (!verifyResponse.ok) {
              const errorText = await verifyResponse.text()
              console.error('❌ Payment verification request failed:', verifyResponse.status, errorText)
              throw new Error(`Verification request failed: ${verifyResponse.status} ${errorText}`)
            }

            const verifyData = await verifyResponse.json()
            console.log('💳 Payment verification response data:', verifyData)

            if (verifyResponse.ok && verifyData.verified) {
              console.log('✅ Payment verification successful!')

              // Save address to user profile if they're logged in and opted to save
              if (user && saveAddress) {
                try {
                  console.log('💾 Saving address to user profile...')
                  await updateProfile(user.id, {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode
                  })
                  console.log('✅ Address saved successfully')
                } catch (addressError) {
                  console.error('⚠️ Failed to save address:', addressError)
                  // Don't block order completion if address saving fails
                }
              }

              // Generate success URL first (use database order ID from verification response)
              const successUrl = `/order-success?payment_id=${response.razorpay_payment_id}&order_id=${verifyData.order_id}&amount=${orderData.amount}`
              console.log('🔗 Generated success URL:', successUrl)
              console.log('🔗 Using database order ID:', verifyData.order_id, 'vs Razorpay order ID:', response.razorpay_order_id)

              // Clear cart and redirect to success page
              console.log('🧹 Clearing cart and redirecting...')
              clearCart()

              if (isGuestAccount) {
                // Add guest account info to success page
                const finalUrl = `${successUrl}&guest=true`
                console.log('🔄 Redirecting guest user to success page:', finalUrl)

                // Mobile-specific redirect handling
                if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                  console.log('📱 Mobile detected - using delayed redirect for better compatibility')
                  // Longer delay for mobile to ensure payment processing completes
                  setTimeout(() => {
                    console.log('📱 Executing mobile redirect to:', finalUrl)
                    window.location.href = finalUrl
                  }, 500)
                } else {
                  window.location.replace(finalUrl)
                }
              } else {
                console.log('🔄 Redirecting registered user to success page:', successUrl)

                // Mobile-specific redirect handling
                if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                  console.log('📱 Mobile detected - using delayed redirect for better compatibility')
                  // Longer delay for mobile to ensure payment processing completes
                  setTimeout(() => {
                    console.log('📱 Executing mobile redirect to:', successUrl)
                    window.location.href = successUrl
                  }, 500)
                } else {
                  window.location.replace(successUrl)
                }
              }
            } else {
              console.error('❌ Payment verification failed:', verifyData)
              console.error('❌ Response status:', verifyResponse.status)
              console.error('❌ Verification result:', verifyData.verified)
              throw new Error(`Payment verification failed: ${verifyData.error || 'Unknown error'}`)
            }
          } catch (error) {
            console.error('❌ Critical error in payment handler:', error)
            console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
            setPaymentInProgress(false) // Reset payment flag on error
            alert(`Payment verification failed: ${error instanceof Error ? error.message : String(error)}. Please contact support.`)
          }
        },
        modal: {
          ondismiss: function () {
            console.log('🚪 Razorpay modal dismissed by user')
            setLoading(false)
            setPaymentInProgress(false) // Reset payment flag
          },
          on_payment_failed: function (response: any) {
            console.error('❌ Razorpay payment failed:', response)
            console.error('❌ Failed payment details:', {
              code: response.error?.code,
              description: response.error?.description,
              source: response.error?.source,
              step: response.error?.step,
              reason: response.error?.reason
            })
            alert(`Payment failed: ${response.error?.description || 'Unknown error'}. Please try again or use a different payment method.`)
            setLoading(false)
            setPaymentInProgress(false) // Reset payment flag
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">Checkout</h1>
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Guest Checkout</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    No account needed! We'll create one for you automatically after your order is complete.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${errors.firstName ? 'border-red-300' : 'border-cream-200'
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${errors.lastName ? 'border-red-300' : 'border-cream-200'
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${errors.email ? 'border-red-300' : 'border-cream-200'
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${errors.phone ? 'border-red-300' : 'border-cream-200'
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${errors.address ? 'border-red-300' : 'border-cream-200'
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${errors.city ? 'border-red-300' : 'border-cream-200'
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${errors.state ? 'border-red-300' : 'border-cream-200'
                      }`}
                  >
                    <option value="">Select State</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 ${errors.pincode ? 'border-red-300' : 'border-cream-200'
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

                {/* Address saving option for logged-in users */}
                {user && (
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      name="saveAddress"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="mt-1"
                    />
                    <label className="text-sm text-charcoal">
                      Save this address to my profile for future orders
                    </label>
                  </div>
                )}
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
                <span>Delivery Charges</span>
                <span className={deliveryCharges === 0 ? "text-green-600" : ""}>
                  {deliveryCharges === 0 ? 'Free' : formatPrice(deliveryCharges)}
                </span>
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