'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { addToCart, getCart } from '@/lib/cart'
import { fetchProduct } from '@/lib/api'
import type { Product } from '@/lib/api'
import CartSummary from '@/components/CartSummary'
import type { CartItem } from '@/lib/cart'

export default function ProductDetailClient() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setCartItems(getCart())
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchProduct(id)
        if (res.error) {
          setError(res.error.message)
        } else {
          setProduct(res.data)
        }
      } catch {
        setError('載入商品失敗，請稍後再試')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  function handleAddToCart() {
    if (!product) return
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
    })
    setCartItems(getCart())
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-purple-400 text-lg">載入中...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-gray-500">{error ?? '商品不存在'}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-purple-600 hover:underline"
        >
          返回上一頁
        </button>
      </div>
    )
  }

  const inStock = (product.inventory?.quantity ?? 0) > 0
  const isActive = product.status === 'active'

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-purple-600">首頁</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-purple-600">所有商品</Link>
        <span>/</span>
        <span className="text-gray-600 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 商品圖片區 */}
        <div className="bg-purple-50 rounded-2xl aspect-square flex items-center justify-center">
          <span className="text-8xl">🛍️</span>
        </div>

        {/* 商品資訊區 */}
        <div className="space-y-4">
          {product.category && (
            <span className="inline-block bg-purple-100 text-purple-600 text-xs px-3 py-1 rounded-full">
              {product.category.name}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-3xl font-bold text-purple-700">
            NT$ {product.price.toLocaleString('zh-TW')}
          </p>

          {product.inventory && (
            <p className="text-sm text-gray-500">
              庫存：
              <span className={inStock ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                {inStock ? `${product.inventory.quantity} 件` : '已售完'}
              </span>
            </p>
          )}

          {product.description && (
            <div className="border-t border-gray-100 pt-4">
              <h2 className="text-sm font-semibold text-gray-600 mb-2">商品說明</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!isActive || !inStock}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors mt-4"
          >
            {!isActive ? '已下架' : !inStock ? '已售完' : added ? '已加入購物車 ✓' : '加入購物車'}
          </button>

          <Link
            href="/cart"
            className="block text-center text-sm text-purple-600 hover:underline"
          >
            查看購物車
          </Link>
        </div>
      </div>

      <CartSummary items={cartItems} />
    </div>
  )
}
