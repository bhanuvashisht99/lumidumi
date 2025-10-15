'use client'

import { ContentData } from '@/lib/content'
import { useContentSection } from '@/hooks/useContent'

interface AboutClientProps {
  initialContent: ContentData
}

export default function AboutClient({ initialContent }: AboutClientProps) {
  // Use server-loaded content initially, then allow client updates for admin panel
  const { content: aboutContent } = useContentSection('about')

  // Use server content initially, then switch to client updates
  const displayContent = aboutContent.title ? aboutContent : initialContent

  return (
    <section className="py-20 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-cream-200 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
              {displayContent.imageUrl ? (
                <img
                  src={displayContent.imageUrl}
                  alt={displayContent.title}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="text-center text-charcoal/40">
                  <div className="text-8xl mb-4">✨</div>
                  <p className="text-lg">Candle Making Process</p>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-charcoal mb-4">
                {displayContent.title}
              </h2>
              <p className="text-lg text-charcoal/70 leading-relaxed">
                {displayContent.subtitle}
              </p>
              {displayContent.description && (
                <p className="text-base text-charcoal/60 leading-relaxed mt-4">
                  {displayContent.description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {displayContent.features?.map((feature: any, index: number) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-charcoal mb-1">{feature.title}</h3>
                    <p className="text-charcoal/60">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}