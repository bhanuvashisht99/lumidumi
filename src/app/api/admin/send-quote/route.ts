import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configure nodemailer transporter (conditionally)
let transporter = null
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  if (process.env.EMAIL_HOST) {
    // Custom SMTP configuration
    const port = parseInt(process.env.EMAIL_PORT || '587')
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  } else {
    // Gmail service configuration
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      orderId,
      quotedPrice,
      adminNotes,
      deliveryTime,
      terms,
      customerEmail,
      customerName,
      orderDescription
    } = await request.json()

    if (!orderId || !quotedPrice || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, quotedPrice, customerEmail' },
        { status: 400 }
      )
    }

    // Update the custom order with quote details
    const { data, error } = await supabase
      .from('custom_orders')
      .update({
        quoted_price: quotedPrice,
        admin_notes: adminNotes,
        status: 'quoted',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json(
        { error: 'Failed to update order in database' },
        { status: 500 }
      )
    }

    // Send email notification to customer
    if (transporter) {
      try {
        const emailContent = `
          <h2>Quote for Your Custom Candle Order</h2>
          <p>Dear ${customerName},</p>

          <p>Thank you for your custom candle request. We're pleased to provide you with a quote:</p>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Description:</strong> ${orderDescription}</p>
            <p><strong>Quoted Price:</strong> ₹${quotedPrice.toLocaleString()}</p>
            ${deliveryTime ? `<p><strong>Estimated Delivery:</strong> ${deliveryTime}</p>` : ''}
          </div>

          ${terms ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Terms & Conditions:</h4>
            <p style="white-space: pre-line;">${terms}</p>
          </div>
          ` : ''}

          <p>To proceed with this order, please reply to this email or contact us directly.</p>

          <p>We look forward to creating your custom candles!</p>

          <p>Best regards,<br>
          The Lumidumi Team</p>

          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Lumidumi. Please do not reply directly to this email.
          </p>
        `

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: customerEmail,
          subject: `Quote for Your Custom Candle Order - ₹${quotedPrice.toLocaleString()}`,
          html: emailContent,
        }

        await transporter.sendMail(mailOptions)
        console.log('Quote email sent successfully to:', customerEmail)
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        // Don't fail the entire request if email fails
        return NextResponse.json({
          success: true,
          message: 'Quote updated successfully, but email notification failed',
          data: data[0],
          emailError: emailError.message
        })
      }
    } else {
      console.log('Email not configured - quote updated without sending email')
    }

    return NextResponse.json({
      success: true,
      message: transporter ? 'Quote sent successfully!' : 'Quote updated successfully (email not configured)',
      data: data[0],
      emailSent: !!transporter
    })

  } catch (error) {
    console.error('Send quote error:', error)
    return NextResponse.json(
      { error: 'Failed to send quote', details: error.message },
      { status: 500 }
    )
  }
}