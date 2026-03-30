'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inventoryId, setInventoryId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    status: 'active',
    sku: '',
    quantity: '0',
    lowStockThreshold: '5',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/categories').then((r) => r.json()),
      fetch(`/api/v1/products/${id}`).then((r) => r.json()),
    ]).then(([cats, product]) => {
      if (cats.data) setCategories(cats.data)
      if (product.data) {
        const p = product.data
        setForm({
          name: p.name,
          description: p.description ?? '',
          price: String(p.price),
          categoryId: p.categoryId,
          status: p.status,
          sku: p.inventory?.sku ?? '',
          quantity: String(p.inventory?.quantity ?? 0),
          lowStockThreshold: String(p.inventory?.lowStockThreshold ?? 5),
        })
        if (p.inventory?.id) setInventoryId(p.inventory.id)
      }
      setLoading(false)
    })
  }, [id])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // 更新商品基本資訊
      const productRes = await fetch(`/api/v1/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          price: parseInt(form.price),
          categoryId: form.categoryId,
          status: form.status,
        }),
      })
      const productJson = await productRes.json()
      if (productJson.error) {
        setError(productJson.error.message)
        return
      }

      // 更新庫存（若有 inventoryId）
      if (inventoryId && form.sku) {
        await fetch(`/api/v1/inventory/${inventoryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: form.sku,
            quantity: parseInt(form.quantity),
            lowStockThreshold: parseInt(form.lowStockThreshold),
          }),
        })
      }

      router.push('/admin/products')
    } catch (e) {
      setError('儲存失敗，請稍後再試')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <span style={{ color: '#6B6B6B' }}>載入中…</span>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-sm" style={{ color: '#6B6B6B' }}>
          ← 返回商品列表
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-6" style={{ color: '#2D2D2D' }}>編輯商品</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: '#fff', border: '1px solid #F0EFEC' }}
        >
          <h2 className="font-medium text-sm" style={{ color: '#6B6B6B' }}>基本資訊</h2>

          <Field label="商品名稱 *">
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
            />
          </Field>

          <Field label="商品描述">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="售價 (NT$) *">
              <input
                required
                type="number"
                min="1"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
              />
            </Field>

            <Field label="分類 *">
              <select
                required
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
              >
                <option value="">選擇分類</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="狀態">
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
            >
              <option value="active">上架</option>
              <option value="inactive">下架</option>
            </select>
          </Field>
        </div>

        {inventoryId && (
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: '#fff', border: '1px solid #F0EFEC' }}
          >
            <h2 className="font-medium text-sm" style={{ color: '#6B6B6B' }}>庫存設定</h2>

            <Field label="SKU">
              <input
                value={form.sku}
                onChange={(e) => set('sku', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="庫存數量">
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => set('quantity', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
                />
              </Field>

              <Field label="低庫存警示閾值">
                <input
                  type="number"
                  min="0"
                  value={form.lowStockThreshold}
                  onChange={(e) => set('lowStockThreshold', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
                />
              </Field>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm px-4 py-2 rounded-lg" style={{ background: '#D4845E20', color: '#D4845E' }}>
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="flex-1 py-2.5 rounded-[10px] text-sm text-center"
            style={{ background: '#F0EFEC', color: '#6B6B6B' }}
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-[10px] text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: '#7C9070' }}
          >
            {saving ? '儲存中…' : '儲存變更'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B6B6B' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
