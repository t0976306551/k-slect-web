'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-[#F7F6F3] min-h-screen">
      <div className="max-w-[560px] mx-auto px-4 py-16 md:py-24 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#7C9070]/10 flex items-center justify-center">
          <CheckCircle size={36} className="text-[#7C9070]" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-fraunces text-[28px] md:text-[34px] font-medium text-[#2D2D2D] tracking-tight">
            訂單已成立
          </h1>
          <p className="font-jakarta text-[14px] text-[#6B6B6B] leading-relaxed">
            感謝您的購買！我們已收到您的訂單，<br />
            確認後將盡快為您安排出貨。
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[320px] mt-2">
          <Link
            href="/"
            className="flex items-center justify-center font-jakarta font-semibold text-[15px] bg-[#7C9070] hover:bg-[#6a7d5f] active:scale-[0.98] text-white py-3.5 rounded-[10px] transition-all duration-200"
          >
            繼續購物
          </Link>
        </div>
      </div>
    </div>
  )
}
