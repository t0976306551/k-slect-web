'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingBag } from 'lucide-react'
import { getCart, getCartCount } from '@/lib/cart'

export default function NavbarCartBadge() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    function updateCount() {
      setCartCount(getCartCount(getCart()))
    }
    updateCount()
    window.addEventListener('storage', updateCount)
    return () => window.removeEventListener('storage', updateCount)
  }, [])

  return (
    <Link href="/cart" className="relative text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors" aria-label="購物車">
      <ShoppingBag size={20} />
      {cartCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-[#7C9070] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-jakarta font-semibold">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Link>
  )
}
