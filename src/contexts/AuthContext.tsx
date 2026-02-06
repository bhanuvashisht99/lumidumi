'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Detect mobile browser
    const isMobile = typeof window !== 'undefined' &&
      (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

    // Get initial session with timeout protection and mobile-specific handling
    const getInitialSession = async () => {
      try {
        console.log('🚀 Initializing auth session...')

        // For mobile browsers, try to refresh the session first
        if (isMobile) {
          console.log('📱 Mobile device detected, refreshing session...')
          try {
            await supabase.auth.refreshSession()
          } catch (refreshError) {
            console.log('⚠️ Session refresh failed on mobile:', refreshError)
          }
        }

        // Set a timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session fetch timeout')), 8000) // Increased timeout for mobile
        )

        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any

        if (error) {
          console.error('❌ Error getting session:', error)
          setUser(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email)
          // Set loading false immediately, then fetch profile in background
          setLoading(false)
          await fetchUserProfile(session.user)
        } else {
          console.log('📭 No existing session found')
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Session initialization error:', error)
        setUser(null)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes with mobile-specific handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email)

        // Handle mobile page refresh specifically
        if (event === 'INITIAL_SESSION' && isMobile && session?.user) {
          console.log('📱 Mobile initial session detected, ensuring persistence...')
          // Force a session refresh on mobile to ensure it's valid
          try {
            const { data: refreshedSession } = await supabase.auth.refreshSession()
            if (refreshedSession.session?.user) {
              await fetchUserProfile(refreshedSession.session.user)
              setLoading(false)
              return
            }
          } catch (refreshError) {
            console.log('⚠️ Mobile session refresh failed:', refreshError)
          }
        }

        if (event === 'SIGNED_OUT' || !session) {
          console.log('🚪 User signed out or no session')
          setUser(null)
          setLoading(false)
          return
        }

        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            console.log('🔑 Valid session found, fetching profile...')
            await fetchUserProfile(session.user)
          }
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('🔍 Fetching user profile for:', supabaseUser.email)

      // First, set a fallback user immediately to prevent broken state
      const fallbackUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email || '',
        phone: undefined,
        role: (supabaseUser.email?.toLowerCase() === 'bhanuvashisht99@gmail.com') ? 'admin' : 'customer',
        avatar_url: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_admin: (supabaseUser.email?.toLowerCase() === 'bhanuvashisht99@gmail.com')
      }

      // Set fallback immediately to prevent broken state
      setUser(fallbackUser)

      // Then try to fetch the real profile with timeout
      const profilePromise = supabase
        .from('profiles')
        .select('id, email, first_name, last_name, phone, role, created_at, updated_at')
        .eq('id', supabaseUser.id)
        .single()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      )

      try {
        const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any

        if (!error && data) {
          // Update with real profile data, converting to our User interface
          // Check if user is in hardcoded admin list (case-insensitive)
          const isHardcodedAdmin = (data.email?.toLowerCase() || supabaseUser.email?.toLowerCase()) === 'bhanuvashisht99@gmail.com'
          const finalRole = isHardcodedAdmin ? 'admin' : data.role

          const userWithAdmin = {
            id: data.id,
            email: data.email || supabaseUser.email,
            name: data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.first_name || data.email || 'User',
            phone: data.phone,
            role: finalRole,
            avatar_url: undefined, // profiles table doesn't have avatar_url
            created_at: data.created_at,
            updated_at: data.updated_at,
            is_admin: finalRole === 'admin'
          }
          console.log('✅ User profile loaded:', userWithAdmin.email, 'Role:', userWithAdmin.role)
          setUser(userWithAdmin)
        } else {
          console.log('🔄 Using fallback user data (profile fetch failed):', fallbackUser.email)
        }
      } catch (profileError) {
        console.log('🔄 Using fallback user data (timeout or error):', fallbackUser.email)
      }

    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error)
      // Fallback user is already set above
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    // First, check if user already exists
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .single()

      if (existingUser) {
        return {
          error: {
            message: 'An account with this email already exists. Please try signing in instead.',
            code: 'user_already_exists'
          }
        }
      }
    } catch (error) {
      // If error is 'PGRST116' (no rows found), that's good - user doesn't exist
      console.log('User existence check:', error)
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    // Handle specific Supabase signup errors
    if (error) {
      if (error.message?.includes('already_registered') || error.message?.includes('already exists')) {
        return {
          error: {
            message: 'An account with this email already exists. Please try signing in instead.',
            code: 'user_already_exists'
          }
        }
      }
      return { error }
    }

    if (data.user && !error) {
      // Create user profile in our profiles table
      const [firstName, ...rest] = fullName.split(' ')
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            first_name: firstName || 'User',
            last_name: rest.join(' ') || '',
            role: 'customer'
          }
        ])

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // If profile creation fails because user already exists, that's fine
        if (!profileError.message?.includes('duplicate key') && !profileError.message?.includes('already exists')) {
          return {
            error: {
              message: 'Account was created but profile setup failed. Please contact support.',
              code: 'profile_creation_failed'
            }
          }
        }
      }
    }

    return { error }
  }

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null)
      setLoading(false)

      // Sign out from Supabase
      await supabase.auth.signOut()

      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.clear()
        // Clear sessionStorage
        sessionStorage.clear()
        // Force page reload to clear all cached state
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
      }
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, clear local state
      setUser(null)
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}