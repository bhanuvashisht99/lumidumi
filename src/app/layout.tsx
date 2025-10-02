import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lumidumi - Handmade Candles',
  description: 'Beautiful handmade candles crafted with love. Discover our premium collection of scented and decorative candles.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-cream-50 text-charcoal">
        <AuthProvider>
          <Navbar />
          <main className="pt-20">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}