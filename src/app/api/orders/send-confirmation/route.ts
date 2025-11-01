import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Create Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
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
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Generate email content
    const emailHtml = generateOrderConfirmationEmail(order)

    // Send email using Resend
    console.log('📧 Sending order confirmation email via Resend to:', order.customer_email)

    const result = await resend.emails.send({
      from: 'Lumidumi <team@lumidumi.com>',
      to: [order.customer_email],
      subject: `Order Confirmation #${order.id} - Lumidumi`,
      html: emailHtml,
    })

    console.log('✅ Order confirmation email sent successfully via Resend!')
    console.log('📨 Email result:', result)

    return NextResponse.json({
      success: true,
      message: 'Order confirmation email sent successfully',
      orderId: orderId
    })

  } catch (error) {
    console.error('❌ Resend confirmation email failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to send confirmation email',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

function generateOrderConfirmationEmail(order: any): string {
  const formatPrice = (price: number) => `₹${price.toLocaleString()}`
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Lumidumi</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f7f5; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
            .order-details { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .item { border-bottom: 1px solid #eee; padding: 15px 0; }
            .item:last-child { border-bottom: none; }
            .total { font-weight: bold; font-size: 18px; color: #8B4513; }
            .footer { background: #f8f7f5; padding: 15px; text-align: center; border-radius: 8px; font-size: 14px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: #8B4513; margin: 0;">Order Confirmation</h1>
                <p style="margin: 10px 0 0 0;">Thank you for your order from Lumidumi!</p>
            </div>

            <div class="order-details">
                <h2>Order Details</h2>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Order Date:</strong> ${formatDate(order.created_at)}</p>
                <p><strong>Payment ID:</strong> ${order.razorpay_payment_id}</p>
                <p><strong>Status:</strong> ${order.status}</p>
            </div>

            <div class="order-details">
                <h2>Shipping Address</h2>
                <p>${order.customer_name}</p>
                <p>${order.shipping_address.address}</p>
                <p>${order.shipping_address.city}, ${order.shipping_address.state}</p>
                <p>${order.shipping_address.pincode}</p>
            </div>

            <div class="order-details">
                <h2>Order Items</h2>
                ${order.order_items.map((item: any) => `
                    <div class="item">
                        <strong>${item.product_name}</strong>
                        ${item.selected_color ? `<br><small>Color: ${item.selected_color}</small>` : ''}
                        <br>Quantity: ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}
                    </div>
                `).join('')}

                <div class="total" style="padding-top: 15px; margin-top: 15px; border-top: 2px solid #8B4513;">
                    Total Amount: ${formatPrice(order.total_amount)}
                </div>
            </div>

            <div class="order-details">
                <h2>What's Next?</h2>
                <ul>
                    <li>We'll start crafting your candles within 1-2 business days</li>
                    <li>You'll receive a shipping notification with tracking details</li>
                    <li>Your order will be delivered within 3-7 business days</li>
                    <li>Track your order at: <a href="https://lumidumi.com/track-order">lumidumi.com/track-order</a></li>
                </ul>
            </div>

            <div class="footer">
                <p>Questions about your order? Contact us at support@lumidumi.com or +91 98765 43210</p>
                <p>Lumidumi - Handcrafted Candles Made with Love</p>
            </div>
        </div>
    </body>
    </html>
  `
}