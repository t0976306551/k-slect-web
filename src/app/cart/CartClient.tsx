'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react'
import { getCart, updateQuantity, removeFromCart, getCartTotal, getCartCount } from '@/lib/cart'
import type { CartItem } from '@/lib/cart'
import LineIcon from '@/components/LineIcon'
import { buildLineContactUrl } from '@/lib/line'

const REMOVE_ANIMATION_DURATION_MS = 250

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([])
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  const removeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    setItems(getCart())
  }, [])

  useEffect(() => {
    const timers = removeTimers.current
    return () => {
      timers.forEach(clearTimeout)
      timers.clear()
    }
  }, [])

  function handleQuantityChange(productId: string, quantity: number, variantId?: string) {
    setItems(updateQuantity(productId, quantity, variantId))
  }

  function handleRemove(productId: string, variantId?: string) {
    const key = `${productId}::${variantId ?? ''}`
    setRemovingIds(prev => new Set([...prev, key]))
    const existing = removeTimers.current.get(key)
    if (existing) clearTimeout(existing)
    const timer = setTimeout(() => {
      setItems(removeFromCart(productId, variantId))
      setRemovingIds(prev => { const n = new Set(prev); n.delete(key); return n })
      removeTimers.current.delete(key)
    }, REMOVE_ANIMATION_DURATION_MS)
    removeTimers.current.set(key, timer)
  }

  const total = getCartTotal(items)
  const count = getCartCount(items)

  // ── Empty state ──
  if (items.length === 0) {
    return (
      <div className="bg-[#F7F6F3] min-h-screen">
        <div className="bg-white border-b border-[#F0EFEC]">
          <div className="max-w-[1100px] mx-auto px-4 md:px-12 py-5 md:py-7">
            <h1 className="font-fraunces text-[22px] md:text-[28px] font-medium text-[#2D2D2D] tracking-tight">
              購物車
            </h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-28 gap-4 px-4">
          <div style={{ animation: 'fade-up 0.5s cubic-bezier(0.25,1,0.5,1) both' }} className="w-16 h-16 rounded-full bg-[#F0EFEC] flex items-center justify-center mb-2">
            <Package size={26} className="text-[#AEAAA4]" />
          </div>
          <p style={{ animation: 'fade-up 0.5s cubic-bezier(0.25,1,0.5,1) 80ms both' }} className="font-jakarta text-[16px] font-semibold text-[#2D2D2D]">購物車是空的</p>
          <p style={{ animation: 'fade-up 0.5s cubic-bezier(0.25,1,0.5,1) 140ms both' }} className="font-jakarta text-[13px] text-[#AEAAA4]">快去挑選你喜歡的韓貨吧！</p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-2 font-jakarta font-semibold text-[14px] bg-[#7C9070] hover:bg-[#6a7d5f] active:scale-[0.98] text-white px-7 py-3 rounded-[10px] transition-all duration-200"
          >
            探索商品 <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    )
  }

  // ── Cart with items ──
  return (
    <div className="bg-[#F7F6F3] min-h-screen">

      {/* Page header */}
      <div className="bg-white border-b border-[#F0EFEC]">
        <div className="max-w-[1100px] mx-auto px-4 md:px-12 py-5 md:py-7">
          <h1 className="font-fraunces text-[22px] md:text-[28px] font-medium text-[#2D2D2D] tracking-tight">
            購物車
          </h1>
          <p className="font-jakarta text-[12px] text-[#AEAAA4] mt-0.5">{count} 件商品</p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-3 md:px-12 py-5 md:py-8">
        {/* Desktop: 2-col grid; Mobile: single col with summary at bottom */}
        <div className="md:grid md:grid-cols-[1fr_340px] md:gap-8 md:items-start">

          {/* Cart items */}
          <div className="space-y-2.5 md:space-y-3">
            {items.map((item, i) => {
              const key = `${item.productId}::${item.variantId ?? ''}`
              const isRemoving = removingIds.has(key)
              return (
              <div
                key={key}
                style={{
                  animation: 'fade-up 0.35s cubic-bezier(0.25,1,0.5,1) both',
                  animationDelay: `${i * 50}ms`,
                  transition: `opacity ${REMOVE_ANIMATION_DURATION_MS}ms ease, transform ${REMOVE_ANIMATION_DURATION_MS}ms ease`,
                }}
                className={`bg-white rounded-[14px] md:rounded-[16px] border border-[#F0EFEC] hover:border-[#E0DDD8] p-3.5 md:p-5 flex items-center gap-3.5 md:gap-4 ${isRemoving ? 'opacity-0 translate-x-3 scale-[0.98]' : ''}`}
              >
                {/* Thumbnail */}
                <Link
                  href={`/products/${item.slug ?? item.productId}`}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-[10px] md:rounded-[12px] bg-[#F7F6F3] flex-shrink-0 overflow-hidden"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={22} className="text-[#D8D5D0]" />
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <Link href={`/products/${item.slug ?? item.productId}`}>
                    <p className="font-jakarta font-semibold text-[13px] md:text-[14px] text-[#2D2D2D] line-clamp-2 leading-snug hover:text-[#7C9070] transition-colors">
                      {item.productName}
                    </p>
                  </Link>
                  {item.variantLabel && (
                    <p className="font-jakarta text-[11px] text-[#AEAAA4]">{item.variantLabel}</p>
                  )}
                  <p className="font-jakarta text-[13px] md:text-[14px] font-semibold text-[#7C9070] tabular-nums mt-1">
                    NT$ {item.price.toLocaleString('zh-TW')}
                  </p>
                </div>

                {/* Qty stepper + subtotal + remove */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {/* Subtotal */}
                  <p className="font-jakarta text-[13px] md:text-[14px] font-semibold text-[#2D2D2D] tabular-nums">
                    NT$ {(item.price * item.quantity).toLocaleString('zh-TW')}
                  </p>
                  {/* Stepper */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1, item.variantId)}
                      className="w-7 h-7 rounded-full border border-[#ECEAE6] flex items-center justify-center text-[#2D2D2D] hover:border-[#7C9070] hover:text-[#7C9070] active:scale-90 transition-all text-[16px] leading-none"
                      aria-label="減少數量"
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-jakarta text-[13px] font-semibold text-[#2D2D2D] tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.variantId)}
                      className="w-7 h-7 rounded-full border border-[#ECEAE6] flex items-center justify-center text-[#2D2D2D] hover:border-[#7C9070] hover:text-[#7C9070] active:scale-90 transition-all text-[16px] leading-none"
                      aria-label="增加數量"
                    >
                      +
                    </button>
                  </div>
                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.productId, item.variantId)}
                    className="text-[#D8D5D0] hover:text-[#D4845E] active:scale-90 transition-all p-0.5"
                    aria-label="移除商品"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              )
            })}

            {/* Continue shopping */}
            <div className="pt-1 md:pt-2">
              <Link
                href="/"
              >
                ← 繼續購物
              </Link>
            </div>
          </div>

          {/* Order summary — sticky on desktop, inline on mobile */}
          <div className="mt-4 md:mt-0 md:sticky md:top-[72px]">
            <div className="bg-white rounded-[16px] md:rounded-[18px] border border-[#F0EFEC] p-5 md:p-6 flex flex-col gap-3.5">
              <h2 className="font-fraunces text-[17px] md:text-[19px] font-medium text-[#2D2D2D] tracking-tight">
                訂單摘要
              </h2>

              {/* Line items */}
              <div className="flex flex-col gap-2.5 border-t border-[#F0EFEC] pt-3">
                {items.map((item) => (
                  <div key={`summary-${item.productId}::${item.variantId ?? ''}`} className="flex items-start justify-between gap-3">
                    <p className="font-jakarta text-[12px] text-[#6B6B6B] leading-snug line-clamp-2 flex-1">
                      {item.productName}
                      {item.variantLabel && <span className="text-[#AEAAA4]">（{item.variantLabel}）</span>}
                      {item.quantity > 1 && <span className="text-[#AEAAA4]"> ×{item.quantity}</span>}
                    </p>
                    <p className="font-jakarta text-[12px] text-[#6B6B6B] tabular-nums flex-shrink-0">
                      {(item.price * item.quantity).toLocaleString('zh-TW')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-[#F0EFEC] pt-3">
                <span className="font-jakarta text-[14px] font-semibold text-[#2D2D2D]">合計</span>
                <span className="font-jakarta text-[20px] font-semibold text-[#2D2D2D] tabular-nums">
                  NT$ {total.toLocaleString('zh-TW')}
                </span>
              </div>

              <a
                href={buildLineContactUrl(items)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b34c] active:scale-[0.98] text-white font-jakarta font-semibold text-[15px] py-3.5 rounded-[11px] transition-all duration-200"
              >
                <LineIcon size={16} />
                透過 LINE 聯絡下單
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
