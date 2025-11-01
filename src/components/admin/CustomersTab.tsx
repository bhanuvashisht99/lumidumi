'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  phone?: string
  is_guest?: boolean
  created_at: string
  order_count?: number
  latest_order?: string
}

interface GuestCustomer {
  email: string
  customer_name: string
  customer_phone: string
  order_count: number
  latest_order: string
  total_spent: number
}

export default function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [guestCustomers, setGuestCustomers] = useState<GuestCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'registered' | 'guests'>('registered')

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch registered customers from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, phone, is_guest, created_at')
        .order('created_at', { ascending: false })

      if (profileError) {
        throw profileError
      }

      // Get order counts for registered customers
      const registeredCustomers = await Promise.all((profileData || []).map(async (profile: any) => {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('customer_email', profile.email)

        const { data: latestOrder } = await supabase
          .from('orders')
          .select('created_at')
          .eq('customer_email', profile.email)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...profile,
          order_count: count || 0,
          latest_order: (latestOrder as any)?.created_at || null
        }
      }))

      // Fetch guest customers from orders (those without profiles)
      const { data: guestOrders, error: guestError } = await supabase
        .from('orders')
        .select('customer_email, customer_name, customer_phone, total_amount, created_at')
        .eq('is_guest_order', true)
        .order('created_at', { ascending: false })

      if (guestError) {
        console.error('Error fetching guest orders:', guestError)
      }

      // Group guest orders by email to get unique customers with stats
      const guestCustomerMap = new Map<string, GuestCustomer>()

      guestOrders?.forEach((order: any) => {
        const existing = guestCustomerMap.get(order.customer_email)
        if (existing) {
          existing.order_count += 1
          existing.total_spent += order.total_amount
          if (order.created_at > existing.latest_order) {
            existing.latest_order = order.created_at
          }
        } else {
          guestCustomerMap.set(order.customer_email, {
            email: order.customer_email,
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            order_count: 1,
            latest_order: order.created_at,
            total_spent: order.total_amount
          })
        }
      })

      // Filter out guest customers who now have registered accounts
      const registeredEmails = new Set(registeredCustomers.map(c => c.email))
      const uniqueGuestCustomers = Array.from(guestCustomerMap.values())
        .filter(guest => !registeredEmails.has(guest.email))
        .sort((a, b) => new Date(b.latest_order).getTime() - new Date(a.latest_order).getTime())

      setCustomers(registeredCustomers)
      setGuestCustomers(uniqueGuestCustomers)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [])

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

  const formatPrice = (price: number) => `₹${price.toLocaleString()}`

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-charcoal">
          All Customers ({customers.length + guestCustomers.length})
        </h2>
        <button
          onClick={fetchCustomers}
          className="btn-secondary"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-cream-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('registered')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'registered'
              ? 'bg-white text-charcoal shadow-sm'
              : 'text-charcoal/60 hover:text-charcoal'
          }`}
        >
          Registered ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('guests')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'guests'
              ? 'bg-white text-charcoal shadow-sm'
              : 'text-charcoal/60 hover:text-charcoal'
          }`}
        >
          Guest Orders ({guestCustomers.length})
        </button>
      </div>

      {/* Registered Customers */}
      {activeTab === 'registered' && (
        <div className="space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-lg">
              <div>
                <p className="font-medium text-charcoal">
                  {customer.first_name} {customer.last_name}
                </p>
                <p className="text-sm text-charcoal/60">
                  {customer.email}
                </p>
                {customer.phone && (
                  <p className="text-sm text-charcoal/60">
                    📞 {customer.phone}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  {customer.role === 'admin' && (
                    <span className="text-xs bg-cream-300 text-white px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                  {customer.is_guest && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Guest Account
                    </span>
                  )}
                </div>
                <p className="text-sm text-charcoal/60">
                  {customer.order_count || 0} orders
                </p>
                <p className="text-xs text-charcoal/50">
                  Joined: {new Date(customer.created_at).toLocaleDateString()}
                </p>
                {customer.latest_order && (
                  <p className="text-xs text-charcoal/50">
                    Last order: {new Date(customer.latest_order).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
          {customers.length === 0 && (
            <div className="text-center py-8 text-charcoal/60">
              No registered customers found
            </div>
          )}
        </div>
      )}

      {/* Guest Customers */}
      {activeTab === 'guests' && (
        <div className="space-y-4">
          {guestCustomers.map((guest, index) => (
            <div key={`guest-${guest.email}-${index}`} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div>
                <p className="font-medium text-charcoal">
                  {guest.customer_name}
                </p>
                <p className="text-sm text-charcoal/60">
                  {guest.email}
                </p>
                <p className="text-sm text-charcoal/60">
                  📞 {guest.customer_phone}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                    Guest Only
                  </span>
                </div>
                <p className="text-sm text-charcoal/60">
                  {guest.order_count} orders • {formatPrice(guest.total_spent)}
                </p>
                <p className="text-xs text-charcoal/50">
                  Last order: {new Date(guest.latest_order).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {guestCustomers.length === 0 && (
            <div className="text-center py-8 text-charcoal/60">
              No guest customers found
            </div>
          )}
        </div>
      )}
    </div>
  )
}