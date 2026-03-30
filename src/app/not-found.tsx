import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '找不到頁面',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="text-center py-24 px-4">
      <div className="text-6xl mb-4">😕</div>
      <h2 className="font-jakarta text-[20px] md:text-[24px] font-bold text-[#2D2D2D] mb-2">找不到頁面</h2>
      <p className="font-jakarta text-[14px] text-[#8E8E93] mb-6">您所尋找的頁面不存在或已移除</p>
      <Link
        href="/"
        className="inline-block font-jakarta font-semibold text-[14px] bg-[#7C9070] hover:bg-[#6a7d5f] text-white px-8 py-3 rounded-[10px] transition-colors"
      >
        回到首頁
      </Link>
    </div>
  )
}

