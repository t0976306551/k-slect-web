import Link from 'next/link'
import { Suspense } from 'react'
import NavbarCartBadge from './NavbarCartBadge'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-purple-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🇰🇷</span>
          <span className="font-bold text-xl text-purple-700">K-slect</span>
          <span className="text-xs text-gray-400 hidden sm:block">韓貨嚴選</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
          >
            所有商品
          </Link>
          <Suspense
            fallback={
              <Link
                href="/cart"
                className="relative flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                <span className="text-lg">🛒</span>
                <span className="hidden sm:block">購物車</span>
              </Link>
            }
          >
            <NavbarCartBadge />
          </Suspense>
        </div>
      </div>
    </nav>
  )
}
