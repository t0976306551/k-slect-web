'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import LineIcon from '@/components/LineIcon'

interface SuccessClientProps {
  orderId: string
  total: number
}

export default function SuccessClient({ orderId, total }: SuccessClientProps) {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#F7F6F3]">
      <div className="w-full max-w-[440px] mx-auto px-5 py-10 md:py-16">

        {/* Animated check icon */}
        <div className="flex justify-center mb-8">
          <div className="relative flex items-center justify-center">
            {/* Pulse ring — animates outward after icon appears */}
            <div
              className="absolute rounded-full bg-[#7C9070]/20"
              style={{
                width: 84, height: 84,
                animation: 'ring-pulse 1s ease-out 0.55s both',
              }}
            />
            {/* Circle */}
            <div
              className="w-[84px] h-[84px] rounded-full bg-[#7C9070] flex items-center justify-center"
              style={{ animation: 'scale-in-spring 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both' }}
            >
              {/* Animated checkmark path */}
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                <path
                  d="M10 20 L16 26 L28 12"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="32"
                  strokeDashoffset="32"
                  style={{ animation: 'draw-check 0.35s ease forwards 0.35s' }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          className="text-center mb-8"
          style={{ animation: 'fade-up 0.5s ease both 0.15s' }}
        >
          <h1 className="font-fraunces font-medium text-[30px] md:text-[36px] text-[#2D2D2D] leading-tight mb-2">
            訂單已成立
          </h1>
          <p className="text-[14px] text-[#9E9E9E]">
            感謝您的購買，我們將盡快為您備貨
          </p>
        </div>

        {/* Order details card */}
        <div
          className="bg-white rounded-[18px] border border-[#F0EFEC] overflow-hidden mb-4"
          style={{ animation: 'fade-up 0.5s ease both 0.3s' }}
        >
          <div className="px-5 py-3.5 border-b border-[#F7F6F3]">
            <span className="text-[11px] font-medium tracking-[0.05em] uppercase text-[#9E9E9E]">
              訂單詳情
            </span>
          </div>
          <div className="divide-y divide-[#F7F6F3]">
            <div className="flex justify-between items-center px-5 py-3.5">
              <span className="text-[13px] text-[#9E9E9E]">訂單編號</span>
              <span className="text-[13px] font-medium text-[#2D2D2D] font-mono tracking-wide">
                {orderId}
              </span>
            </div>
            <div className="flex justify-between items-center px-5 py-3.5">
              <span className="text-[13px] text-[#9E9E9E]">預計送達</span>
              <span className="text-[13px] font-medium text-[#2D2D2D]">3–5 個工作天</span>
            </div>
            <div className="flex justify-between items-center px-5 py-3.5">
              <span className="text-[13px] text-[#9E9E9E]">付款金額</span>
              <span className="text-[14px] font-bold text-[#7C9070] tabular-nums">
                {total > 0 ? `NT$ ${total.toLocaleString('zh-TW')}` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* LINE reminder */}
        <div
          className="flex gap-3 bg-white border border-[#F0EFEC] rounded-[14px] p-4 mb-6"
          style={{ animation: 'fade-up 0.5s ease both 0.45s' }}
        >
          <LineIcon className="text-[#06C755] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#6B6B6B] leading-relaxed">
            加入我們的 LINE 好友，隨時掌握訂單最新狀態及獨家優惠！
          </p>
        </div>

        {/* Action buttons */}
        <div
          className="flex flex-col gap-3"
          style={{ animation: 'fade-up 0.5s ease both 0.55s' }}
        >
          <Link
            href="/orders"
            className="w-full flex items-center justify-center gap-2 bg-[#7C9070] hover:bg-[#6a7d5f] text-white font-jakarta font-semibold text-[15px] py-4 rounded-[12px] transition-colors"
          >
            查看訂單詳情
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/products"
            className="w-full flex items-center justify-center border border-[#E8E8E8] bg-white text-[#6B6B6B] font-jakarta font-medium text-[15px] py-4 rounded-[12px] hover:border-[#C8C8C8] transition-colors"
          >
            繼續購物
          </Link>
        </div>

      </div>
    </div>
  )
}
