'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export default function AuthGuard({
  children,
  requireAdmin = false,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    if (!loading) {
      setHasChecked(true)

      // Check authentication
      if (!user) {
        router.push(redirectTo)
        return
      }

      // Check admin requirement
      if (requireAdmin && !isAdmin) {
        router.push('/unauthorized')
        return
      }
    }
  }, [user, loading, isAdmin, requireAdmin, redirectTo, router])

  // Show loading while auth is being determined
  if (loading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cream-300 mx-auto mb-4"></div>
          <p className="text-charcoal/60">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render if user is not authenticated or authorized
  if (!user || (requireAdmin && !isAdmin)) {
    return null
  }

  return <>{children}</>
}