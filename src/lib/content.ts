import { createClient } from '@supabase/supabase-js'

// Server-side content loading utility
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ContentData {
  title?: string
  subtitle?: string
  description?: string
  imageUrl?: string
  [key: string]: any
}

export async function getContentSection(section: string): Promise<ContentData> {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', section)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error(`Error loading ${section} content:`, error)
      return getDefaultContent(section)
    }

    return data?.additional_data || getDefaultContent(section)
  } catch (error) {
    console.error(`Error loading ${section} content:`, error)
    return getDefaultContent(section)
  }
}

// Fallback defaults if database fails
function getDefaultContent(section: string): ContentData {
  const defaults: Record<string, ContentData> = {
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
    contact: {
      title: 'Get in Touch',
      subtitle: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
      email: 'team@lumidumi.com',
      phone: '+91 98765 43210',
      address: 'Delhi, India',
      businessHours: 'Monday - Friday: 9:00 AM - 8:00 PM',
      socialMedia: {
        instagram: 'https://instagram.com/lumidumi',
        facebook: 'https://facebook.com/lumidumi',
        whatsapp: '+91 98765 43210'
      }
    },
    footer: {
      description: 'Lumidumi creates handcrafted candles that illuminate your space with warmth and elegance. Each candle is lovingly made with premium wax and carefully selected fragrances.',
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
        phone: '+91 98765 43210',
        address: 'Delhi, India'
      },
      socialMedia: {
        instagram: 'https://instagram.com/lumidumi',
        facebook: 'https://facebook.com/lumidumi',
        whatsapp: '+91 98765 43210'
      },
      copyright: '© 2025 Lumidumi. All rights reserved.'
    }
  }

  return defaults[section] || {}
}