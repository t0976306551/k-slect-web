import Link from 'next/link'
import { Suspense } from 'react'
import { Search, ShoppingBag, User } from 'lucide-react'
import NavbarCartBadge from './NavbarCartBadge'

export default function Navbar() {
  return (
    <nav className="bg-white sticky top-0 z-40" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.03)' }}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 h-14 md:h-16 flex items-center justify-between">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-fraunces text-2xl font-semibold text-[#7C9070] tracking-tight">
            韓好物
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-[13px] font-medium text-[#2D2D2D] font-jakarta hover:text-[#7C9070] transition-colors">
              全部商品
            </Link>
            <Link href="/categories" className="text-[13px] font-medium text-[#6B6B6B] font-jakarta hover:text-[#7C9070] transition-colors">
              分類
            </Link>
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          <button className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors" aria-label="搜尋">
            <Search size={20} />
          </button>
          <Suspense fallback={
            <Link href="/cart" className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors" aria-label="購物車">
              <ShoppingBag size={20} />
            </Link>
          }>
            <NavbarCartBadge />
          </Suspense>
          <Link href="/account" className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors" aria-label="會員">
            <User size={20} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
