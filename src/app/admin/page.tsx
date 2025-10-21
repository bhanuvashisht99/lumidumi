'use client'

import AuthGuard from '@/components/AuthGuard'
import SimpleAdminDashboard from '@/components/admin/SimpleAdminDashboard'

export default function AdminDashboard() {
  return (
    <AuthGuard requireAdmin={true}>
      <SimpleAdminDashboard />
    </AuthGuard>
  )
}