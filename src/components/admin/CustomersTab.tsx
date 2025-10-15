'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  created_at: string
}

export default function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cream-300 mx-auto mb-3"></div>
        <p className="text-charcoal/60">Loading customers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchCustomers} className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-charcoal">Customers ({customers.length})</h2>
        <button
          onClick={fetchCustomers}
          className="btn-secondary"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-4">
        {customers.map((customer) => (
          <div key={customer.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-lg">
            <div>
              <p className="font-medium text-charcoal">
                {customer.first_name} {customer.last_name}
              </p>
              <p className="text-sm text-charcoal/60">
                {customer.email} • {customer.role}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-charcoal/60">
                Joined: {new Date(customer.created_at).toLocaleDateString()}
              </span>
              {customer.role === 'admin' && (
                <div className="text-xs bg-cream-300 text-white px-2 py-1 rounded mt-1">
                  Admin
                </div>
              )}
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <div className="text-center py-8 text-charcoal/60">
            No customers found
          </div>
        )}
      </div>
    </div>
  )
}