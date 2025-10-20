import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists first
    const { data: existingUser, error: userError } = await supabaseAdmin.auth.admin.listUsers()

    const user = existingUser?.users?.find((u: any) => u.email === email)

    if (userError || !user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { success: true, message: 'If an account with this email exists, you will receive a password reset link.' },
        { status: 200 }
      )
    }

    // Generate reset token and store in database
    const resetToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store reset token in a custom table (we'll need to create this)
    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        email: email,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (tokenError) {
      console.error('Error storing reset token:', tokenError)
      return NextResponse.json(
        { error: 'Failed to process reset request' },
        { status: 500 }
      )
    }

    // Send email using Resend API directly
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`

    const emailHtml = `
      <html>
        <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #2C2C2C; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FEFCF8;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2C2C2C; margin: 0; font-family: 'Playfair Display', serif; font-size: 28px;">🕯️ Lumidumi</h1>
            <p style="color: #2C2C2C; margin: 5px 0; opacity: 0.7;">Handcrafted Candles</p>
          </div>

          <div style="background: #F7F3E9; padding: 25px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #E8DCC0;">
            <h2 style="color: #2C2C2C; margin-top: 0; font-family: 'Playfair Display', serif;">Reset Your Password</h2>
            <p style="color: #2C2C2C; opacity: 0.8;">You requested to reset your password for your Lumidumi account. Click the button below to set a new password.</p>

            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetUrl}" style="background: #D4AF37; color: #2C2C2C; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);">Reset Password</a>
            </div>

            <p style="font-size: 14px; color: #2C2C2C; opacity: 0.6;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #FEFCF8; padding: 12px; border-radius: 6px; font-size: 12px; border: 1px solid #E8DCC0; color: #2C2C2C;">${resetUrl}</p>

            <p style="font-size: 14px; color: #2C2C2C; opacity: 0.6; margin-top: 20px;">This link will expire in 1 hour for security reasons.</p>
          </div>

          <div style="text-align: center; color: #2C2C2C; opacity: 0.5; font-size: 12px; background: #F7F3E9; padding: 15px; border-radius: 8px;">
            <p style="margin: 0;">If you didn't request this password reset, you can safely ignore this email.</p>
            <p style="margin: 8px 0 0 0;">© 2025 Lumidumi - Handcrafted candles that illuminate your space</p>
          </div>
        </body>
      </html>
    `

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lumidumi <noreply@lumidumi.com>',
        to: [email],
        subject: 'Reset Your Lumidumi Password',
        html: emailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text()
      console.error('Resend API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Password reset email sent successfully!' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}