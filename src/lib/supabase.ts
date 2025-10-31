import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey })
  throw new Error('Missing Supabase environment variables')
}

// Singleton pattern to prevent multiple instances
const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient> | undefined
}

export const supabase = globalForSupabase.supabase ?? createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'lumidumi-auth-token',
    flowType: 'pkce'
  }
})

if (process.env.NODE_ENV !== 'production') globalForSupabase.supabase = supabase

// Admin client for server operations - only create on server side
export const supabaseAdmin = typeof window === 'undefined'
  ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null as any

export default supabase