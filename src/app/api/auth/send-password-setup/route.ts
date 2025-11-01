import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email, name, resetLink } = await request.json()

    if (!email || !resetLink) {
      return NextResponse.json(
        { error: 'Email and reset link are required' },
        { status: 400 }
      )
    }

    // Generate email content
    const emailHtml = generatePasswordSetupEmail(name, resetLink)

    // Send email using nodemailer
    const mailOptions = {
      from: {
        name: 'Lumidumi',
        address: process.env.EMAIL_USER!
      },
      to: email,
      subject: 'Set Up Your Password - Lumidumi Account',
      html: emailHtml,
    }

    console.log('📧 Sending password setup email to:', email)

    await transporter.sendMail(mailOptions)
    console.log('✅ Password setup email sent successfully to:', email)

    return NextResponse.json({
      success: true,
      message: 'Password setup email sent successfully'
    })

  } catch (error) {
    console.error('Error sending password setup email:', error)
    return NextResponse.json(
      { error: 'Failed to send password setup email' },
      { status: 500 }
    )
  }
}

function generatePasswordSetupEmail(name: string, resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Set Up Your Password - Lumidumi</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f7f5; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
            .content { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .button {
                display: inline-block;
                background: #D4A574;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
            }
            .footer { background: #f8f7f5; padding: 15px; text-align: center; border-radius: 8px; font-size: 14px; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: #8B4513; margin: 0;">Welcome to Lumidumi!</h1>
                <p style="margin: 10px 0 0 0;">Set up your password to access your account</p>
            </div>

            <div class="content">
                <p>Hello ${name || 'there'},</p>

                <p>Thank you for your recent order! We've automatically created an account for you so you can:</p>

                <ul>
                    <li>Track your current and future orders</li>
                    <li>View your order history</li>
                    <li>Manage your shipping information</li>
                    <li>Get faster checkout on future orders</li>
                </ul>

                <p>To access your account, please set up your password by clicking the button below:</p>

                <div style="text-align: center;">
                    <a href="${resetLink}" class="button">Set Up My Password</a>
                </div>

                <div class="warning">
                    <strong>⏰ Important:</strong> This link will expire in 24 hours for security reasons.
                </div>

                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
                    ${resetLink}
                </p>

                <p>Once you've set your password, you can log in at <a href="https://lumidumi.com/login">lumidumi.com/login</a> to view your orders and manage your account.</p>
            </div>

            <div class="footer">
                <p>If you didn't place an order with us, you can safely ignore this email.</p>
                <p>Questions? Contact us at support@lumidumi.com or +91 98765 43210</p>
                <p>Lumidumi - Handcrafted Candles Made with Love</p>
            </div>
        </div>
    </body>
    </html>
  `
}