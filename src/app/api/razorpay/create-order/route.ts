import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

function getRazorpayInstance() {
  // Use hardcoded test credentials for now
  const keyId = 'rzp_test_RQcQeEz3nDpkKm'
  const keySecret = '0dQ7HeIUuWu0T8F5KH9NRhz6'

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured')
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json()

    // Temporarily skip environment check for testing
    // if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    //   return NextResponse.json(
    //     { error: 'Payment gateway not configured' },
    //     { status: 503 }
    //   )
    // }

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const razorpay = getRazorpayInstance()
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    })

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}