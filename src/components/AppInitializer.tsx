'use client'

import { usePreloadedData } from '@/contexts/DataPreloadContext'

interface AppInitializerProps {
  children: React.ReactNode
}

export default function AppInitializer({ children }: AppInitializerProps) {
  const { error } = usePreloadedData()

  // Only block UI for critical errors, let data load in background
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

  // Show content immediately, let data load in background
  return <>{children}</>
}