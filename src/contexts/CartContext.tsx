'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Product } from '@/lib/database'

export interface CartItem {
  id: string
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  isInCart: (productId: string) => boolean
  getCartItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('lumidumi-cart')
    console.log('🛒 [CartContext] Loading cart from localStorage:', savedCart)
    console.log('🛒 [CartContext] Current items state:', items)
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        console.log('🛒 [CartContext] Parsed cart:', parsedCart)
        setItems(parsedCart)
      } catch (error) {
        console.error('🛒 [CartContext] Error loading cart from localStorage:', error)
      }
    } else {
      console.log('🛒 [CartContext] No saved cart found, starting with empty cart')
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever items change (but only after initial load)
  useEffect(() => {
    if (!isLoaded) {
      console.log('🛒 [CartContext] Skipping save - not loaded yet')
      return
    }
    console.log('🛒 [CartContext] Saving cart to localStorage:', items)
    console.log('🛒 [CartContext] Total items count:', items.reduce((total, item) => total + item.quantity, 0))
    localStorage.setItem('lumidumi-cart', JSON.stringify(items))
  }, [items, isLoaded])

  const addToCart = (product: Product, quantity: number = 1) => {
    console.log('🛒 [CartContext] AddToCart called:', {
      productName: product.name,
      productId: product.id,
      quantity,
      stockQuantity: product.stock_quantity
    })
    setItems(currentItems => {
      console.log('🛒 [CartContext] Current items before add:', currentItems)
      const existingItem = currentItems.find(item => item.id === product.id)

      if (existingItem) {
        console.log('🛒 [CartContext] Updating existing item:', existingItem)
        // Update existing item quantity
        const updatedItems = currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock_quantity) }
            : item
        )
        console.log('🛒 [CartContext] Updated items array:', updatedItems)
        return updatedItems
      } else {
        console.log('🛒 [CartContext] Adding new item')
        // Add new item
        const newItems = [...currentItems, {
          id: product.id,
          product,
          quantity: Math.min(quantity, product.stock_quantity)
        }]
        console.log('🛒 [CartContext] New items array:', newItems)
        return newItems
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems(currentItems =>
      currentItems.map(item => {
        if (item.id === productId) {
          const newQuantity = Math.min(quantity, item.product.stock_quantity)
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const isInCart = (productId: string) => {
    return items.some(item => item.id === productId)
  }

  const getCartItemQuantity = (productId: string) => {
    const item = items.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getCartItemQuantity,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}