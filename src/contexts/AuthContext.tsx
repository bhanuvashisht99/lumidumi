'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
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
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Enhanced local storage with fallbacks
class SecureStorage {
  private static instance: SecureStorage
  private storage: Storage | null = null

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        // Test localStorage
        window.localStorage.setItem('test', 'test')
        window.localStorage.removeItem('test')
        this.storage = window.localStorage
      } catch {
        // Fallback to sessionStorage
        try {
          window.sessionStorage.setItem('test', 'test')
          window.sessionStorage.removeItem('test')
          this.storage = window.sessionStorage
        } catch {
          console.warn('Storage unavailable, authentication state will not persist')
        }
      }
    }
  }

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage()
    }
    return SecureStorage.instance
  }

  setItem(key: string, value: string): void {
    try {
      this.storage?.setItem(key, value)
    } catch (error) {
      console.warn('Failed to store auth data:', error)
    }
  }

  getItem(key: string): string | null {
    try {
      return this.storage?.getItem(key) || null
    } catch (error) {
      console.warn('Failed to retrieve auth data:', error)
      return null
    }
  }

  removeItem(key: string): void {
    try {
      this.storage?.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove auth data:', error)
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const storage = SecureStorage.getInstance()

  // Use ref for cache to avoid dependency issues
  const adminStatusCacheRef = useRef<{ [userId: string]: boolean }>({})

  const checkAdminStatus = useCallback(async (currentUser: User | null) => {
    if (!currentUser || !supabase) {
      setIsAdmin(false)
      return
    }

    // Check memory cache first (fastest)
    if (adminStatusCacheRef.current[currentUser.id] !== undefined) {
      const cachedStatus = adminStatusCacheRef.current[currentUser.id]
      setIsAdmin(cachedStatus)
      return
    }

    // Check localStorage cache (faster than DB)
    const cachedStatus = storage.getItem(`admin_status_${currentUser.id}`)
    if (cachedStatus) {
      try {
        const isAdminCached = JSON.parse(cachedStatus)
        setIsAdmin(isAdminCached)
        adminStatusCacheRef.current[currentUser.id] = isAdminCached
        return
      } catch {
        // Invalid cache, continue to database check
      }
    }

    // Only hit the database if no cache exists
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()

      if (!error && profile) {
        const isAdminUser = profile.role === 'admin'
        setIsAdmin(isAdminUser)

        // Cache the result in both memory and localStorage
        adminStatusCacheRef.current[currentUser.id] = isAdminUser
        storage.setItem(`admin_status_${currentUser.id}`, JSON.stringify(isAdminUser))
      } else {
        setIsAdmin(false)
        // Cache the negative result too
        adminStatusCacheRef.current[currentUser.id] = false
        storage.setItem(`admin_status_${currentUser.id}`, JSON.stringify(false))
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
      // Don't cache errors
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession()

      if (!error && refreshedSession) {
        setSession(refreshedSession)
        setUser(refreshedSession.user)
        await checkAdminStatus(refreshedSession.user)

        // Store session info for persistence
        storage.setItem('lumidumi_session_info', JSON.stringify({
          user_id: refreshedSession.user.id,
          email: refreshedSession.user.email,
          last_refresh: Date.now()
        }))
      } else if (error) {
        console.error('Session refresh failed:', error)
        // Clear invalid session
        setSession(null)
        setUser(null)
        setIsAdmin(false)
        storage.removeItem('lumidumi_session_info')
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }, [])

  const initializeAuth = useCallback(async () => {
    try {
      // Get current session
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        return
      }

      if (currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)

        // Check memory cache first
        if (adminStatusCacheRef.current[currentSession.user.id] !== undefined) {
          setIsAdmin(adminStatusCacheRef.current[currentSession.user.id])
        } else {
          // Check localStorage cache and set immediately to avoid flickering
          const cachedAdminStatus = storage.getItem(`admin_status_${currentSession.user.id}`)
          if (cachedAdminStatus) {
            try {
              const isAdminCached = JSON.parse(cachedAdminStatus)
              setIsAdmin(isAdminCached)
              adminStatusCacheRef.current[currentSession.user.id] = isAdminCached
            } catch {
              // Invalid cache, will be refreshed by checkAdminStatus
              setIsAdmin(false)
            }
          } else {
            // No cache exists, set false initially to avoid undefined state
            setIsAdmin(false)
          }
        }

        // Async check admin status in background (won't affect UI if cached)
        checkAdminStatus(currentSession.user)

        // Store session info
        storage.setItem('lumidumi_session_info', JSON.stringify({
          user_id: currentSession.user.id,
          email: currentSession.user.email,
          last_refresh: Date.now()
        }))
      } else {
        // No session, clear any stored data
        storage.removeItem('lumidumi_session_info')
        setSession(null)
        setUser(null)
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Initialize auth
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, currentSession: any) => {
        if (!mounted) return

        console.log('Auth event:', event)

        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            if (currentSession) {
              setSession(currentSession)
              setUser(currentSession.user)

              // Set admin status immediately from cache to prevent flickering
              if (adminStatusCacheRef.current[currentSession.user.id] !== undefined) {
                setIsAdmin(adminStatusCacheRef.current[currentSession.user.id])
              } else {
                const cachedAdminStatus = storage.getItem(`admin_status_${currentSession.user.id}`)
                if (cachedAdminStatus) {
                  try {
                    const isAdminCached = JSON.parse(cachedAdminStatus)
                    setIsAdmin(isAdminCached)
                    adminStatusCacheRef.current[currentSession.user.id] = isAdminCached
                  } catch {
                    setIsAdmin(false)
                  }
                } else {
                  setIsAdmin(false)
                }
              }

              // Background check (won't flicker if cached)
              checkAdminStatus(currentSession.user)

              // Create profile if it doesn't exist
              if (event === 'SIGNED_IN') {
                try {
                  const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', currentSession.user.id)
                    .single()

                  if (!existingProfile) {
                    const fullName = currentSession.user.user_metadata?.full_name ||
                                   currentSession.user.email?.split('@')[0] || ''
                    const [firstName, ...lastNameParts] = fullName.split(' ')
                    const lastName = lastNameParts.join(' ')

                    await supabase.from('profiles').insert({
                      id: currentSession.user.id,
                      email: currentSession.user.email,
                      first_name: firstName || 'User',
                      last_name: lastName || '',
                      role: 'customer'
                    })
                  }
                } catch (error) {
                  console.error('Error creating profile:', error)
                }
              }

              // Store session info
              storage.setItem('lumidumi_session_info', JSON.stringify({
                user_id: currentSession.user.id,
                email: currentSession.user.email,
                last_refresh: Date.now()
              }))
            }
            break

          case 'SIGNED_OUT':
            setSession(null)
            setUser(null)
            setIsAdmin(false)
            adminStatusCacheRef.current = {}

            // Clear all stored auth data
            storage.removeItem('lumidumi_session_info')
            // Clear admin status cache from localStorage
            Object.keys(adminStatusCacheRef.current).forEach(userId => {
              storage.removeItem(`admin_status_${userId}`)
            })
            break

          case 'PASSWORD_RECOVERY':
            // Handle password recovery if needed
            break

          default:
            break
        }

        setLoading(false)
      }
    )

    // Set up automatic session refresh
    const refreshInterval = setInterval(async () => {
      if (session && !loading) {
        await refreshSession()
      }
    }, 5 * 60 * 1000) // Refresh every 5 minutes

    // Handle page visibility changes
    const handleVisibilityChange = async () => {
      if (!document.hidden && session && !loading) {
        await refreshSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      mounted = false
      subscription?.unsubscribe()
      clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [initializeAuth, checkAdminStatus, refreshSession, session, loading, storage])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
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

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      return { error }
    }
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
    refreshSession,
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