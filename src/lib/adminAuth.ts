import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export interface AuthResult {
  authorized: boolean
  user?: any
  error?: string
}

export async function validateAdminAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authorized: false,
        error: 'Missing authorization header'
      }
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify user with admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return {
        authorized: false,
        error: 'Invalid token'
      }
    }

    // Check admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      // Auto-create admin profile for specific user
      if (profileError.code === 'PGRST116' && user.email === 'bhanuvashisht99@gmail.com') {
        await supabaseAdmin.from('profiles').insert({
          id: user.id,
          email: user.email,
          role: 'admin',
          first_name: 'Admin',
          last_name: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

        return { authorized: true, user }
      }

      return {
        authorized: false,
        error: 'User profile not found'
      }
    }

    if (profile?.role !== 'admin') {
      return {
        authorized: false,
        error: 'Admin access required'
      }
    }

    return { authorized: true, user }
  } catch (error) {
    console.error('Admin auth error:', error)
    return {
      authorized: false,
      error: 'Authentication failed'
    }
  }
}

export function withAdminAuth(
  handler: (request: NextRequest, context: { user: any }) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const authResult = await validateAdminAuth(request)

    if (!authResult.authorized) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        {
          status: authResult.error?.includes('Admin access') ? 403 : 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(request, { user: authResult.user })
  }
}