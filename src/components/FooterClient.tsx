'use client'

import { ContentData } from '@/lib/content'
import { useContentSection } from '@/hooks/useContent'

interface FooterClientProps {
  initialContent: ContentData
}

export default function FooterClient({ initialContent }: FooterClientProps) {
  // Use server-loaded content initially, then allow client updates for admin panel
  const { content: footerContent } = useContentSection('footer')

  // Use server content initially, then switch to client updates
  const displayContent = footerContent.description ? footerContent : initialContent

  return (
    <footer className="bg-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-serif">Lumidumi</h3>
            <p className="text-white/70">
              {displayContent.description}
            </p>
            <div className="flex space-x-4">
              {displayContent.socialMedia?.facebook && (
                <a href={displayContent.socialMedia.facebook} className="text-white/70 hover:text-cream-300 transition-colors">
                  <span className="sr-only">Facebook</span>
                  📘
                </a>
              )}
              {displayContent.socialMedia?.instagram && (
                <a href={displayContent.socialMedia.instagram} className="text-white/70 hover:text-cream-300 transition-colors">
                  <span className="sr-only">Instagram</span>
                  📷
                </a>
              )}
              {displayContent.socialMedia?.whatsapp && (
                <a href={`https://wa.me/${displayContent.socialMedia.whatsapp.replace(/[^0-9]/g, '')}`} className="text-white/70 hover:text-cream-300 transition-colors">
                  <span className="sr-only">WhatsApp</span>
                  📱
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {displayContent.quickLinks?.map((link: any, index: number) => (
                <li key={index}>
                  <a href={link.url} className="text-white/70 hover:text-cream-300 transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {displayContent.policies?.map((policy: any, index: number) => (
                <li key={index}>
                  <a href={policy.url} className="text-white/70 hover:text-cream-300 transition-colors">
                    {policy.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-white/70">
              {displayContent.contact?.email && (
                <p>Email: {displayContent.contact.email}</p>
              )}
              {displayContent.contact?.phone && (
                <p>Phone: {displayContent.contact.phone}</p>
              )}
              {displayContent.contact?.address && (
                <p>Address: {displayContent.contact.address}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>{displayContent.copyright}</p>
        </div>
      </div>
    </footer>
  )
}