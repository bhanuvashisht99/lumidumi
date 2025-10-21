'use client'

import { usePreloadedData } from '@/contexts/DataPreloadContext'

interface AppInitializerProps {
  children: React.ReactNode
}

export default function AppInitializer({ children }: AppInitializerProps) {
  const { isLoading, error } = usePreloadedData()

  if (isLoading) {
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
          <p className="text-charcoal/60">Loading all website data...</p>
          <p className="text-charcoal/40 text-sm mt-2">This ensures smooth navigation</p>
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

  if (error) {
    return (
      <div className="fixed inset-0 bg-cream-50 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-2xl font-semibold text-charcoal mb-2">Lumidumi</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-cream-300 text-white rounded-lg hover:bg-cream-400 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}