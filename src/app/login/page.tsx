'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, user } = useAuth()
  const isAdmin = user?.is_admin || false
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push(isAdmin ? '/admin' : '/')
    }
  }, [user, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)

      if (error) {
        // Provide better error messages for common issues
        if (error.message?.includes('Email not confirmed')) {
          setError('Please check your email and click the verification link before signing in.')
        } else if (error.message?.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else {
          setError(error.message || 'Failed to sign in')
        }
      } else {
        // Redirect will happen via useEffect
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cream-300 mx-auto"></div>
          <p className="mt-4 text-charcoal">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo width={80} height={80} showText={false} className="mx-auto" />
          <h2 className="mt-6 text-3xl font-bold text-charcoal">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-charcoal/60">
            Welcome back to Lumidumi
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-cream-200 rounded-md shadow-sm focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-cream-200 rounded-md shadow-sm focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              <a
                href="/forgot-password"
                className="text-cream-300 hover:text-cream-300/80 font-medium"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cream-300 hover:bg-cream-300/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cream-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-charcoal/60">
              Don't have an account?{' '}
              <a
                href="/register"
                className="text-cream-300 hover:text-cream-300/80 font-medium"
              >
                Sign up
              </a>
            </p>
          </div>

          <div className="text-center">
            <a
              href="/"
              className="text-sm text-cream-300 hover:text-cream-300/80"
            >
              Back to home
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}