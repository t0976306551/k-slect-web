'use client'

import Link from 'next/link'
import { addToCart } from '@/lib/cart'

interface ProductCardProps {
  id: string
  slug?: string | null
  name: string
  price: number
  inStock: boolean
  categoryName?: string
  onAddToCart?: () => void
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  inStock,
  categoryName,
  onAddToCart,
}: ProductCardProps) {
  const href = `/products/${slug ?? id}`

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    addToCart({ productId: id, productName: name, price })
    onAddToCart?.()
  }

  return (
    <div className="bg-white rounded-[16px] overflow-hidden hover:shadow-md transition-shadow">
      <Link href={href}>
        <div className="bg-[#F0EFEC] h-[200px] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#E8E5E0]" />
        </div>
        <div className="p-4 flex flex-col gap-2">
          {categoryName && (
            <p className="font-jakarta text-[11px] text-[#8E8E93]">{categoryName}</p>
          )}
          <h3 className="font-jakarta font-semibold text-[14px] text-[#2D2D2D] leading-tight line-clamp-2">
            {name}
          </h3>
          <p className="font-jakarta text-[16px] font-semibold text-[#7C9070]">
            NT$ {price.toLocaleString('zh-TW')}
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#E0DDD8] disabled:text-[#8E8E93] text-white text-[14px] font-semibold font-jakarta py-2.5 rounded-[10px] transition-colors"
        >
          {inStock ? '加入購物車' : '已售完'}
        </button>
      </div>
    </div>
  )
}
