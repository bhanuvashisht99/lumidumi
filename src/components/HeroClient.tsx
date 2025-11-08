'use client'

import { ContentData } from '@/lib/content'
import { useContentSection } from '@/hooks/useContent'
import Logo from './Logo'

interface HeroClientProps {
  initialContent: ContentData
}

export default function HeroClient({ initialContent }: HeroClientProps) {
  // Use server-loaded content as initial, but allow client updates for admin panel
  const { content: heroContent } = useContentSection('hero')

  // Use server content initially, then switch to client updates
  const displayContent = heroContent.title ? heroContent : initialContent

  return (
    <section className="relative bg-gradient-to-b from-cream-50 to-cream-100 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-start mb-4">
                <Logo width={80} height={80} showText={false} className="text-charcoal sm:w-24 sm:h-24 lg:w-32 lg:h-32" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal leading-tight">
                {displayContent.title}
              </h1>
              <p className="text-lg sm:text-xl text-charcoal/80 leading-relaxed">
                {displayContent.subtitle}
              </p>
              {displayContent.description && (
                <p className="text-base text-charcoal/70 leading-relaxed">
                  {displayContent.description}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/products" className="btn-primary text-center">
                Shop Collection
              </a>
              <a href="/custom-orders" className="btn-secondary text-center">
                Custom Orders
              </a>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              {displayContent.stats?.map((stat: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-cream-300">{stat.value}</div>
                  <div className="text-sm text-charcoal/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-cream-200 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
              {displayContent.imageUrl ? (
                <img
                  src={displayContent.imageUrl}
                  alt={displayContent.title}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="text-center text-charcoal/40">
                  <div className="text-6xl mb-4">🕯️</div>
                  <p className="text-lg">Beautiful Candle Image</p>
                </div>
              )}
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-cream-300/20 rounded-full"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-cream-300/10 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  )
}