import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authorized: false,
        error: 'Missing or invalid authorization header'
      }
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '')

    // Verify user with Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return {
        authorized: false,
        error: 'Invalid authentication token'
      }
    }

    // Check admin role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return {
        authorized: false,
        error: 'Failed to verify user permissions'
      }
    }

    if (profile?.role !== 'admin') {
      return {
        authorized: false,
        error: 'Insufficient permissions - admin access required'
      }
    }

    return {
      authorized: true,
      user
    }
  } catch (error) {
    console.error('Admin auth validation error:', error)
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