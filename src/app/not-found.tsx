import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '找不到頁面',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">😕</div>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">找不到頁面</h2>
      <p className="text-gray-400 text-sm mb-6">您所尋找的頁面不存在或已移除</p>
      <Link
        href="/"
        className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
      >
        回到首頁
      </Link>
    </div>
  )
}
