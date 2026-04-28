'use client'

import { Landmark } from 'lucide-react'

export default function PaymentMethodSection() {
  return (
    <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6">
      <h2 className="font-fraunces font-medium text-[17px] text-[#2D2D2D] mb-4">付款方式</h2>
      <div className="flex items-center gap-3.5 rounded-[12px] p-4 border-2 border-[#7C9070] bg-[#7C9070]/5">
        <div className="w-9 h-9 rounded-full bg-[#F7F6F3] flex items-center justify-center shrink-0">
          <Landmark size={17} className="text-[#7C9070]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-jakarta font-medium text-[14px] text-[#2D2D2D]">
            銀行匯款 / ATM 轉帳
          </div>
          <div className="text-[12px] text-[#9E9E9E] mt-0.5">
            下單後將顯示匯款資訊，請於 24 小時內完成轉帳
          </div>
        </div>
        <div className="w-4 h-4 rounded-full border-2 border-[#7C9070] flex items-center justify-center shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#7C9070]" />
        </div>
      </div>
    </div>
  )
}
