'use client'

import { lazy, Suspense, useState, useCallback } from 'react'
import AdminErrorBoundary from './AdminErrorBoundary'

// Lazy load heavy admin components
const ModernProductsTab = lazy(() => import('./ModernProductsTab'))
const OrdersTab = lazy(() => import('./OrdersTab'))
const CustomersTab = lazy(() => import('./CustomersTab'))
const CustomOrdersTab = lazy(() => import('./CustomOrdersTab'))
const ContentTab = lazy(() => import('./ContentTab'))

// Loading component
const TabLoadingSpinner = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow-sm border">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cream-300 mx-auto mb-3"></div>
      <p className="text-charcoal/60 text-sm">Loading {name}...</p>
    </div>
  </div>
)

// Error boundary fallback
const TabErrorFallback = ({ name, onRetry }: { name: string; onRetry: () => void }) => (
  <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow-sm border">
    <div className="text-center">
      <div className="text-red-500 text-4xl mb-3">⚠️</div>
      <h3 className="text-lg font-semibold text-charcoal mb-2">Failed to load {name}</h3>
      <p className="text-charcoal/60 mb-4">Something went wrong while loading this section.</p>
      <button
        onClick={onRetry}
        className="btn-primary text-sm"
      >
        Try Again
      </button>
    </div>
  </div>
)

// Wrapper component with error boundary and retry logic
const TabWithErrorBoundary = ({
  children,
  name
}: {
  children: React.ReactNode;
  name: string
}) => {
  const [retryKey, setRetryKey] = useState(0)

  const handleRetry = useCallback(() => {
    setRetryKey(prev => prev + 1)
  }, [])

  return (
    <AdminErrorBoundary
      key={retryKey}
      fallback={<TabErrorFallback name={name} onRetry={handleRetry} />}
    >
      {children}
    </AdminErrorBoundary>
  )
}

interface OptimizedAdminTabsProps {
  activeTab: string
}

export default function OptimizedAdminTabs({ activeTab }: OptimizedAdminTabsProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <TabWithErrorBoundary name="Products">
            <Suspense fallback={<TabLoadingSpinner name="Products" />}>
              <ModernProductsTab />
            </Suspense>
          </TabWithErrorBoundary>
        )

      case 'orders':
        return (
          <TabWithErrorBoundary name="Orders">
            <Suspense fallback={<TabLoadingSpinner name="Orders" />}>
              <OrdersTab />
            </Suspense>
          </TabWithErrorBoundary>
        )

      case 'customers':
        return (
          <TabWithErrorBoundary name="Customers">
            <Suspense fallback={<TabLoadingSpinner name="Customers" />}>
              <CustomersTab />
            </Suspense>
          </TabWithErrorBoundary>
        )

      case 'custom':
        return (
          <TabWithErrorBoundary name="Custom Orders">
            <Suspense fallback={<TabLoadingSpinner name="Custom Orders" />}>
              <CustomOrdersTab />
            </Suspense>
          </TabWithErrorBoundary>
        )

      case 'content':
        return (
          <TabWithErrorBoundary name="Content Management">
            <Suspense fallback={<TabLoadingSpinner name="Content Management" />}>
              <ContentTab />
            </Suspense>
          </TabWithErrorBoundary>
        )

      default:
        return null
    }
  }

  return (
    <div className={activeTab === 'products' ? '' : 'card'}>
      {renderTabContent()}
    </div>
  )
}