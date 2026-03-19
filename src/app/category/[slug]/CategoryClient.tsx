'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface CategoryProduct {
  id: string
  name: string
  slug: string | null
  price: number
  status: string
  inventory: { quantity: number } | null
}

interface CategoryData {
  id: string
  name: string
  slug: string
  products: CategoryProduct[]
}

export default function CategoryClient() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? ''
  const [category, setCategory] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/v1/categories/${slug}`)
        const json = await res.json() as { data: CategoryData | null; error: { message: string } | null }
        if (json.error) {
          setError(json.error.message)
        } else {
          setCategory(json.data)
        }
      } catch {
        setError('載入分類失敗，請稍後再試')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-purple-400 text-lg">載入中...</div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-gray-500">{error ?? '分類不存在'}</p>
        <Link href="/products" className="mt-4 inline-block text-sm text-purple-600 hover:underline">
          瀏覽所有商品
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-purple-600">首頁</Link>
        <span>/</span>
        <span className="text-gray-600">{category.name}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-gray-800">{category.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{category.products.length} 件商品</p>
      </div>

      {category.products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">此分類目前無商品</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {category.products.map((product) => {
            const inStock = (product.inventory?.quantity ?? 0) > 0
            const isActive = product.status === 'active'
            const href = `/products/${product.slug ?? product.id}`
            return (
              <Link
                key={product.id}
                href={href}
                className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden hover:shadow-md transition-shadow block"
              >
                <div className="bg-purple-50 h-40 flex items-center justify-center">
                  <span className="text-5xl">🛍️</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-purple-700 mt-2">
                    NT$ {product.price.toLocaleString('zh-TW')}
                  </p>
                  <p className={`text-xs mt-1 ${inStock && isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {!isActive ? '已下架' : inStock ? `庫存 ${product.inventory!.quantity} 件` : '已售完'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
