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

// Global app loading wrapper
export function AppLoadingWrapper({ children }: { children: React.ReactNode }) {
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    // Simulate initial app loading time
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <LoadingScreen isLoading={isInitialLoading} message="Preparing your shopping experience...">
      {children}
    </LoadingScreen>
  )
}