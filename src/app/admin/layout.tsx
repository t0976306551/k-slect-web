import Link from 'next/link'
import { ReactNode } from 'react'

const navItems = [
  { href: '/admin/customers', label: '會員管理' },
  { href: '/admin/orders', label: '訂單管理' },
  { href: '/admin/products', label: '商品管理' },
  { href: '/admin/categories', label: '分類管理' },
  { href: '/admin/promotions', label: '推廣管理' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-48 shrink-0 bg-gray-900 text-white flex flex-col">
        <div className="px-4 py-5 text-lg font-bold border-b border-gray-700">
          K-Select 後台
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-gray-700">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-300">
            ← 前台首頁
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>
    </div>
  )
}
