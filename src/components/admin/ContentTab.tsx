'use client'

import { useState, useEffect, useCallback } from 'react'

interface ContentData {
  hero: any
  about: any
  pricing: any
  contact: any
  footer: any
}

export default function ContentTab() {
  const [selectedSection, setSelectedSection] = useState('hero')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<ContentData>({
    hero: {
      title: 'Lumidumi',
      subtitle: 'Handcrafted candles that illuminate your space with warmth and elegance.',
      description: 'Each candle is lovingly made with premium wax and carefully selected fragrances.',
      imageUrl: '',
      stats: [
        { value: '100%', label: 'Natural Wax' },
        { value: '50+', label: 'Unique Scents' },
        { value: '24h', label: 'Burn Time' }
      ]
    },
    about: {
      title: 'Crafted with Love',
      subtitle: 'At Lumidumi, every candle tells a story.',
      description: 'We believe in the power of handcrafted beauty and the warmth that comes from creating something special with your own hands.',
      imageUrl: '',
      features: [
        { icon: '🌿', title: 'Natural Ingredients', description: 'We use only premium natural wax and carefully sourced fragrances' },
        { icon: '👐', title: 'Handmade Process', description: 'Each candle is individually crafted with attention to every detail' },
        { icon: '🎨', title: 'Custom Designs', description: 'Personalized candles for your special moments and occasions' }
      ]
    },
    pricing: {
      title: 'Custom Order Pricing',
      startingPrices: [
        { item: 'Small candles', price: '₹300 - ₹500 each' },
        { item: 'Medium candles', price: '₹600 - ₹900 each' },
        { item: 'Large candles', price: '₹1,000 - ₹1,500 each' },
        { item: 'Bulk orders', price: 'Special pricing available' }
      ],
      additionalServices: [
        { service: 'Custom packaging', price: '₹50 - ₹200 per piece' },
        { service: 'Personalized labels', price: '₹25 per piece' },
        { service: 'Rush orders (under 5 days)', price: '+50%' },
        { service: 'Delivery within city', price: '₹200 - ₹500' }
      ]
    },
    contact: {
      title: 'Get in Touch',
      subtitle: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
      email: 'team@lumidumi.com',
      phone: '+91 93548 51086',
      address: 'Delhi, India',
      businessHours: 'Monday - Friday: 9:00 AM - 8:00 PM',
      socialMedia: {
        instagram: 'https://www.instagram.com/lumidumi_candles/',
        whatsapp: '+91 93548 51086'
      }
    },
    footer: {
      description: 'Lumidumi creates handcrafted candles that illuminate your space with warmth and elegance.',
      quickLinks: [
        { name: 'About Us', url: '/about' },
        { name: 'Products', url: '/products' },
        { name: 'Custom Orders', url: '/custom-orders' },
        { name: 'Contact', url: '/contact' }
      ],
      policies: [
        { name: 'Privacy Policy', url: '/privacy-policy' },
        { name: 'Terms of Service', url: '/terms-of-service' },
        { name: 'Shipping Policy', url: '/shipping-policy' },
        { name: 'Refund Policy', url: '/refund-policy' }
      ],
      contact: {
        email: 'team@lumidumi.com',
        phone: '+91 93548 51086',
        address: 'Delhi, India'
      },
      socialMedia: {
        instagram: 'https://www.instagram.com/lumidumi_candles/',
        whatsapp: '+91 93548 51086'
      },
      copyright: '© 2025 Lumidumi. All rights reserved.'
    }
  })

  const loadAllContent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load all content sections in parallel
      const [heroRes, aboutRes, pricingRes, contactRes, footerRes] = await Promise.all([
        fetch('/api/admin/content?section=hero').catch(() => null),
        fetch('/api/admin/content?section=about').catch(() => null),
        fetch('/api/admin/content?section=pricing').catch(() => null),
        fetch('/api/admin/content?section=contact').catch(() => null),
        fetch('/api/admin/content?section=footer').catch(() => null)
      ])

      // Update content with fetched data or keep defaults
      const updatedContent = {
        hero: {
          title: 'Lumidumi',
          subtitle: 'Handcrafted candles that illuminate your space with warmth and elegance.',
          description: 'Each candle is lovingly made with premium wax and carefully selected fragrances.',
          imageUrl: '',
          stats: [
            { value: '100%', label: 'Natural Wax' },
            { value: '50+', label: 'Unique Scents' },
            { value: '24h', label: 'Burn Time' }
          ]
        },
        about: {
          title: 'Crafted with Love',
          subtitle: 'At Lumidumi, every candle tells a story.',
          description: 'We believe in the power of handcrafted beauty and the warmth that comes from creating something special with your own hands.',
          imageUrl: '',
          features: [
            { icon: '🌿', title: 'Natural Ingredients', description: 'We use only premium natural wax and carefully sourced fragrances' },
            { icon: '👐', title: 'Handmade Process', description: 'Each candle is individually crafted with attention to every detail' },
            { icon: '🎨', title: 'Custom Designs', description: 'Personalized candles for your special moments and occasions' }
          ]
        },
        pricing: {
          title: 'Custom Order Pricing',
          startingPrices: [
            { item: 'Small candles', price: '₹300 - ₹500 each' },
            { item: 'Medium candles', price: '₹600 - ₹900 each' },
            { item: 'Large candles', price: '₹1,000 - ₹1,500 each' },
            { item: 'Bulk orders', price: 'Special pricing available' }
          ],
          additionalServices: [
            { service: 'Custom packaging', price: '₹50 - ₹200 per piece' },
            { service: 'Personalized labels', price: '₹25 per piece' },
            { service: 'Rush orders (under 5 days)', price: '+50%' },
            { service: 'Delivery within city', price: '₹200 - ₹500' }
          ]
        },
        contact: {
          title: 'Get in Touch',
          subtitle: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
          email: 'team@lumidumi.com',
          phone: '+91 93548 51086',
          address: 'Delhi, India',
          businessHours: 'Monday - Friday: 9:00 AM - 8:00 PM',
          socialMedia: {
            instagram: 'https://www.instagram.com/lumidumi_candles/',
            facebook: 'https://facebook.com/lumidumi',
            whatsapp: '+91 93548 51086'
          }
        },
        footer: {
          description: 'Lumidumi creates handcrafted candles that illuminate your space with warmth and elegance.',
          quickLinks: [
            { name: 'About Us', url: '/about' },
            { name: 'Products', url: '/products' },
            { name: 'Custom Orders', url: '/custom-orders' },
            { name: 'Contact', url: '/contact' }
          ],
          policies: [
            { name: 'Privacy Policy', url: '/privacy-policy' },
            { name: 'Terms of Service', url: '/terms-of-service' },
            { name: 'Shipping Policy', url: '/shipping-policy' },
            { name: 'Refund Policy', url: '/refund-policy' }
          ],
          contact: {
            email: 'team@lumidumi.com',
            phone: '+91 93548 51086',
            address: 'Delhi, India'
          },
          socialMedia: {
            instagram: 'https://www.instagram.com/lumidumi_candles/',
            facebook: 'https://facebook.com/lumidumi',
            whatsapp: '+91 93548 51086'
          },
          copyright: '© 2025 Lumidumi. All rights reserved.'
        }
      }

      if (heroRes?.ok) {
        const { data } = await heroRes.json()
        if (data?.additional_data) {
          updatedContent.hero = data.additional_data
        }
      }

      if (aboutRes?.ok) {
        const { data } = await aboutRes.json()
        if (data?.additional_data) {
          updatedContent.about = data.additional_data
        }
      }

      if (pricingRes?.ok) {
        const { data } = await pricingRes.json()
        if (data?.additional_data) {
          updatedContent.pricing = data.additional_data
        }
      }

      if (contactRes?.ok) {
        const { data } = await contactRes.json()
        if (data?.additional_data) {
          updatedContent.contact = data.additional_data
        }
      }

      if (footerRes?.ok) {
        const { data } = await footerRes.json()
        if (data?.additional_data) {
          updatedContent.footer = data.additional_data
        }
      }

      setContent(updatedContent)
    } catch (error) {
      console.error('Error loading content:', error)
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllContent()
  }, [])

  const handleSave = async (section: string) => {
    try {
      const contentData = content[section as keyof ContentData]

      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          data: contentData
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save content')
      }

      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} content saved successfully!`)

      // Broadcast content update event to frontend
      if (typeof window !== 'undefined') {
        window.postMessage({ type: 'CONTENT_UPDATED', section }, '*')
      }
    } catch (error) {
      console.error('Error saving content:', error)
      alert(`Error saving content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cream-300 mx-auto mb-3"></div>
        <p className="text-charcoal/60">Loading content...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadAllContent} className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-charcoal mb-4">Content Management</h2>
        <div className="flex flex-wrap gap-2">
          {['hero', 'about', 'pricing', 'contact', 'footer'].map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedSection === section
                  ? 'bg-cream-300 text-white'
                  : 'bg-cream-100 text-charcoal hover:bg-cream-200'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Simplified content editor */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 capitalize">{selectedSection} Section</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Content Preview
            </label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(content[selectedSection as keyof ContentData], null, 2)}
              </pre>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={loadAllContent}
              className="btn-secondary"
            >
              🔄 Reload Content
            </button>
            <button
              onClick={() => handleSave(selectedSection)}
              className="btn-primary"
            >
              Save {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} Content
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}