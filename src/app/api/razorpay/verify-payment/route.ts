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
    console.log('🔍 Starting payment verification...')

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = await request.json()

    console.log('💳 Payment details received:', {
      razorpay_order_id,
      razorpay_payment_id,
      hasSignature: !!razorpay_signature,
      hasOrderDetails: !!orderDetails
    })

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.error('❌ Missing required payment details')
      return NextResponse.json(
        { error: 'Missing required payment details' },
        { status: 400 }
      )
    }

    // Verify payment signature
    console.log('🔐 Verifying payment signature...')
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    console.log('🔐 Signature verification result:', isValidSignature)

    if (!isValidSignature) {
      console.error('❌ Invalid Razorpay signature')
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Payment verified - create order in database
    console.log('💾 Creating order in database...')
    console.log('📋 Order details:', {
      total: orderDetails.total,
      customerEmail: orderDetails.customerInfo.email,
      customerName: `${orderDetails.customerInfo.firstName} ${orderDetails.customerInfo.lastName}`,
      isGuestOrder: orderDetails.isGuestOrder || false,
      guestAccountCreated: orderDetails.guestAccountCreated || false,
      itemsCount: orderDetails.items?.length || 0
    })

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

    console.log('📝 Inserting order data into database...')
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (orderError) {
      console.error('❌ Database error creating order:', orderError)
      console.error('📝 Failed order data:', JSON.stringify(orderData, null, 2))
      return NextResponse.json(
        { error: 'Failed to create order record' },
        { status: 500 }
      )
    }

    console.log('✅ Order created successfully in database:', order.id)

    // Create order items
    console.log('🛍️ Creating order items...')
    const orderItems = orderDetails.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      product_name: item.product.name,
      selected_color: item.color || null,
      product_image_url: item.product.images?.[0]?.url || item.product.image_url
    }))

    console.log('📦 Order items to insert:', orderItems.length, 'items')

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError)
      console.error('📦 Failed order items data:', JSON.stringify(orderItems, null, 2))
      // Order is created but items failed - still return success
    } else {
      console.log('✅ Order items created successfully')

      // Reduce stock quantities for ordered products
      console.log('📉 Reducing stock quantities for ordered products...')
      for (const item of orderItems) {
        try {
          // First get current stock
          const { data: currentProduct } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single()

          if (currentProduct && currentProduct.stock_quantity >= item.quantity) {
            const newStock = currentProduct.stock_quantity - item.quantity
            const { error: stockError } = await supabase
              .from('products')
              .update({ stock_quantity: newStock })
              .eq('id', item.product_id)

            if (stockError) {
              console.error(`❌ Error reducing stock for product ${item.product_id}:`, stockError)
            } else {
              console.log(`✅ Reduced stock for product ${item.product_id} by ${item.quantity}`)
            }
          } else {
            console.log(`⚠️ Insufficient stock for product ${item.product_id}`)
          }
        } catch (stockUpdateError) {
          console.error(`❌ Exception reducing stock for product ${item.product_id}:`, stockUpdateError)
        }
      }
    }

    console.log('✅ Order saved successfully:', order.id)

    // Send order confirmation email
    console.log('📧 Starting email confirmation process...')
    try {
      // Use production URL for consistency and reliability
      const baseUrl = 'https://lumidumi.com'

      console.log('🌐 Email service base URL:', baseUrl)
      console.log('📧 Sending order confirmation email for order:', order.id, 'to:', orderDetails.customerInfo.email)
      console.log('📧 Full email URL:', `${baseUrl}/api/orders/send-confirmation`)

      const emailResponse = await fetch(`${baseUrl}/api/orders/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id }),
      })

      console.log('📧 Email service response status:', emailResponse.status)
      console.log('📧 Email service response headers:', Object.fromEntries(emailResponse.headers.entries()))

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        console.log('✅ Order confirmation email sent successfully:', emailResult)
        console.log('✅ Email service returned success with data:', JSON.stringify(emailResult, null, 2))
      } else {
        const errorText = await emailResponse.text()
        console.error('❌ Failed to send order confirmation email:', emailResponse.status, errorText)
        console.error('❌ Email service response body:', errorText)
        console.error('❌ Email service headers:', Object.fromEntries(emailResponse.headers.entries()))

        // Try to parse as JSON to get more details
        try {
          const errorJson = JSON.parse(errorText)
          console.error('❌ Parsed email error:', errorJson)
        } catch (parseError) {
          console.error('❌ Could not parse email error as JSON')
        }
      }
    } catch (emailError) {
      console.error('❌ Error sending order confirmation email:', emailError)
      console.error('❌ Email error stack:', emailError instanceof Error ? emailError.stack : 'No stack trace')
      // Don't fail the order creation if email fails
    }

    console.log('🎉 Payment verification complete - returning success response')
    const successResponse = {
      verified: true,
      order_id: order.id,
      payment_id: razorpay_payment_id,
      razorpay_order_id: razorpay_order_id,
      message: 'Payment verified and order created successfully'
    }

    console.log('📤 Success response data:', successResponse)
    return NextResponse.json(successResponse)

  } catch (error) {
    console.error('❌ Critical error in payment verification:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('❌ Error type:', typeof error)
    console.error('❌ Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))

    return NextResponse.json(
      {
        error: 'Payment verification failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}