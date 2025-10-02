import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await request.json()

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment details' },
        { status: 400 }
      )
    }

    // Create signature for verification
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    // Verify signature
    const isSignatureValid = expectedSignature === razorpay_signature

    if (isSignatureValid) {
      // Payment is verified
      // Here you can update your database, send confirmation emails, etc.

      return NextResponse.json({
        verified: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
      })
    } else {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}