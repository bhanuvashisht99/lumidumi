'use client'

import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  isLoading: boolean
  message?: string
  children: React.ReactNode
}

export default function LoadingScreen({ isLoading, message = "Loading...", children }: LoadingScreenProps) {
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowLoading(false), 500)
      return () => clearTimeout(timer)
    } else {
      setShowLoading(true)
    }
  }, [isLoading])

  if (showLoading && isLoading) {
    return (
      <div className="fixed inset-0 bg-cream-50 flex items-center justify-center z-50">
        <div className="text-center">
          {/* Animated Candle */}
          <div className="relative mx-auto mb-6">
            <div className="text-6xl animate-pulse">🕯️</div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-4 bg-orange-400 rounded-full animate-bounce opacity-80"></div>
            </div>
          </div>
          <div className="text-2xl font-semibold text-charcoal mb-2">Lumidumi</div>
          <p className="text-charcoal/60">{message}</p>
          {/* Loading dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-cream-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cream-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-cream-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Global app loading wrapper with data preloading
export function AppLoadingWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}

// Data-aware loading wrapper
export function DataAwareLoadingWrapper({ children }: { children: React.ReactNode }) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Add a small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (!showContent) {
    return (
      <div className="fixed inset-0 bg-cream-50 flex items-center justify-center z-50">
        <div className="text-center">
          {/* Animated Candle */}
          <div className="relative mx-auto mb-6">
            <div className="text-6xl animate-pulse">🕯️</div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-4 bg-orange-400 rounded-full animate-bounce opacity-80"></div>
            </div>
          </div>
          <div className="text-2xl font-semibold text-charcoal mb-2">Lumidumi</div>
          <p className="text-charcoal/60">Loading your shopping experience...</p>
          {/* Loading dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-cream-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cream-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-cream-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}