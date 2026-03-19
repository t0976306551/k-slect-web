'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchProducts } from '@/lib/api'
import type { Product } from '@/lib/api'
import LineShareModal from '@/components/LineShareModal'

export default function AdminProductsClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())
  const [showLineModal, setShowLineModal] = useState(false)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchProducts({ q: search || undefined })
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
    const timer = setTimeout(loadProducts, 300)
    return () => clearTimeout(timer)
  }, [loadProducts])

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)))
    }
  }

  const selectedProducts = products.filter((p) => selectedIds.has(p.id))

  function handlePromoteToLine() {
    if (selectedProducts.length === 0) return
    setShowLineModal(true)
  }

  const allSelected = products.length > 0 && selectedIds.size === products.length
  const someSelected = selectedIds.size > 0

  return (
    <div className="space-y-6">
      {/* 頁首 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">商品管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">選取商品後可一鍵推廣到 LINE 群組</p>
        </div>
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

      {/* 推廣操作列 */}
      {someSelected && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-sm text-purple-700 font-medium">
            已選取 {selectedIds.size} 件商品
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePromoteToLine}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <span>💬</span>
              <span>推廣到 LINE 群組</span>
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 transition-colors"
            >
              取消選取
            </button>
          </div>
        </div>
      )}

      {/* 載入中 */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-purple-400 text-lg">載入中...</div>
        </div>
      )}

      {/* 錯誤 */}
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

      {/* 空狀態 */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-24 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p>沒有找到商品</p>
        </div>
      )}

      {/* 商品表格 */}
      {!loading && !error && products.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-300 cursor-pointer"
                    aria-label="全選"
                  />
                </th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">商品名稱</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium hidden sm:table-cell">類別</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">售價</th>
                <th className="px-4 py-3 text-center text-gray-600 font-medium hidden md:table-cell">庫存</th>
                <th className="px-4 py-3 text-center text-gray-600 font-medium">狀態</th>
                <th className="px-4 py-3 text-center text-gray-600 font-medium">推廣</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const isSelected = selectedIds.has(product.id)
                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-purple-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(product.id)}
                        className="rounded border-gray-300 text-purple-500 focus:ring-purple-300 cursor-pointer"
                        aria-label={`選取 ${product.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800 line-clamp-1">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {product.category?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-purple-700">
                      NT$ {product.price.toLocaleString('zh-TW')}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 hidden md:table-cell">
                      {product.inventory?.quantity ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {product.status === 'active' ? '上架' : '下架'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedIds(new Set([product.id]))
                          setShowLineModal(true)
                        }}
                        className="text-green-600 hover:text-green-800 text-xs font-medium hover:underline transition-colors"
                        title="推廣到 LINE"
                      >
                        💬 LINE
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* LINE 分享 Modal */}
      {showLineModal && selectedProducts.length > 0 && (
        <LineShareModal
          products={selectedProducts}
          onClose={() => {
            setShowLineModal(false)
            setSelectedIds(new Set())
          }}
        />
      )}
    </div>
  )
}
