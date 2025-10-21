'use client'

import AuthGuard from '@/components/AuthGuard'
import OptimizedAdminDashboard from '@/components/admin/OptimizedAdminDashboard'

export default function AdminDashboard() {
  return (
    <AuthGuard requireAdmin={true}>
      <OptimizedAdminDashboard />
    </AuthGuard>
  )
}