'use client'

import { useState, useCallback } from 'react'
import AdminErrorBoundary from './AdminErrorBoundary'

// Direct imports for faster loading since data is preloaded
import ModernProductsTab from './ModernProductsTab'
import OrdersTab from './OrdersTab'
import CustomersTab from './CustomersTab'
import CustomOrdersTab from './CustomOrdersTab'
import ContentTab from './ContentTab'

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
            <ModernProductsTab />
          </TabWithErrorBoundary>
        )

      case 'orders':
        return (
          <TabWithErrorBoundary name="Orders">
            <OrdersTab />
          </TabWithErrorBoundary>
        )

      case 'customers':
        return (
          <TabWithErrorBoundary name="Customers">
            <CustomersTab />
          </TabWithErrorBoundary>
        )

      case 'custom':
        return (
          <TabWithErrorBoundary name="Custom Orders">
            <CustomOrdersTab />
          </TabWithErrorBoundary>
        )

      case 'content':
        return (
          <TabWithErrorBoundary name="Content Management">
            <ContentTab />
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