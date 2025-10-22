import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Singleton pattern to ensure only one client instance
let _supabase: any = null

export const supabase = (() => {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'sb-lumidumi-auth-token',
        flowType: 'pkce',
        debug: process.env.NODE_ENV === 'development'
      },
      global: {
        headers: {
          'X-Client-Info': 'lumidumi-web'
        }
      },
      // Production specific settings
      realtime: {
        params: {
          eventsPerSecond: 2
        }
      }
    })
  }
  return _supabase
})()

// Admin client for server-side operations (singleton)
let _supabaseAdmin: any = null

export const supabaseAdmin = (() => {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  return _supabaseAdmin
})()