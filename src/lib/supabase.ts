import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Use a lazy initialization approach
declare global {
  var __lumidumi_supabase_client: any
}

let _client: any = null

function createSupabaseClient() {
  if (typeof globalThis !== 'undefined' && globalThis.__lumidumi_supabase_client) {
    return globalThis.__lumidumi_supabase_client
  }

  console.log('🔧 Creating new Supabase client instance')

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Disable to prevent conflicts
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-lumidumi-auth-token',
      flowType: 'pkce',
      debug: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'lumidumi-web'
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    }
  })

  // Store globally
  if (typeof globalThis !== 'undefined') {
    globalThis.__lumidumi_supabase_client = client
  }
  if (typeof window !== 'undefined') {
    (window as any).__lumidumi_supabase_client = client
  }

  _client = client
  return client
}

export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!_client) {
      _client = createSupabaseClient()
    }
    return _client[prop]
  }
})

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