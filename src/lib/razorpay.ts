// Razorpay integration utilities

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface CreateOrderRequest {
  amount: number
  currency?: string
  receipt?: string
}

export interface CreateOrderResponse {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
}

// Create Razorpay order on server
export async function createRazorpayOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
  const response = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })

  if (!response.ok) {
    throw new Error('Failed to create Razorpay order')
  }

  return response.json()
}

// Verify payment on server
export async function verifyRazorpayPayment(
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
): Promise<boolean> {
  const response = await fetch('/api/razorpay/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_signature: razorpaySignature,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify payment')
  }

  const result = await response.json()
  return result.verified
}

// Initialize Razorpay payment
export function initializeRazorpayPayment(options: RazorpayOptions) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onerror = reject
    script.onload = () => {
      try {
        const razorpay = new (window as any).Razorpay({
          ...options,
          handler: (response: RazorpayResponse) => {
            options.handler(response)
            resolve(response)
          },
        })
        razorpay.open()
      } catch (error) {
        reject(error)
      }
    }
    document.head.appendChild(script)
  })
}