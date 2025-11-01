import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { phone, email, firstName, lastName } = await request.json()

    // Validate required fields
    if (!phone || !email || !firstName) {
      return NextResponse.json(
        { error: 'Phone, email, and first name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists by phone or email
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id, phone, email')
      .or(`phone.eq.${phone},email.eq.${email}`)
      .single()

    if (existingUser) {
      // User already exists, return success
      console.log('🔄 Guest user already exists:', existingUser.email)
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        userId: existingUser.id
      })
    }

    // Create a temporary password for guest account
    const tempPassword = `guest_${phone}_${Date.now()}`

    // Create auth user first
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      phone: phone,
      email_confirm: true, // Auto-confirm email for guest accounts
      phone_confirm: false, // Phone verification can be added later
      user_metadata: {
        firstName,
        lastName,
        isGuestAccount: true,
        createdVia: 'checkout'
      }
    })

    if (authError || !authUser.user) {
      console.error('Auth user creation failed:', authError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create profile record
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email: email,
        phone: phone,
        first_name: firstName,
        last_name: lastName,
        is_guest: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation failed:', profileError)
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Send password setup email using our own SMTP
    try {
      // Generate a password reset link using Supabase
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `https://lumidumi.com/reset-password`
        }
      })

      if (linkError) {
        console.error('Failed to generate password reset link:', linkError)
      } else if (linkData?.properties?.action_link) {
        // Send email using our own SMTP service
        const emailResponse = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://lumidumi.com'}/api/auth/send-password-setup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            name: `${firstName} ${lastName}`,
            resetLink: linkData.properties.action_link
          }),
        })

        if (emailResponse.ok) {
          console.log('✅ Password setup email sent via SMTP to:', email)
        } else {
          console.error('❌ Failed to send password setup email via SMTP')
        }
      }
    } catch (emailError) {
      console.error('Error sending password setup email:', emailError)
    }

    console.log('✅ Guest account created successfully:', email)

    return NextResponse.json({
      success: true,
      message: 'Guest account created successfully',
      userId: authUser.user.id,
      isGuest: true
    })

  } catch (error) {
    console.error('Error creating guest account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}