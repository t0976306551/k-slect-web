'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getCart, getCartCount } from '@/lib/cart'

export default function NavbarCartBadge() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    function updateCount() {
      setCartCount(getCartCount(getCart()))
    }
    updateCount()
    window.addEventListener('storage', updateCount)
    return () => window.removeEventListener('storage', updateCount)
  }, [])

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 transition-colors"
    >
      <span className="text-lg">🛒</span>
      <span className="hidden sm:block">購物車</span>
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-3 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Link>
  )
}
