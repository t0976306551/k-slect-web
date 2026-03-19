'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getCart, getCartCount } from '@/lib/cart'

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    function updateCount() {
      setCartCount(getCartCount(getCart()))
    }
    updateCount()

    // 監聽 storage 事件，跨頁同步購物車數量
    window.addEventListener('storage', updateCount)
    return () => window.removeEventListener('storage', updateCount)
  }, [])

  return (
    <nav className="bg-white border-b border-purple-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🇰🇷</span>
          <span className="font-bold text-xl text-purple-700">K-slect</span>
          <span className="text-xs text-gray-400 hidden sm:block">韓貨嚴選</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
          >
            所有商品
          </Link>
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
        </div>
      </div>
    </nav>
  )
}
