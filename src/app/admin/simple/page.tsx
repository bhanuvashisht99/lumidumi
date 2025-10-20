'use client'

export default function SimpleAdminPage() {
  return (
    <div className="min-h-screen bg-cream-50 p-8">
      <h1 className="text-3xl font-bold text-charcoal mb-8">Simple Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-charcoal">Products</h3>
          <p className="text-2xl font-bold text-charcoal mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-charcoal">Orders</h3>
          <p className="text-2xl font-bold text-charcoal mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-charcoal">Revenue</h3>
          <p className="text-2xl font-bold text-charcoal mt-2">₹0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-charcoal">Custom Orders</h3>
          <p className="text-2xl font-bold text-charcoal mt-2">0</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-charcoal mb-4">Admin Panel Working</h2>
        <p className="text-charcoal">This simple admin panel loads without any complex authentication or data fetching.</p>
        <p className="text-charcoal mt-2">Visit: <a href="/admin/simple" className="text-blue-600 underline">localhost:3002/admin/simple</a></p>
      </div>
    </div>
  )
}