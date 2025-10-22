import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body once and extract all needed data
    const requestBody = await request.json()
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderDetails
    } = requestBody

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment details' },
        { status: 400 }
      )
    }

    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 503 }
      )
    }

    // Create signature for verification
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex')

    // Verify signature
    const isSignatureValid = expectedSignature === razorpay_signature

    if (isSignatureValid) {
      // Payment is verified - save order to database
      try {
        // Use orderDetails from the already parsed request body

        // Create order record in database
        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert({
            razorpay_order_id,
            razorpay_payment_id,
            amount: orderDetails.total,
            status: 'completed',
            items: orderDetails.items,
            customer_info: orderDetails.customerInfo
          })
          .select()

        if (orderError) {
          console.error('Error saving order:', orderError)
        }

        return NextResponse.json({
          verified: true,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          order_data: order?.[0]
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Still return success since payment was verified
        return NextResponse.json({
          verified: true,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
        })
      }
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