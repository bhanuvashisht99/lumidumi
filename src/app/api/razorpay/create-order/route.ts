import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

function getRazorpayInstance() {
  // Clean credentials by removing any whitespace/newlines
  const keyId = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_Ra0RjypHjpQHUZ').replace(/\s/g, '')
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || 'ruiC68oExMoFSNA028I9EcPQ').replace(/\s/g, '')

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

    // Check if Razorpay is configured
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 503 }
      )
    }

    // Clean up - remove debug logging since credentials work

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
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)

    // Provide more specific error messages based on the error type
    if (error.statusCode === 401) {
      return NextResponse.json(
        {
          error: 'Payment gateway authentication failed',
          message: 'Razorpay account may need activation for live transactions',
          details: 'Please check your Razorpay dashboard for KYC completion and account activation status'
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create order',
        message: error.message || 'Unknown error occurred',
        statusCode: error.statusCode || 500
      },
      { status: error.statusCode || 500 }
    )
  }
}