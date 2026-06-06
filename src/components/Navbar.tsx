'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import NavbarCartBadge from './NavbarCartBadge'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="bg-white sticky top-0 z-40 transition-shadow duration-300"
      style={{ boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : '0 2px 20px rgba(0,0,0,0.03)' }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 h-14 md:h-16 flex items-center justify-between">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-fraunces text-2xl font-semibold text-[#7C9070] tracking-tight transition-opacity hover:opacity-75"
          >
            韓好物
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/#products"
              className="font-jakarta text-[14px] text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors duration-200 relative group"
            >
              所有商品
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#7C9070] transition-all duration-300 group-hover:w-full" />
            </Link>
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          <Suspense fallback={
            <Link href="/cart" className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors" aria-label="購物車">
              <ShoppingBag size={20} />
            </Link>
          }>
            <NavbarCartBadge />
          </Suspense>
        </div>
      </div>
    </nav>
  )
}
