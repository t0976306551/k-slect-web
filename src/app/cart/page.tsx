'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCart, updateQuantity, removeFromCart, getCartTotal, getCartCount } from '@/lib/cart'
import type { CartItem } from '@/lib/cart'

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(getCart())
  }, [])

  function handleQuantityChange(productId: string, quantity: number) {
    const updated = updateQuantity(productId, quantity)
    setItems(updated)
  }

  function handleRemove(productId: string) {
    const updated = removeFromCart(productId)
    setItems(updated)
  }

  const total = getCartTotal(items)
  const count = getCartCount(items)

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-600 mb-2">購物車是空的</h2>
        <p className="text-gray-400 text-sm mb-6">快去挑選你喜歡的韓貨吧！</p>
        <Link
          href="/products"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
        >
          去逛逛
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">購物車</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-xl border border-purple-100 p-4 flex items-center gap-4"
          >
            <div className="bg-purple-50 w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              🛍️
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm line-clamp-2">
                {item.productName}
              </p>
              <p className="text-purple-600 font-semibold text-sm mt-1">
                NT$ {item.price.toLocaleString('zh-TW')}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                className="w-8 h-8 rounded-full border border-purple-200 flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                className="w-8 h-8 rounded-full border border-purple-200 flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="font-bold text-gray-800 text-sm">
                NT$ {(item.price * item.quantity).toLocaleString('zh-TW')}
              </p>
              <button
                onClick={() => handleRemove(item.productId)}
                className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors"
              >
                移除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 訂單摘要 */}
      <div className="bg-white rounded-xl border border-purple-100 p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">訂單摘要</h2>
        <div className="flex justify-between text-sm text-gray-600">
          <span>商品數量</span>
          <span>{count} 件</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-gray-800 border-t border-gray-100 pt-3">
          <span>合計</span>
          <span className="text-purple-700">NT$ {total.toLocaleString('zh-TW')}</span>
        </div>
        <Link
          href="/checkout"
          className="block text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
        >
          前往結帳
        </Link>
        <Link
          href="/products"
          className="block text-center text-sm text-purple-500 hover:underline"
        >
          繼續購物
        </Link>
      </div>
    </div>
  )
}
