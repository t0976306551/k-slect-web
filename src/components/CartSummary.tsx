'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
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
    <div className="fixed right-4 z-40 md:bottom-6 md:right-6 md:z-50" style={{ bottom: 'calc(70px + env(safe-area-inset-bottom, 0px))' }}>
      <Link
        href="/cart"
        className="flex items-center gap-3 bg-purple-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      >
        <ShoppingCart size={20} />
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
