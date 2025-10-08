'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products')
  const { isAdmin, loading, user } = useAuth()
  const router = useRouter()

  // Temporarily disable admin check for testing
  // useEffect(() => {
  //   if (!loading && (!user || !isAdmin)) {
  //     router.push('/login')
  //   }
  // }, [loading, user, isAdmin, router])

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-cream-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cream-300 mx-auto"></div>
  //         <p className="mt-4 text-charcoal">Loading...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // if (!user || !isAdmin) {
  //   return (
  //     <div className="min-h-screen bg-cream-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-charcoal mb-4">Access Denied</h1>
  //         <p className="text-charcoal/60 mb-6">You need admin privileges to access this page.</p>
  //         <a
  //           href="/login"
  //           className="btn-primary"
  //         >
  //           Sign In
  //         </a>
  //       </div>
  //     </div>
  //   )
  // }

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
    { id: 'content', name: 'Content', icon: '📝' },
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
          {activeTab === 'content' && <ContentTab />}
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
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching customers:', error)
        } else {
          setCustomers(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading customers...</div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-charcoal mb-6">Customers ({customers.length})</h2>
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

function ContentTab() {
  const [selectedSection, setSelectedSection] = useState('hero')
  const [heroContent, setHeroContent] = useState({
    title: 'Lumidumi',
    subtitle: 'Handcrafted candles that illuminate your space with warmth and elegance.',
    description: 'Each candle is lovingly made with premium wax and carefully selected fragrances.',
    imageUrl: '',
    stats: [
      { value: '100%', label: 'Natural Wax' },
      { value: '50+', label: 'Unique Scents' },
      { value: '24h', label: 'Burn Time' }
    ]
  })

  const [aboutContent, setAboutContent] = useState({
    title: 'Crafted with Love',
    subtitle: 'At Lumidumi, every candle tells a story.',
    description: 'We believe in the power of handcrafted beauty and the warmth that comes from creating something special with your own hands.',
    imageUrl: '',
    features: [
      { icon: '🌿', title: 'Natural Ingredients', description: 'We use only premium natural wax and carefully sourced fragrances' },
      { icon: '👐', title: 'Handmade Process', description: 'Each candle is individually crafted with attention to every detail' },
      { icon: '🎨', title: 'Custom Designs', description: 'Personalized candles for your special moments and occasions' }
    ]
  })

  const handleSave = async (section: string) => {
    // TODO: Implement save functionality with Supabase
    console.log(`Saving ${section} content...`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-charcoal">Content Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedSection('hero')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedSection === 'hero'
                ? 'bg-cream-300 text-white'
                : 'bg-cream-100 text-charcoal hover:bg-cream-200'
            }`}
          >
            Hero Section
          </button>
          <button
            onClick={() => setSelectedSection('about')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedSection === 'about'
                ? 'bg-cream-300 text-white'
                : 'bg-cream-100 text-charcoal hover:bg-cream-200'
            }`}
          >
            About Section
          </button>
        </div>
      </div>

      {selectedSection === 'hero' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Title
              </label>
              <input
                type="text"
                value={heroContent.title}
                onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={heroContent.imageUrl}
                onChange={(e) => setHeroContent({ ...heroContent, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Subtitle
            </label>
            <textarea
              value={heroContent.subtitle}
              onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Description
            </label>
            <textarea
              value={heroContent.description}
              onChange={(e) => setHeroContent({ ...heroContent, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-4">
              Statistics
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {heroContent.stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...heroContent.stats]
                      newStats[index].value = e.target.value
                      setHeroContent({ ...heroContent, stats: newStats })
                    }}
                    className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                    placeholder="100%"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...heroContent.stats]
                      newStats[index].label = e.target.value
                      setHeroContent({ ...heroContent, stats: newStats })
                    }}
                    className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                    placeholder="Natural Wax"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleSave('hero')}
            className="btn-primary"
          >
            Save Hero Content
          </button>
        </div>
      )}

      {selectedSection === 'about' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Title
              </label>
              <input
                type="text"
                value={aboutContent.title}
                onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={aboutContent.imageUrl}
                onChange={(e) => setAboutContent({ ...aboutContent, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Subtitle
            </label>
            <textarea
              value={aboutContent.subtitle}
              onChange={(e) => setAboutContent({ ...aboutContent, subtitle: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Description
            </label>
            <textarea
              value={aboutContent.description}
              onChange={(e) => setAboutContent({ ...aboutContent, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-4">
              Features
            </label>
            <div className="space-y-4">
              {aboutContent.features.map((feature, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-cream-50 rounded-lg">
                  <input
                    type="text"
                    value={feature.icon}
                    onChange={(e) => {
                      const newFeatures = [...aboutContent.features]
                      newFeatures[index].icon = e.target.value
                      setAboutContent({ ...aboutContent, features: newFeatures })
                    }}
                    className="px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                    placeholder="🌿"
                  />
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => {
                      const newFeatures = [...aboutContent.features]
                      newFeatures[index].title = e.target.value
                      setAboutContent({ ...aboutContent, features: newFeatures })
                    }}
                    className="px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                    placeholder="Feature Title"
                  />
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={feature.description}
                      onChange={(e) => {
                        const newFeatures = [...aboutContent.features]
                        newFeatures[index].description = e.target.value
                        setAboutContent({ ...aboutContent, features: newFeatures })
                      }}
                      className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-cream-300 focus:border-cream-300"
                      placeholder="Feature description"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleSave('about')}
            className="btn-primary"
          >
            Save About Content
          </button>
        </div>
      )}
    </div>
  )
}