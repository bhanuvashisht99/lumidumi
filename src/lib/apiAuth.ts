import { supabase } from './supabase'

/**
 * Get authorization headers for admin API calls
 */
export async function getAuthHeaders(): Promise<{ [key: string]: string }> {
  try {
    console.log('🔑 Getting auth headers...')
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('❌ Session error:', error)
      throw new Error('Session error')
    }

    console.log('🔍 Session status:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      userEmail: session?.user?.email,
      tokenLength: session?.access_token?.length
    })

    if (!session?.access_token) {
      console.log('❌ No active session or access token')
      throw new Error('No active session')
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    }

    console.log('✅ Auth headers created successfully')
    return headers
  } catch (error) {
    console.error('❌ Failed to get auth headers:', error)
    throw new Error('Authentication required')
  }
}

/**
 * Make an authenticated API request
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = await getAuthHeaders()

  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers
    }
  })
}