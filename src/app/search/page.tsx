'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, ShoppingBag } from 'lucide-react'
import { addToCart } from '@/lib/cart'
import { fetchProducts } from '@/lib/api'
import type { ProductWithMeta } from '@/lib/api'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<ProductWithMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setProducts([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetchProducts({ q, status: 'active' })
      setProducts((res.data ?? []) as ProductWithMeta[])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-4 md:py-8">
      {/* Search input */}
      <div className="relative mb-5 md:max-w-[480px]">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9E9E]" />
        <input
          type="text"
          autoFocus
          placeholder="搜尋商品名稱..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-white border border-[#E8E8E8] rounded-[10px] text-[14px] text-[#2D2D2D] placeholder:text-[#C8C8C8] focus:outline-none focus:border-[#7C9070] transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E9E9E] hover:text-[#6B6B6B]"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 rounded-full border-2 border-[#7C9070] border-t-transparent animate-spin" />
        </div>
      )}

      {/* No results */}
      {!loading && searched && products.length === 0 && (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto mb-3 text-[#8E8E93]" />
          <p className="font-jakarta text-[14px] text-[#8E8E93]">找不到「{query}」相關商品</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !searched && (
        <div className="text-center py-16">
          <ShoppingBag size={48} className="mx-auto mb-3 text-[#8E8E93]" />
          <p className="font-jakarta text-[14px] text-[#8E8E93]">輸入關鍵字搜尋商品</p>
        </div>
      )}

      {/* Results */}
      {!loading && products.length > 0 && (
        <>
          <p className="font-jakarta text-[12px] text-[#9E9E9E] mb-3">共 {products.length} 件商品</p>
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
                    <div className="p-3 flex flex-col gap-1">
                      <h3 className="font-jakarta font-semibold text-[13px] text-[#2D2D2D] leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="font-jakarta text-[14px] font-semibold text-[#7C9070]">
                        NT$ {product.price.toLocaleString('zh-TW')}
                      </p>
                    </div>
                  </Link>
                  <div className="px-3 pb-3 mt-auto">
                    <button
                      onClick={() => addToCart({ productId: product.id, productName: product.name, price: product.price, slug: product.slug ?? undefined })}
                      disabled={!inStock}
                      className="w-full bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#E0DDD8] disabled:text-[#8E8E93] text-white text-[13px] font-semibold py-2 rounded-[10px] transition-colors"
                    >
                      {inStock ? '加入購物車' : '已售完'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
