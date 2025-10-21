'use client'

import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-charcoal mb-2">Access Denied</h1>
          <p className="text-charcoal/60">
            You don't have permission to access this page. Admin privileges are required.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-cream-300 text-white py-3 px-4 rounded-lg hover:bg-cream-400 transition-colors font-medium"
          >
            Go to Homepage
          </Link>
          <Link
            href="/login"
            className="block w-full border border-cream-300 text-cream-300 py-3 px-4 rounded-lg hover:bg-cream-50 transition-colors font-medium"
          >
            Sign In with Different Account
          </Link>
        </div>
      </div>
    </div>
  )
}