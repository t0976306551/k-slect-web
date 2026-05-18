'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ShoppingBag } from 'lucide-react'
import { getCart, getCartCount } from '@/lib/cart'

export default function NavbarCartBadge() {
  const [cartCount, setCartCount] = useState(0)
  const [popping, setPopping] = useState(false)
  const prevCountRef = useRef(0)
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    function updateCount() {
      const next = getCartCount(getCart())
      setCartCount(next)
      if (next > prevCountRef.current) {
        clearTimeout(popTimerRef.current)
        setPopping(true)
        popTimerRef.current = setTimeout(() => setPopping(false), 500)
      }
      prevCountRef.current = next
    }
    updateCount()
    window.addEventListener('storage', updateCount)
    return () => {
      window.removeEventListener('storage', updateCount)
      clearTimeout(popTimerRef.current)
    }
  }, [])

  return (
    <Link href="/cart" className="relative text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors" aria-label="購物車">
      <ShoppingBag size={20} />
      {cartCount > 0 && (
        <span
          key={cartCount}
          className="absolute -top-1.5 -right-1.5 bg-[#7C9070] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-jakarta font-semibold"
          style={popping ? { animation: 'badge-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both' } : undefined}
        >
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Link>
  )
}
