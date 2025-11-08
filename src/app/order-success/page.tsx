'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<{
    payment_id?: string
    order_id?: string
    amount?: number
    isGuest?: boolean
  }>({})

  useEffect(() => {
    const payment_id = searchParams.get('payment_id')
    const order_id = searchParams.get('order_id')
    const amount = searchParams.get('amount')
    const isGuest = searchParams.get('guest') === 'true'

    if (!payment_id || !order_id) {
      router.push('/')
      return
    }

    setOrderDetails({
      payment_id,
      order_id,
      amount: amount ? parseFloat(amount) : undefined,
      isGuest
    })
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <CheckCircleIcon className="h-20 w-20 text-green-500" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-charcoal mb-4">
            Order Placed Successfully!
          </h1>

          <p className="text-lg text-charcoal/70 mb-8">
            Thank you for your order. We've received your payment and sent a confirmation email to your inbox. We'll start processing your handcrafted candles right away.
          </p>

          {/* Order Details */}
          {orderDetails.payment_id && (
            <div className="bg-cream-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-charcoal mb-4">Order Details</h2>

              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-charcoal/70">Payment ID:</span>
                  <span className="font-mono text-sm">{orderDetails.payment_id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-charcoal/70">Order ID:</span>
                  <span className="font-mono text-sm">{orderDetails.order_id}</span>
                </div>

                {orderDetails.amount && (
                  <div className="flex justify-between">
                    <span className="text-charcoal/70">Amount Paid:</span>
                    <span className="font-semibold">₹{(orderDetails.amount / 100).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guest Account Message */}
          {orderDetails.isGuest && (
            <div className="bg-green-50 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Account Created!</h3>
                  <p className="text-sm text-green-700 mt-1 mb-3">
                    We've automatically created an account for you with the email you provided. You can use this to track your orders and make future purchases even faster!
                  </p>
                  <div className="bg-white rounded-md p-3 border border-green-200">
                    <p className="text-sm text-green-800 font-medium mb-2">To access your account:</p>
                    <ol className="text-sm text-green-700 space-y-1">
                      <li>1. Check your email inbox for a password setup email</li>
                      <li>2. Click the link in the email to set your password</li>
                      <li>3. Go to the <Link href="/login" className="text-cream-300 hover:underline font-medium">Login page</Link> and sign in with your email and new password</li>
                      <li>4. View all your orders and manage your account</li>
                    </ol>
                    <p className="text-xs text-green-600 mt-2 italic">
                      💡 No email received? Use "Forgot Password" on the login page to get a new setup link.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-charcoal mb-3">What happens next?</h3>
            <ul className="text-left space-y-2 text-charcoal/70">
              <li>✅ Order confirmation email sent to your inbox</li>
              <li>🕐 We'll start crafting your candles within 1-2 business days</li>
              <li>📦 You'll get a shipping notification with tracking details</li>
              <li>🚚 Your order will be delivered within 3-7 business days</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-cream-300 text-white px-8 py-3 rounded-lg hover:bg-cream-400 transition-colors font-semibold"
            >
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="border border-cream-300 text-cream-300 px-8 py-3 rounded-lg hover:bg-cream-50 transition-colors font-semibold"
            >
              Back to Home
            </Link>
          </div>

          {/* Support Information */}
          <div className="mt-8 pt-6 border-t border-cream-200">
            <p className="text-sm text-charcoal/60 mb-2">
              Questions about your order?
            </p>
            <p className="text-sm text-charcoal/70">
              Contact us at{' '}
              <a href="mailto:support@lumidumi.com" className="text-cream-300 hover:underline">
                support@lumidumi.com
              </a>
              {' '}or{' '}
              <a href="tel:+919354851086" className="text-cream-300 hover:underline">
                +91 93548 51086
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cream-300 mx-auto mb-4"></div>
          <p className="text-charcoal/70">Loading order details...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}