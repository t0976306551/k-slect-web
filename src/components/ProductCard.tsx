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
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden hover:shadow-md transition-shadow">
      <Link href={href}>
        <div className="bg-purple-50 h-48 flex items-center justify-center">
          <span className="text-5xl">🛍️</span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
            {name}
          </h3>
          {categoryName && (
            <p className="text-xs text-purple-400 mt-1">{categoryName}</p>
          )}
          <p className="text-lg font-bold text-purple-700 mt-2">
            NT$ {price.toLocaleString('zh-TW')}
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {inStock ? '加入購物車' : '已售完'}
        </button>
      </div>
    </div>
  )
}
