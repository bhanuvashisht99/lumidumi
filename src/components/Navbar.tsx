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
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-charcoal hover:bg-cream-50"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
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

          {/* Temporarily show admin link for all users */}
          <a
            href="/admin"
            className="text-sm font-semibold leading-6 text-charcoal hover:text-cream-300 transition-colors"
          >
            Admin
          </a>

          {/* User authentication */}
          {user ? (
            <div className="flex items-center gap-x-4">
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-4 py-4 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 shadow-lg">
            <div className="flex items-center justify-between">
              <a href="/" className="-m-1.5 p-1.5 flex items-center">
                <Logo width={40} height={40} showText={false} />
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-charcoal"
                onClick={() => setMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-charcoal hover:bg-cream-50"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-charcoal hover:bg-cream-50"
                  >
                    Cart
                  </a>

                  {/* Temporarily show admin link for all users */}
                  <a
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-charcoal hover:bg-cream-50"
                  >
                    Admin
                  </a>

                  {/* User authentication */}
                  {user ? (
                    <>
                      <a
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-charcoal hover:bg-cream-50"
                      >
                        My Account
                      </a>
                      <button
                        onClick={() => {
                          signOut()
                          setMobileMenuOpen(false)
                        }}
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-charcoal hover:bg-cream-50 w-full text-left"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <a
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-charcoal hover:bg-cream-50"
                    >
                      Sign In
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}