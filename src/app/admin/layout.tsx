export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'K-slect 後台管理',
  description: 'K-slect 韓貨電商後台管理系統',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <span className="font-bold text-gray-800 text-lg">K-slect 後台</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/admin/products" className="text-gray-600 hover:text-purple-600 transition-colors">
              商品管理
            </Link>
            <Link href="/admin/promotions" className="text-gray-600 hover:text-purple-600 transition-colors">
              推廣紀錄
            </Link>
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors text-xs">
              回前台
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
