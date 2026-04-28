'use client'

import { PackageX } from 'lucide-react'

interface ErrorStateProps {
  readonly message: string | null
  readonly onBack: () => void
}

export default function ErrorState({
  message,
  onBack,
}: ErrorStateProps): React.ReactElement {
  return (
    <div className="text-center py-32 flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-full bg-[#F0EFEC] flex items-center justify-center mb-2">
        <PackageX size={24} className="text-[#AEAAA4]" />
      </div>
      <p className="font-jakarta text-[15px] font-semibold text-[#2D2D2D]">
        {message ?? '找不到此商品'}
      </p>
      <p className="font-jakarta text-[13px] text-[#AEAAA4]">商品可能已下架或不存在</p>
      <button
        onClick={onBack}
        className="mt-2 font-jakarta text-[13px] font-semibold text-[#7C9070] border border-[#7C9070] px-5 py-2 rounded-full hover:bg-[#7C9070] hover:text-white transition-colors"
      >
        返回上一頁
      </button>
    </div>
  )
}
