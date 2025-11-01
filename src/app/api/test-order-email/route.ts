import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing order confirmation email with latest order...')

    // Get the latest order ID from URL params or use a test ID
    const { searchParams } = new URL(request.url)
    const testOrderId = searchParams.get('orderId') || '1' // Default to order ID 1

    console.log('📧 Testing email for order ID:', testOrderId)

    // Call the order confirmation email service
    const emailResponse = await fetch('https://lumidumi.com/api/orders/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId: testOrderId }),
    })

    console.log('📧 Email service response status:', emailResponse.status)

    if (emailResponse.ok) {
      const emailResult = await emailResponse.json()
      console.log('✅ Test order confirmation email sent successfully:', emailResult)

      return NextResponse.json({
        success: true,
        message: 'Test order confirmation email sent successfully',
        orderId: testOrderId,
        emailResult
      })
    } else {
      const errorText = await emailResponse.text()
      console.error('❌ Failed to send test order confirmation email:', emailResponse.status, errorText)

      return NextResponse.json(
        {
          error: 'Failed to send test order confirmation email',
          status: emailResponse.status,
          details: errorText
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Test order email failed:', error)
    return NextResponse.json(
      {
        error: 'Test order email failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}