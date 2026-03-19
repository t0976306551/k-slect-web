'use client'

import Link from 'next/link'
import { getCartTotal, getCartCount } from '@/lib/cart'
import type { CartItem } from '@/lib/cart'

interface CartSummaryProps {
  items: CartItem[]
}

export default function CartSummary({ items }: CartSummaryProps) {
  const count = getCartCount(items)
  const total = getCartTotal(items)

  if (count === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href="/cart"
        className="flex items-center gap-3 bg-purple-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      >
        <span className="text-xl">🛒</span>
        <span className="font-medium text-sm">
          {count} 件
        </span>
        <span className="font-bold text-sm">
          NT$ {total.toLocaleString('zh-TW')}
        </span>
      </Link>
    </div>
  )
}
