'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { useAuthPersistence } from '@/hooks/useAuthPersistence'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const { saveAuthState, restoreAuthState, clearAuthState } = useAuthPersistence()

  useEffect(() => {
    let mounted = true

    // Get initial session with better error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase?.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
        }

        setSession(session)
        setUser(session?.user ?? null)
        await checkAdminStatus(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth event:', event, 'Session:', !!session)

        setSession(session)
        setUser(session?.user ?? null)

        // Create profile if user just signed in and profile doesn't exist
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          try {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', session.user.id)
              .single()

            if (!existingProfile) {
              // Create profile if it doesn't exist
              const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || ''
              const [firstName, ...lastNameParts] = fullName.split(' ')
              const lastName = lastNameParts.join(' ')

              await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  first_name: firstName || 'User',
                  last_name: lastName || '',
                  role: 'customer'
                })
            }
          } catch (error) {
            console.error('Error creating profile:', error)
          }
        }

        await checkAdminStatus(session?.user ?? null)
        setLoading(false)
      }
    ) ?? { data: { subscription: null } }

    // Handle visibility change (tab switching) to refresh session
    const handleVisibilityChange = async () => {
      if (!document.hidden && mounted) {
        try {
          const { data: { session } } = await supabase?.auth.getSession()
          if (session && (!user || user.id !== session.user.id)) {
            setSession(session)
            setUser(session.user)
            await checkAdminStatus(session.user)
          }
        } catch (error) {
          console.error('Error refreshing session on visibility change:', error)
        }
      }
    }

    // Handle focus event (mobile app returning from background)
    const handleFocus = async () => {
      if (mounted) {
        try {
          const { data: { session } } = await supabase?.auth.getSession()
          if (session && (!user || user.id !== session.user.id)) {
            setSession(session)
            setUser(session.user)
            await checkAdminStatus(session.user)
          }
        } catch (error) {
          console.error('Error refreshing session on focus:', error)
        }
      }
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      mounted = false
      subscription?.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const checkAdminStatus = async (user: User | null) => {
    if (!user || !supabase) {
      setIsAdmin(false)
      return
    }

    try {
      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setIsAdmin(profile?.role === 'admin')
    } catch (error) {
      setIsAdmin(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } }
    }

    const [firstName, ...lastNameParts] = fullName.split(' ')
    const lastName = lastNameParts.join(' ')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName
        }
      }
    })

    // If signup successful and user is created, create profile
    if (!error && data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            role: 'customer'
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      } catch (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    return { error }
  }

  const signOut = async () => {
    if (!supabase) return

    await supabase.auth.signOut()
    clearAuthState() // Clear persistent auth data
    setIsAdmin(false)
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    return { error }
  }

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}