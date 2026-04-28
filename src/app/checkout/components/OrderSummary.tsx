'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { CartItem } from '@/lib/cart'

interface OrderSummaryProps {
  readonly items: readonly CartItem[]
  readonly total: number
}

export default function OrderSummary({ items, total }: OrderSummaryProps) {
  return (
    <div className="mt-4 md:mt-0 md:sticky md:top-[80px]">
      <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5">
        <h2 className="font-fraunces font-medium text-[17px] text-[#2D2D2D] mb-4">訂單摘要</h2>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={`${item.productId}::${item.variantId ?? ''}`}
              className="flex justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <span className="line-clamp-1 text-[13px] text-[#2D2D2D]">
                  {item.productName}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {item.variantLabel && (
                    <>
                      <span className="text-[11px] text-[#9E9E9E]">{item.variantLabel}</span>
                      <span className="text-[11px] text-[#C8C8C8]">·</span>
                    </>
                  )}
                  <span className="text-[11px] text-[#9E9E9E]">×{item.quantity}</span>
                </div>
              </div>
              <span className="text-[13px] font-medium text-[#2D2D2D] shrink-0 tabular-nums">
                NT$ {(item.price * item.quantity).toLocaleString('zh-TW')}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-[#F0EFEC] mt-4 pt-4 space-y-2.5">
          <div className="flex justify-between text-[13px]">
            <span className="text-[#9E9E9E]">小計</span>
            <span className="text-[#2D2D2D] tabular-nums">
              NT$ {total.toLocaleString('zh-TW')}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#9E9E9E]">運費</span>
            <span className="text-[#9E9E9E]">於結帳時確認</span>
          </div>
          <div className="flex justify-between font-jakarta font-bold text-[15px] pt-2.5 border-t border-[#F0EFEC]">
            <span className="text-[#2D2D2D]">合計</span>
            <span className="text-[#7C9070] tabular-nums">
              NT$ {total.toLocaleString('zh-TW')}
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/cart"
        className="flex items-center justify-center gap-1 mt-3 text-[13px] text-[#9E9E9E] hover:text-[#7C9070] transition-colors"
      >
        <ChevronRight size={13} className="rotate-180" />
        修改購物車
      </Link>
    </div>
  )
}
