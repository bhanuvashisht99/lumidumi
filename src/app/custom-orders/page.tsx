'use client'

import { useState } from 'react'

export default function CustomOrdersPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    quantity: '',
    scent: '',
    color: '',
    size: '',
    deadline: '',
    budget: '',
    description: '',
    inspiration: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1500)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 flex items-center justify-center">
        <div className="max-w-lg w-full text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold text-charcoal mb-4">Custom Order Received!</h2>
            <p className="text-charcoal/70 mb-6">
              Thank you for your custom order request. We'll review your requirements and send you a detailed quote within 24-48 hours.
            </p>
            <div className="bg-cream-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-charcoal/60">
                <strong>Order ID:</strong> #CO-{Date.now().toString().slice(-6)}
              </p>
            </div>
            <button
              onClick={() => {
                setSubmitted(false)
                setFormData({
                  name: '', email: '', phone: '', eventType: '', quantity: '', scent: '', color: '', size: '', deadline: '', budget: '', description: '', inspiration: ''
                })
              }}
              className="btn-primary"
            >
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal mb-4">Custom Orders</h1>
          <p className="text-xl text-charcoal/70 max-w-3xl mx-auto">
            Create personalized candles for your special occasions. Each custom piece is handcrafted with love and attention to detail.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-cream-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="font-semibold text-charcoal mb-2">Share Your Vision</h3>
            <p className="text-sm text-charcoal/60">Tell us about your event, preferences, and requirements</p>
          </div>
          <div className="text-center">
            <div className="bg-cream-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="font-semibold text-charcoal mb-2">Get Your Quote</h3>
            <p className="text-sm text-charcoal/60">We'll provide a detailed quote within 24-48 hours</p>
          </div>
          <div className="text-center">
            <div className="bg-cream-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="font-semibold text-charcoal mb-2">Handcrafted for You</h3>
            <p className="text-sm text-charcoal/60">Your custom candles are carefully made and delivered</p>
          </div>
        </div>

        {/* Custom Order Form */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-charcoal mb-6">Tell us about your custom order</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-charcoal mb-2">
                  Event/Occasion *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  required
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                >
                  <option value="">Select an occasion</option>
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="religious">Religious Ceremony</option>
                  <option value="housewarming">Housewarming</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-charcoal mb-2">
                  Quantity *
                </label>
                <select
                  id="quantity"
                  name="quantity"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                >
                  <option value="">Select quantity</option>
                  <option value="1-10">1-10 pieces</option>
                  <option value="11-25">11-25 pieces</option>
                  <option value="26-50">26-50 pieces</option>
                  <option value="51-100">51-100 pieces</option>
                  <option value="100+">100+ pieces</option>
                </select>
              </div>
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="scent" className="block text-sm font-medium text-charcoal mb-2">
                  Preferred Scent
                </label>
                <input
                  type="text"
                  id="scent"
                  name="scent"
                  value={formData.scent}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  placeholder="e.g., Vanilla, Lavender, Custom blend"
                />
              </div>
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-charcoal mb-2">
                  Color Preference
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                  placeholder="e.g., Cream, Gold, Custom colors"
                />
              </div>
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-charcoal mb-2">
                  Size/Style
                </label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                >
                  <option value="">Select size</option>
                  <option value="small">Small (2-3 inches)</option>
                  <option value="medium">Medium (4-5 inches)</option>
                  <option value="large">Large (6+ inches)</option>
                  <option value="mixed">Mixed sizes</option>
                  <option value="custom">Custom dimensions</option>
                </select>
              </div>
            </div>

            {/* Timeline and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-charcoal mb-2">
                  Required Date *
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                />
              </div>
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-charcoal mb-2">
                  Budget Range
                </label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300"
                >
                  <option value="">Select budget range</option>
                  <option value="under-5000">Under ₹5,000</option>
                  <option value="5000-15000">₹5,000 - ₹15,000</option>
                  <option value="15000-30000">₹15,000 - ₹30,000</option>
                  <option value="30000-50000">₹30,000 - ₹50,000</option>
                  <option value="50000+">₹50,000+</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-charcoal mb-2">
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 resize-none"
                placeholder="Please describe your vision in detail - event details, specific requirements, design ideas, etc."
              />
            </div>

            {/* Inspiration */}
            <div>
              <label htmlFor="inspiration" className="block text-sm font-medium text-charcoal mb-2">
                Inspiration & References
              </label>
              <textarea
                id="inspiration"
                name="inspiration"
                rows={3}
                value={formData.inspiration}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 resize-none"
                placeholder="Any specific themes, colors, or styles that inspire you? Links to reference images are welcome!"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Request...
                </div>
              ) : (
                'Submit Custom Order Request'
              )}
            </button>
          </form>
        </div>

        {/* Pricing Information */}
        <div className="mt-12 bg-white rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-charcoal mb-4">Custom Order Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-charcoal mb-2">Starting Prices:</h4>
              <ul className="space-y-1 text-sm text-charcoal/60">
                <li>• Small candles: ₹300 - ₹500 each</li>
                <li>• Medium candles: ₹600 - ₹900 each</li>
                <li>• Large candles: ₹1,000 - ₹1,500 each</li>
                <li>• Bulk orders: Special pricing available</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-charcoal mb-2">Additional Services:</h4>
              <ul className="space-y-1 text-sm text-charcoal/60">
                <li>• Custom packaging: ₹50 - ₹200 per piece</li>
                <li>• Personalized labels: ₹25 per piece</li>
                <li>• Rush orders (under 5 days): +50%</li>
                <li>• Delivery within city: ₹200 - ₹500</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}