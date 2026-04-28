'use client'

import { ChevronLeft } from 'lucide-react'

interface MobileBackBarProps {
  readonly onBack: () => void
}

export default function MobileBackBar({
  onBack,
}: MobileBackBarProps): React.ReactElement {
  return (
    <div className="md:hidden flex items-center px-3 py-2.5 bg-white border-b border-[#F0EFEC]">
      <button
        onClick={onBack}
        className="flex items-center gap-0.5 text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors p-1 -ml-1"
        aria-label="返回"
      >
        <ChevronLeft size={20} strokeWidth={1.75} />
        <span className="font-jakarta text-[14px]">返回</span>
      </button>
    </div>
  )
}
