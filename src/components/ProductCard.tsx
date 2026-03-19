'use client'

import { addToCart } from '@/lib/cart'
import type { Product } from '@/lib/api'

interface ProductCardProps {
  product: Product
  onAddToCart?: () => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  function handleAddToCart() {
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
    })
    onAddToCart?.()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-purple-50 h-48 flex items-center justify-center">
        <span className="text-5xl">🛍️</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        {product.category && (
          <p className="text-xs text-purple-400 mt-1">{product.category.name}</p>
        )}
        <p className="text-lg font-bold text-purple-700 mt-2">
          NT$ {product.price.toLocaleString('zh-TW')}
        </p>
        {product.inventory && (
          <p className="text-xs text-gray-400 mt-1">
            庫存 {product.inventory.quantity} 件
          </p>
        )}
        <button
          onClick={handleAddToCart}
          disabled={product.status !== 'active' || (product.inventory?.quantity ?? 0) === 0}
          className="mt-3 w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {product.status !== 'active'
            ? '已下架'
            : (product.inventory?.quantity ?? 0) === 0
            ? '已售完'
            : '加入購物車'}
        </button>
      </div>
    </div>
  )
}
