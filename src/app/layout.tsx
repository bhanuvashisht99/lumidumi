import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lumidumi - Handmade Candles',
  description: 'Beautiful handmade candles crafted with love. Discover our premium collection of scented and decorative candles.',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport = 'width=device-width, initial-scale=1'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-cream-50 text-charcoal">
        <ServiceWorkerRegistration />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="pt-20">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}