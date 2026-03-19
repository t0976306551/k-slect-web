'use client'

import { useState, useEffect, useCallback } from 'react'
import ProductCard from '@/components/ProductCard'
import CartSummary from '@/components/CartSummary'
import { getCart } from '@/lib/cart'
import { fetchProducts } from '@/lib/api'
import type { Product } from '@/lib/api'
import type { CartItem } from '@/lib/cart'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchProducts({ q: search || undefined, status: 'active' })
      if (res.error) {
        setError(res.error.message)
      } else {
        setProducts(res.data ?? [])
      }
    } catch {
      setError('載入商品失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    setCartItems(getCart())
  }, [])

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300)
    return () => clearTimeout(timer)
  }, [loadProducts])

  function handleAddToCart() {
    setCartItems(getCart())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">所有商品</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="搜尋商品..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-purple-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-full sm:w-64"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-purple-400 text-lg">載入中...</div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadProducts}
            className="mt-3 text-sm text-purple-600 hover:underline"
          >
            重新載入
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-24 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p>找不到符合的商品</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      <CartSummary items={cartItems} />
    </div>
  )
}
