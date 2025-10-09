'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

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

  useEffect(() => {
    // Get initial session
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      checkAdminStatus(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        // Create profile if user just signed in and profile doesn't exist
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
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
        }

        checkAdminStatus(session?.user ?? null)
        setLoading(false)
      }
    ) ?? { data: { subscription: null } }

    return () => subscription?.unsubscribe()
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