'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingBag } from 'lucide-react'
import { addToCart } from '@/lib/cart'
import { fetchProducts } from '@/lib/api'
import type { ProductWithMeta } from '@/lib/api'

export default function ProductsClient() {
  const [products, setProducts] = useState<ProductWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchProducts({ q: search || undefined, status: 'active' })
      if (res.error) {
        setError(res.error.message)
      } else {
        setProducts((res.data ?? []) as ProductWithMeta[])
      }
    } catch {
      setError('載入商品失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300)
    return () => clearTimeout(timer)
  }, [loadProducts])

  return (
    <div className="max-w-[1440px] mx-auto px-3 md:px-12 py-4 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 md:mb-6 px-1 md:px-0">
        <h1 className="font-jakarta text-[18px] md:text-[24px] font-bold text-[#2D2D2D]">所有商品</h1>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
          <input
            type="text"
            placeholder="搜尋商品..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-[#F0EFEC] bg-white rounded-full text-[13px] text-[#2D2D2D] placeholder:text-[#C0C0C0] focus:outline-none focus:border-[#7C9070] transition-colors w-full sm:w-56"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-7 h-7 rounded-full border-2 border-[#7C9070] border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-[14px] p-6 text-center">
          <p className="text-red-500 text-[14px]">{error}</p>
          <button onClick={loadProducts} className="mt-3 text-[13px] text-[#7C9070] hover:underline">
            重新載入
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-24 text-[#8E8E93]">
          <Search size={48} className="mx-auto mb-4 text-[#8E8E93]" />
          <p className="text-[14px]">找不到符合的商品</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-5">
          {products.map((product) => {
            const href = `/products/${product.slug ?? product.id}`
            const inStock = product.status === 'active' && (product.inventory?.quantity ?? 0) > 0
            return (
              <div key={product.id} className="bg-white rounded-[14px] md:rounded-[16px] border border-[#F0EFEC] overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <Link href={href}>
                  <div className="w-full h-[140px] md:h-[200px] overflow-hidden bg-[#F0EFEC]">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={40} className="text-[#C8C8C8]" /></div>
                    )}
                  </div>
                  <div className="p-3 md:p-4 flex flex-col gap-1 md:gap-2">
                    {product.category && (
                      <p className="font-jakarta text-[11px] text-[#8E8E93]">{product.category.name}</p>
                    )}
                    <h3 className="font-jakarta font-semibold text-[13px] md:text-[14px] text-[#2D2D2D] leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="font-jakarta text-[14px] md:text-[16px] font-semibold text-[#7C9070]">
                      NT$ {product.price.toLocaleString('zh-TW')}
                    </p>
                  </div>
                </Link>
                <div className="px-3 md:px-4 pb-3 md:pb-4 mt-auto">
                  <button
                    onClick={() => addToCart({ productId: product.id, productName: product.name, price: product.price, slug: product.slug ?? undefined })}
                    disabled={!inStock}
                    className="w-full bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#E0DDD8] disabled:text-[#8E8E93] text-white text-[13px] md:text-[14px] font-semibold font-jakarta py-2 md:py-2.5 rounded-[10px] transition-colors"
                  >
                    {inStock ? '加入購物車' : '已售完'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

