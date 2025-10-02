'use client'

import { useState } from 'react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products')

  const stats = [
    { name: 'Total Products', value: '24', change: '+2 this week' },
    { name: 'Total Orders', value: '156', change: '+12 today' },
    { name: 'Revenue', value: '₹45,280', change: '+8% this month' },
    { name: 'Custom Requests', value: '8', change: '3 pending' },
  ]

  const tabs = [
    { id: 'products', name: 'Products', icon: '📦' },
    { id: 'orders', name: 'Orders', icon: '📋' },
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'custom', name: 'Custom Orders', icon: '🎨' },
  ]

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">Admin Dashboard</h1>
          <p className="text-charcoal/60 mt-2">Manage your Lumidumi candle business</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal/60">{stat.name}</p>
                  <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                  <p className="text-sm text-cream-300">{stat.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-cream-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-cream-300 text-cream-300'
                    : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-charcoal/30'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card">
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'custom' && <CustomOrdersTab />}
        </div>
      </div>
    </div>
  )
}

function ProductsTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-charcoal">Products</h2>
        <button className="btn-primary">Add New Product</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-cream-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-cream-100 rounded-lg flex items-center justify-center">
                    🕯️
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-charcoal">Vanilla Dreams</div>
                    <div className="text-sm text-charcoal/60">Scented Candle</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">Scented</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">₹899</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">12</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-cream-300 hover:text-cream-300/80 mr-4">Edit</button>
                <button className="text-red-600 hover:text-red-500">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OrdersTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-charcoal mb-6">Recent Orders</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-cream-50 rounded-lg">
          <div>
            <p className="font-medium text-charcoal">#ORD-001</p>
            <p className="text-sm text-charcoal/60">John Doe • 2 items • ₹1,648</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            Delivered
          </span>
        </div>
        <div className="flex items-center justify-between p-4 bg-cream-50 rounded-lg">
          <div>
            <p className="font-medium text-charcoal">#ORD-002</p>
            <p className="text-sm text-charcoal/60">Jane Smith • 1 item • ₹899</p>
          </div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
            Processing
          </span>
        </div>
      </div>
    </div>
  )
}

function CustomersTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-charcoal mb-6">Customers</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-cream-50 rounded-lg">
          <div>
            <p className="font-medium text-charcoal">John Doe</p>
            <p className="text-sm text-charcoal/60">john@example.com • 3 orders</p>
          </div>
          <span className="text-sm text-charcoal/60">Last order: 2 days ago</span>
        </div>
      </div>
    </div>
  )
}

function CustomOrdersTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-charcoal mb-6">Custom Order Requests</h2>
      <div className="space-y-4">
        <div className="p-4 bg-cream-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-charcoal">Wedding Anniversary Candles</p>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Pending Quote
            </span>
          </div>
          <p className="text-sm text-charcoal/60 mb-2">
            Sarah Johnson • sarah@example.com
          </p>
          <p className="text-sm text-charcoal">
            Looking for custom candles for 25th wedding anniversary with gold accents...
          </p>
          <div className="flex space-x-2 mt-4">
            <button className="btn-secondary text-sm">Send Quote</button>
            <button className="text-sm text-charcoal/60 hover:text-charcoal">View Details</button>
          </div>
        </div>
      </div>
    </div>
  )
}