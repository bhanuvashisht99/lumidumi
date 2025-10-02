'use client'

import { useState } from 'react'
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Custom Orders', href: '/custom-orders' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cream-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="text-2xl font-bold text-charcoal font-serif">
              Lumidumi
            </span>
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-charcoal"
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
            <span className="absolute -top-1 -right-1 bg-cream-300 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </a>
          <a
            href="/admin"
            className="text-sm font-semibold leading-6 text-charcoal hover:text-cream-300 transition-colors"
          >
            Admin
          </a>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="/" className="-m-1.5 p-1.5">
                <span className="text-2xl font-bold text-charcoal font-serif">
                  Lumidumi
                </span>
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
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-charcoal hover:bg-cream-50"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="/cart"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-charcoal hover:bg-cream-50"
                  >
                    Cart
                  </a>
                  <a
                    href="/admin"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-charcoal hover:bg-cream-50"
                  >
                    Admin
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}