import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase'

export interface AuthResult {
  authorized: boolean
  user?: any
  error?: string
}

/**
 * Validates admin authentication for API routes
 * Returns user data if authorized, or error details if not
 */
export async function validateAdminAuth(request: NextRequest): Promise<AuthResult> {
  try {
    console.log('🔐 Admin auth validation started')

    // Get authorization header
    const authHeader = request.headers.get('authorization')
    console.log('📋 Authorization header present:', !!authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid authorization header')
      return {
        authorized: false,
        error: 'Missing or invalid authorization header'
      }
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '')
    console.log('🎫 Token extracted, length:', token.length)

    // Verify user with Supabase
    console.log('🔍 Verifying user with Supabase...')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError) {
      console.error('❌ Supabase user verification error:', userError)
      return {
        authorized: false,
        error: 'Invalid authentication token'
      }
    }

    if (!user) {
      console.log('❌ No user returned from Supabase')
      return {
        authorized: false,
        error: 'Invalid authentication token'
      }
    }

    console.log('✅ User verified:', user.id, user.email)

    // Check admin role in profiles table using admin client to bypass RLS
    console.log('🔍 Checking admin role for user:', user.id, user.email)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError)
      console.error('User ID:', user.id)
      console.error('User email:', user.email)
      console.error('Profile error details:', JSON.stringify(profileError, null, 2))

      // If profile doesn't exist (PGRST116), create admin profile for this specific user
      if (profileError.code === 'PGRST116' && user.email === 'bhanuvashisht99@gmail.com') {
        console.log('🔧 Creating admin profile for authorized user...')

        // Check if service role key is available
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        console.log('🔍 Service role key status:', {
          isSet: !!serviceRoleKey,
          length: serviceRoleKey?.length || 0,
          starts: serviceRoleKey?.substring(0, 10) || 'not-set'
        })

        if (!serviceRoleKey || serviceRoleKey === 'placeholder-key') {
          console.error('❌ Service role key not configured properly!')
          return {
            authorized: false,
            error: 'Server configuration error - missing service role key'
          }
        }

        try {
          const profileData = {
            id: user.id,
            email: user.email,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          console.log('📝 Profile data to insert:', profileData)
          console.log('🛠️ Using supabaseAdmin client for profile creation...')

          const { data: newProfile, error: createError } = await supabaseAdmin
            .from('profiles')
            .insert([profileData])
            .select()
            .single()

          console.log('📊 Profile creation result:', {
            hasData: !!newProfile,
            hasError: !!createError,
            errorCode: createError?.code,
            errorMessage: createError?.message
          })

          if (createError) {
            console.error('❌ Failed to create admin profile:', createError)
            console.error('❌ Create error details:', JSON.stringify(createError, null, 2))
            return {
              authorized: false,
              error: 'Failed to create user profile'
            }
          }

          console.log('✅ Admin profile created successfully:', newProfile)
        } catch (insertError) {
          console.error('❌ Exception during profile creation:', insertError)
          console.error('❌ Exception stack:', (insertError as Error)?.stack)
          return {
            authorized: false,
            error: 'Exception during profile creation'
          }
        }

        return {
          authorized: true,
          user
        }
      }

      return {
        authorized: false,
        error: 'Failed to verify user permissions'
      }
    }

    console.log('✅ User profile found:', profile)

    if (profile?.role !== 'admin') {
      console.log('❌ User is not admin. Role:', profile?.role)
      return {
        authorized: false,
        error: 'Insufficient permissions - admin access required'
      }
    }

    console.log('✅ Admin access confirmed for user:', user.email)
    return {
      authorized: true,
      user
    }
  } catch (error) {
    console.error('❌ Admin auth validation error:', error)
    return {
      authorized: false,
      error: 'Authentication validation failed'
    }
  }
}

/**
 * Middleware wrapper for admin API routes
 * Usage: export const POST = withAdminAuth(async (request, { user }) => { ... })
 */
export function withAdminAuth(
  handler: (request: NextRequest, context: { user: any }) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const authResult = await validateAdminAuth(request)

    if (!authResult.authorized) {
      return new Response(
        JSON.stringify({
          error: authResult.error,
          code: 'UNAUTHORIZED'
        }),
        {
          status: authResult.error?.includes('permissions') ? 403 : 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(request, { user: authResult.user })
  }
}