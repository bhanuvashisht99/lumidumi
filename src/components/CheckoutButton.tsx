'use client'

import { useState } from 'react'
import { createRazorpayOrder, initializeRazorpayPayment, verifyRazorpayPayment } from '@/lib/razorpay'

interface CheckoutButtonProps {
  amount: number
  productName: string
  customerDetails: {
    name: string
    email: string
    phone: string
  }
  onSuccess?: (paymentData: any) => void
  onError?: (error: any) => void
}

export default function CheckoutButton({
  amount,
  productName,
  customerDetails,
  onSuccess,
  onError,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    try {
      setIsLoading(true)

      // Create Razorpay order
      const order = await createRazorpayOrder({
        amount,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
      })

      // Initialize Razorpay payment
      await initializeRazorpayPayment({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: 'Lumidumi',
        description: productName,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const isVerified = await verifyRazorpayPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            )

            if (isVerified) {
              onSuccess?.(response)
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            onError?.(error)
          }
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: {
          color: '#D4AF37', // Cream-300 color
        },
      })
    } catch (error) {
      console.error('Payment error:', error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  )
}