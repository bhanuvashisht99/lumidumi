'use client'

import { useCart } from '@/contexts/CartContext'
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart()

  console.log('🛒 Cart page - items:', items, 'Total items:', getTotalItems())

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-charcoal mb-4">Your cart is empty</h1>
            <p className="text-charcoal/70 mb-8">
              Discover our beautiful collection of handcrafted candles
            </p>
            <a href="/products" className="btn-primary">
              Shop Now
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-charcoal mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-charcoal mb-4">
                  Cart Items ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'})
                </h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="border border-cream-200 rounded-lg p-4">
                      {/* Mobile Layout */}
                      <div className="block sm:hidden">
                        <div className="flex items-start space-x-3">
                          {/* Product Image */}
                          <div className="w-16 h-16 bg-cream-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                            {item.product.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              '🕯️'
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-charcoal truncate">{item.product.name}</h3>
                                <p className="text-sm text-charcoal/60 mt-1 line-clamp-2">
                                  {item.product.scent_description}
                                </p>
                                <p className="text-lg font-bold text-cream-300 mt-2">
                                  {formatPrice(item.product.price)}
                                </p>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                title="Remove from cart"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Quantity and Subtotal Row */}
                            <div className="flex justify-between items-center mt-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full border border-cream-200 flex items-center justify-center hover:bg-cream-50 transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <MinusIcon className="w-4 h-4" />
                                </button>

                                <span className="w-8 text-center font-medium">{item.quantity}</span>

                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full border border-cream-200 flex items-center justify-center hover:bg-cream-50 transition-colors"
                                  disabled={item.quantity >= item.product.stock_quantity}
                                >
                                  <PlusIcon className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Subtotal */}
                              <div className="text-right">
                                <p className="font-semibold text-charcoal">
                                  {formatPrice(item.product.price * item.quantity)}
                                </p>
                                <p className="text-xs text-charcoal/60">
                                  {item.product.stock_quantity - item.quantity} left
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-cream-100 rounded-lg flex items-center justify-center text-3xl">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            '🕯️'
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-charcoal">{item.product.name}</h3>
                          <p className="text-sm text-charcoal/60 mt-1">
                            {item.product.scent_description}
                          </p>
                          <p className="text-lg font-bold text-cream-300 mt-2">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-cream-200 flex items-center justify-center hover:bg-cream-50 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>

                          <span className="w-12 text-center font-medium">{item.quantity}</span>

                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-cream-200 flex items-center justify-center hover:bg-cream-50 transition-colors"
                            disabled={item.quantity >= item.product.stock_quantity}
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="font-semibold text-charcoal">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          <p className="text-xs text-charcoal/60 mt-1">
                            {item.product.stock_quantity - item.quantity} left
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from cart"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-charcoal mb-4">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-charcoal/70">Subtotal ({getTotalItems()} items)</span>
                  <span className="font-medium">{formatPrice(getTotalPrice())}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-charcoal/70">Delivery Charges</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>

                <hr className="border-cream-200" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-cream-300">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <a
                  href="/checkout"
                  className="w-full btn-primary text-center block"
                >
                  Proceed to Checkout
                </a>

                <a
                  href="/products"
                  className="w-full btn-secondary text-center block"
                >
                  Continue Shopping
                </a>
              </div>

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t border-cream-200">
                <div className="text-center">
                  <p className="text-xs text-charcoal/60 mb-2">Secure Payment</p>
                  <div className="flex justify-center space-x-2">
                    <div className="text-xs bg-cream-100 px-2 py-1 rounded">🔒 SSL</div>
                    <div className="text-xs bg-cream-100 px-2 py-1 rounded">💳 Razorpay</div>
                    <div className="text-xs bg-cream-100 px-2 py-1 rounded">✅ Secure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-charcoal mb-6">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* This would be populated with recommended products */}
            <div className="card">
              <div className="aspect-square bg-cream-100 rounded-lg mb-4 flex items-center justify-center text-6xl">
                🕯️
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Recommended Candle</h3>
              <p className="text-charcoal/60 text-sm mb-3">Perfect complement to your cart</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-cream-300">₹699</span>
                <button className="btn-secondary text-sm">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}