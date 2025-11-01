import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Create Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Resend email configuration...')
    console.log('📧 Resend API Key configured:', !!process.env.RESEND_API_KEY)

    // Test email to your address
    const testEmail = 'bhanuvashisht9988@gmail.com'

    console.log('📤 Sending test email via Resend to:', testEmail)

    const result = await resend.emails.send({
      from: 'Lumidumi <noreply@lumidumi.com>',
      to: [testEmail],
      subject: 'Test Email from Lumidumi via Resend - ' + new Date().toLocaleString(),
      html: `
        <h2>Email Test Successful! 🎉</h2>
        <p>If you received this email, the Resend configuration is working correctly.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Service:</strong> Resend API</p>
        <p><strong>From:</strong> team@lumidumi.com</p>
        <p>This email was sent using the Resend service, which is much more reliable for serverless applications.</p>
      `,
    })

    console.log('✅ Test email sent successfully via Resend!')
    console.log('📨 Email result:', result)

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully via Resend',
      to: testEmail,
      emailId: result.data?.id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Resend test email failed:', error)
    return NextResponse.json(
      {
        error: 'Resend test email failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}