'use client'

import { useState } from 'react'
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import Logo from './Logo'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAdmin, user, signOut } = useAuth()
  const { getTotalItems } = useCart()

  // Debug logging
  console.log('Navbar render - mobileMenuOpen:', mobileMenuOpen)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Custom Orders', href: '/custom-orders' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
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
            onClick={() => {
              console.log('Mobile menu button clicked!')
              setMobileMenuOpen(true)
            }}
            aria-label="Open mobile menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
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
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
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

      {/* Mobile menu - Completely remade */}
      <div className={`lg:hidden fixed inset-0 z-50 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div className="absolute top-0 right-0 h-full w-80 max-w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
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
          <div className="p-6 space-y-4">
            {/* Main Navigation */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-charcoal/60 uppercase tracking-wider mb-3">Navigation</h3>
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-4 text-base font-medium text-charcoal hover:bg-cream-50 rounded-lg transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Account & Actions */}
            <div className="border-t border-cream-200 pt-4 space-y-2">
              <h3 className="text-sm font-medium text-charcoal/60 uppercase tracking-wider mb-3">Account</h3>

              {/* Cart */}
              <a
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 px-4 text-base font-medium text-charcoal hover:bg-cream-50 rounded-lg transition-colors"
              >
                <span>Shopping Cart</span>
                {getTotalItems() > 0 && (
                  <span className="bg-cream-300 text-white text-xs rounded-full px-2 py-1 font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </a>

              {/* Admin Link */}
              {isAdmin && (
                <a
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-4 text-base font-medium text-cream-300 hover:bg-cream-50 rounded-lg transition-colors"
                >
                  Admin Panel
                </a>
              )}

              {/* User Authentication */}
              {user ? (
                <>
                  <a
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 text-base font-medium text-charcoal hover:bg-cream-50 rounded-lg transition-colors"
                  >
                    My Account
                  </a>
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left py-3 px-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-4 text-base font-bold text-white bg-cream-300 hover:bg-cream-400 rounded-lg transition-colors text-center"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}