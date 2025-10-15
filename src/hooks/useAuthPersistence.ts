'use client'

import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Enhanced storage that works across different environments
class AuthStorage {
  private storage: Storage | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        // Try localStorage first
        window.localStorage.setItem('test', 'test')
        window.localStorage.removeItem('test')
        this.storage = window.localStorage
      } catch {
        try {
          // Fallback to sessionStorage
          window.sessionStorage.setItem('test', 'test')
          window.sessionStorage.removeItem('test')
          this.storage = window.sessionStorage
        } catch {
          // In-memory fallback
          this.storage = new MemoryStorage()
        }
      }
    }
  }

  getItem(key: string): string | null {
    return this.storage?.getItem(key) || null
  }

  setItem(key: string, value: string): void {
    try {
      this.storage?.setItem(key, value)
    } catch (error) {
      console.warn('Failed to store auth data:', error)
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

// In-memory storage fallback
class MemoryStorage implements Storage {
  private data: { [key: string]: string } = {}

  get length(): number {
    return Object.keys(this.data).length
  }

  getItem(key: string): string | null {
    return this.data[key] || null
  }

  setItem(key: string, value: string): void {
    this.data[key] = value
  }

  removeItem(key: string): void {
    delete this.data[key]
  }

  clear(): void {
    this.data = {}
  }

  key(index: number): string | null {
    const keys = Object.keys(this.data)
    return keys[index] || null
  }
}

export function useAuthPersistence() {
  const storage = new AuthStorage()

  const saveAuthState = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        storage.setItem('lumidumi-session-backup', JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          user: session.user,
          expires_at: session.expires_at,
          saved_at: Date.now()
        }))
      }
    } catch (error) {
      console.error('Failed to backup session:', error)
    }
  }, [storage])

  const restoreAuthState = useCallback(async () => {
    try {
      const backupData = storage.getItem('lumidumi-session-backup')
      if (backupData) {
        const backup = JSON.parse(backupData)
        const savedAt = backup.saved_at || 0
        const oneHourAgo = Date.now() - (60 * 60 * 1000)

        // Only restore if backup is less than 1 hour old
        if (savedAt > oneHourAgo) {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session && backup.refresh_token) {
            await supabase.auth.setSession({
              access_token: backup.access_token,
              refresh_token: backup.refresh_token
            })
          }
        } else {
          // Clean up old backup
          storage.removeItem('lumidumi-session-backup')
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error)
    }
  }, [storage])

  const clearAuthState = useCallback(() => {
    storage.removeItem('lumidumi-session-backup')
  }, [storage])

  useEffect(() => {
    // Restore session on mount
    restoreAuthState()

    // Save session periodically
    const interval = setInterval(saveAuthState, 30000) // Every 30 seconds

    // Save on visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveAuthState()
      } else {
        restoreAuthState()
      }
    }

    // Save on page unload
    const handleBeforeUnload = () => {
      saveAuthState()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [saveAuthState, restoreAuthState])

  return {
    saveAuthState,
    restoreAuthState,
    clearAuthState
  }
}