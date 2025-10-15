'use client'

import { useState } from 'react'
import { ContentData } from '@/lib/content'
import { useContentSection } from '@/hooks/useContent'

interface ContactClientProps {
  initialContent: ContentData
}

export default function ContactClient({ initialContent }: ContactClientProps) {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  // Use server-loaded content initially, then allow client updates for admin panel
  const { content: contactContent } = useContentSection('contact')

  // Use server content initially, then switch to client updates
  const displayContent = contactContent.title ? contactContent : initialContent

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal mb-4">
            {displayContent.title}
          </h2>
          <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
            {displayContent.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="input resize-none"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="card">
              <h3 className="text-xl font-semibold text-charcoal mb-4">Contact Information</h3>

              <div className="space-y-4">
                {displayContent.email && (
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📧</span>
                    <div>
                      <p className="font-medium text-charcoal">Email</p>
                      <p className="text-charcoal/60">{displayContent.email}</p>
                    </div>
                  </div>
                )}

                {displayContent.phone && (
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📱</span>
                    <div>
                      <p className="font-medium text-charcoal">Phone</p>
                      <p className="text-charcoal/60">{displayContent.phone}</p>
                    </div>
                  </div>
                )}

                {displayContent.address && (
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="font-medium text-charcoal">Location</p>
                      <p className="text-charcoal/60">{displayContent.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {displayContent.businessHours && (
              <div className="card">
                <h3 className="text-xl font-semibold text-charcoal mb-4">Business Hours</h3>
                <div className="text-charcoal/60">
                  {displayContent.businessHours}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}