'use client'

import { useState } from 'react'
import Logo from './Logo'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-cream-50 to-cream-100 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-start mb-4">
                <Logo width={120} height={120} showText={false} className="text-charcoal" />
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-charcoal leading-tight">
                Lumidumi
              </h1>
              <p className="text-xl text-charcoal/80 leading-relaxed">
                Handcrafted candles that illuminate your space with warmth and elegance.
                Each candle is lovingly made with premium wax and carefully selected fragrances.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary">
                Shop Collection
              </button>
              <button className="btn-secondary">
                Custom Orders
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-cream-300">100%</div>
                <div className="text-sm text-charcoal/60">Natural Wax</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cream-300">50+</div>
                <div className="text-sm text-charcoal/60">Unique Scents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cream-300">24h</div>
                <div className="text-sm text-charcoal/60">Burn Time</div>
              </div>
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="relative">
            <div className="aspect-square bg-cream-200 rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-center text-charcoal/40">
                <div className="text-6xl mb-4">🕯️</div>
                <p className="text-lg">Beautiful Candle Image</p>
              </div>
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