import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, orderId, mobile } = await request.json()

    // Validate that at least one search parameter is provided
    if (!email && !orderId && !mobile) {
      return NextResponse.json(
        { error: 'Please provide email, mobile number, or order ID to search' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_id,
          quantity,
          price,
          product_name,
          selected_color,
          product_image_url
        )
      `)

    // Build dynamic query based on provided parameters
    if (email && orderId) {
      // Email + Order ID (existing functionality)
      query = query
        .eq('customer_email', email.toLowerCase().trim())
        .or(`id.eq.${orderId},razorpay_order_id.eq.${orderId},razorpay_payment_id.eq.${orderId}`)
    } else if (email && mobile) {
      // Email + Mobile
      query = query
        .eq('customer_email', email.toLowerCase().trim())
        .eq('customer_phone', mobile.trim())
    } else if (email) {
      // Email only
      query = query.eq('customer_email', email.toLowerCase().trim())
    } else if (mobile) {
      // Mobile only
      query = query.eq('customer_phone', mobile.trim())
    } else if (orderId) {
      // Order ID only
      query = query.or(`id.eq.${orderId},razorpay_order_id.eq.${orderId},razorpay_payment_id.eq.${orderId}`)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to search orders. Please try again.' },
        { status: 500 }
      )
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: 'No orders found. Please check your details and try again.' },
        { status: 404 }
      )
    }

    // If multiple orders found, return the most recent one
    const order = orders.length > 1
      ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      : orders[0]

    // Return order details
    return NextResponse.json({
      success: true,
      order: order,
      totalFound: orders.length
    })

  } catch (error) {
    console.error('Error tracking order:', error)
    return NextResponse.json(
      { error: 'Failed to track order. Please try again.' },
      { status: 500 }
    )
  }
}