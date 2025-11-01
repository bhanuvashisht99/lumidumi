import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || 'ruiC68oExMoFSNA028I9EcPQ').replace(/\s/g, '')

  const body = razorpayOrderId + '|' + razorpayPaymentId
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body.toString())
    .digest('hex')

  return expectedSignature === razorpaySignature
}

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = await request.json()

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment details' },
        { status: 400 }
      )
    }

    // Verify payment signature
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValidSignature) {
      console.error('Invalid Razorpay signature')
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Payment verified - create order in database
    const orderData = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      total_amount: orderDetails.total,
      status: 'confirmed',
      customer_email: orderDetails.customerInfo.email,
      customer_phone: orderDetails.customerInfo.phone,
      customer_name: `${orderDetails.customerInfo.firstName} ${orderDetails.customerInfo.lastName}`,
      shipping_address: {
        address: orderDetails.customerInfo.address,
        city: orderDetails.customerInfo.city,
        state: orderDetails.customerInfo.state,
        pincode: orderDetails.customerInfo.pincode
      },
      is_guest_order: orderDetails.isGuestOrder || false,
      guest_account_created: orderDetails.guestAccountCreated || false,
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order record' },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = orderDetails.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      product_name: item.product.name,
      selected_color: item.color || null,
      product_image_url: item.product.images?.[0]?.url || item.product.image_url
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Order is created but items failed - still return success
    }

    console.log('✅ Order saved successfully:', order.id)

    // Send order confirmation email
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXTAUTH_URL || 'https://lumidumi.com'

      console.log('📧 Sending order confirmation email for order:', order.id, 'via URL:', `${baseUrl}/api/orders/send-confirmation`)

      const emailResponse = await fetch(`${baseUrl}/api/orders/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id }),
      })

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        console.log('✅ Order confirmation email sent successfully:', emailResult)
      } else {
        const errorText = await emailResponse.text()
        console.error('❌ Failed to send order confirmation email:', emailResponse.status, errorText)
      }
    } catch (emailError) {
      console.error('❌ Error sending order confirmation email:', emailError)
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({
      verified: true,
      order_id: order.id,
      payment_id: razorpay_payment_id,
      razorpay_order_id: razorpay_order_id,
      message: 'Payment verified and order created successfully'
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}