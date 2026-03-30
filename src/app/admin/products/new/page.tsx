'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
    fetch('/api/v1/categories').then((r) => r.json()).then((j) => {
      if (j.data) setCategories(j.data)
    })
  }, [])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const body: Record<string, unknown> = {
        name: form.name,
        description: form.description || undefined,
        price: parseInt(form.price),
        categoryId: form.categoryId,
        status: form.status,
      }

      if (form.sku) {
        body.inventory = {
          sku: form.sku,
          quantity: parseInt(form.quantity),
          lowStockThreshold: parseInt(form.lowStockThreshold),
        }
      }

      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()

      if (json.error) {
        setError(json.error.message)
        return
      }

      router.push('/admin/products')
    } catch (e) {
      setError('儲存失敗，請稍後再試')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-sm" style={{ color: '#6B6B6B' }}>
          ← 返回商品列表
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-6" style={{ color: '#2D2D2D' }}>新增商品</h1>

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
              placeholder="例：COSRX 蝸牛黏液精華"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
            />
          </Field>

          <Field label="商品描述">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="商品說明…"
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
                placeholder="0"
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

        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: '#fff', border: '1px solid #F0EFEC' }}
        >
          <h2 className="font-medium text-sm" style={{ color: '#6B6B6B' }}>庫存設定（選填）</h2>

          <Field label="SKU">
            <input
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="例：SKU-001"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="初始庫存數量">
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
            {saving ? '儲存中…' : '新增商品'}
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
