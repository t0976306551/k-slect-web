'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { getCart, updateQuantity, removeFromCart, getCartTotal, getCartCount } from '@/lib/cart'
import type { CartItem } from '@/lib/cart'

export default function CartClient() {
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
      <div className="text-center py-24 px-4">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="font-jakarta text-[18px] font-semibold text-[#2D2D2D] mb-2">購物車是空的</h2>
        <p className="font-jakarta text-[13px] text-[#8E8E93] mb-6">快去挑選你喜歡的韓貨吧！</p>
        <Link
          href="/products"
          className="inline-block font-jakarta font-semibold text-[14px] bg-[#7C9070] hover:bg-[#6a7d5f] text-white px-8 py-3 rounded-[10px] transition-colors"
        >
          去逛逛
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-6 py-4 md:py-8">
      <h1 className="font-jakarta text-[18px] md:text-[22px] font-bold text-[#2D2D2D] mb-4 md:mb-6">購物車</h1>

      <div className="space-y-2.5 md:space-y-3 mb-5">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-[14px] border border-[#F0EFEC] p-3.5 md:p-4 flex items-center gap-3"
          >
            {/* Image */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[10px] bg-[#F0EFEC] flex-shrink-0 overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.productName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-jakarta font-medium text-[#2D2D2D] text-[13px] md:text-[14px] line-clamp-2 leading-tight">
                {item.productName}
              </p>
              <p className="font-jakarta text-[#7C9070] font-semibold text-[13px] md:text-[14px] mt-1">
                NT$ {item.price.toLocaleString('zh-TW')}
              </p>
            </div>

            {/* Qty controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                className="w-7 h-7 rounded-full border border-[#E8E8E8] flex items-center justify-center text-[#2D2D2D] hover:border-[#7C9070] transition-colors text-[16px] leading-none"
              >
                −
              </button>
              <span className="w-5 text-center text-[13px] font-semibold text-[#2D2D2D]">{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                className="w-7 h-7 rounded-full border border-[#E8E8E8] flex items-center justify-center text-[#2D2D2D] hover:border-[#7C9070] transition-colors text-[16px] leading-none"
              >
                +
              </button>
            </div>

            {/* Subtotal + remove */}
            <div className="flex-shrink-0 text-right flex flex-col items-end gap-1">
              <p className="font-jakarta font-bold text-[#2D2D2D] text-[13px]">
                NT$ {(item.price * item.quantity).toLocaleString('zh-TW')}
              </p>
              <button
                onClick={() => handleRemove(item.productId)}
                className="text-[#C0C0C0] hover:text-[#D4845E] transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 space-y-3">
        <h2 className="font-jakarta font-semibold text-[#2D2D2D] text-[15px]">訂單摘要</h2>
        <div className="flex justify-between text-[13px] text-[#6B6B6B]">
          <span>商品數量</span>
          <span>{count} 件</span>
        </div>
        <div className="flex justify-between font-jakarta font-bold text-[17px] text-[#2D2D2D] border-t border-[#F0EFEC] pt-3">
          <span>合計</span>
          <span className="text-[#7C9070]">NT$ {total.toLocaleString('zh-TW')}</span>
        </div>
        <Link
          href="/checkout"
          className="block text-center bg-[#7C9070] hover:bg-[#6a7d5f] text-white font-jakarta font-semibold text-[15px] py-3.5 rounded-[10px] transition-colors mt-1"
        >
          前往結帳
        </Link>
        <Link
          href="/products"
          className="block text-center text-[13px] text-[#7C9070] hover:underline"
        >
          繼續購物
        </Link>
      </div>
    </div>
  )
}

