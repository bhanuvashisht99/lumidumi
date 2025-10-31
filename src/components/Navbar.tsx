'use client'

import { useState } from 'react'
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import Logo from './Logo'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const isAdmin = user?.is_admin || false
  const { getTotalItems, items } = useCart()

  console.log('🛒 [Navbar] Cart items:', items, 'Total count:', getTotalItems())


  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Custom Orders', href: '/custom-orders' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <div>
      <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cream-100 shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5 flex items-center">
              <Logo width={40} height={40} showText={false} />
            </a>
          </div>

          {/* Mobile cart and menu */}
          <div className="flex lg:hidden items-center gap-x-2">
            {/* Mobile cart icon */}
            <a
              href="/cart"
              className="relative p-2 text-charcoal hover:text-cream-300 transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-cream-300 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {getTotalItems()}
                </span>
              )}
            </a>

            {/* Mobile menu button */}
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-cream-200 bg-white text-charcoal hover:bg-cream-50 shadow-sm transition-all duration-200 active:scale-95"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-semibold leading-6 text-charcoal hover:text-cream-300 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex lg:items-center lg:gap-x-4">
            <a
              href="/cart"
              className="relative p-2 text-charcoal hover:text-cream-300 transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-cream-300 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {getTotalItems()}
                </span>
              )}
            </a>

            {/* User authentication */}
            {user ? (
              <div className="flex items-center gap-x-4">
                {/* Show admin link only for admin users */}
                {isAdmin && (
                  <a
                    href="/admin"
                    className="text-sm font-semibold leading-6 text-charcoal hover:text-cream-300 transition-colors"
                  >
                    Admin
                  </a>
                )}
                <a
                  href="/profile"
                  className="text-sm font-semibold leading-6 text-charcoal hover:text-cream-300 transition-colors"
                >
                  My Account
                </a>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-semibold leading-6 text-charcoal hover:text-cream-300 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="text-sm font-semibold leading-6 text-charcoal hover:text-cream-300 transition-colors"
              >
                Sign In
              </a>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85%] bg-white shadow-2xl z-[61] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cream-200">
              <Logo width={32} height={32} showText={false} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-cream-50 transition-colors"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6 text-charcoal" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto">
              {/* Main Navigation */}
              <div className="p-6 space-y-3">
                <h3 className="text-xs font-semibold text-charcoal/40 uppercase tracking-widest mb-4">Navigation</h3>
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center py-3 px-4 text-base font-medium text-charcoal hover:bg-cream-50 rounded-xl transition-all duration-200 border border-transparent hover:border-cream-200"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* Account & Actions */}
              <div className="border-t border-cream-100 p-6 space-y-3">
                <h3 className="text-xs font-semibold text-charcoal/40 uppercase tracking-widest mb-4">Account</h3>

                {/* Cart */}
                <a
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-4 px-4 text-base font-medium text-charcoal hover:bg-cream-50 rounded-xl transition-all duration-200 border border-transparent hover:border-cream-200"
                >
                  <span>🛒 Shopping Cart</span>
                  {getTotalItems() > 0 && (
                    <span className="bg-cream-300 text-white text-xs rounded-full px-2 py-1 font-bold min-w-[20px] text-center">
                      {getTotalItems()}
                    </span>
                  )}
                </a>

                {/* Admin Link */}
                {isAdmin && (
                  <a
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center py-4 px-4 text-base font-medium text-cream-300 hover:bg-cream-50 rounded-xl transition-all duration-200 border border-transparent hover:border-cream-200"
                  >
                    👨‍💼 Admin Panel
                  </a>
                )}

                {/* User Authentication */}
                {user ? (
                  <div className="space-y-2">
                    <a
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center py-4 px-4 text-base font-medium text-charcoal hover:bg-cream-50 rounded-xl transition-all duration-200 border border-transparent hover:border-cream-200"
                    >
                      👤 My Account
                    </a>
                    <button
                      onClick={() => {
                        signOut()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center py-4 px-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                ) : (
                  <a
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-4 px-4 text-base font-bold text-white bg-cream-300 hover:bg-cream-400 rounded-xl transition-all duration-200 shadow-sm"
                  >
                    🔐 Sign In
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}