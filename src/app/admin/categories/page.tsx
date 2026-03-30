'use client'

import { useEffect, useState, useCallback } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  _count: { products: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // 新增表單
  const [addName, setAddName] = useState('')
  const [addParentId, setAddParentId] = useState('')
  const [adding, setAdding] = useState(false)

  // 編輯狀態
  const [editSlug, setEditSlug] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editParentId, setEditParentId] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // 刪除確認
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/v1/categories')
    const json = await res.json()
    if (json.data) setCategories(json.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!addName.trim()) return
    setAdding(true)
    try {
      const body: Record<string, string> = { name: addName }
      if (addParentId) body.parentId = addParentId
      const res = await fetch('/api/v1/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.error) { showToast(json.error.message, 'error'); return }
      setAddName('')
      setAddParentId('')
      showToast('分類已新增')
      load()
    } finally {
      setAdding(false)
    }
  }

  function startEdit(cat: Category) {
    setEditSlug(cat.slug)
    setEditName(cat.name)
    setEditParentId(cat.parentId ?? '')
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editSlug) return
    setEditSaving(true)
    try {
      const body: Record<string, string | null> = { name: editName }
      body.parentId = editParentId || null
      const res = await fetch(`/api/v1/categories/${editSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.error) { showToast(json.error.message, 'error'); return }
      setEditSlug(null)
      showToast('分類已更新')
      load()
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDelete(slug: string) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/v1/categories/${slug}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.error) { showToast(json.error.message, 'error'); return }
      setDeleteSlug(null)
      showToast('分類已刪除')
      load()
    } finally {
      setDeleting(false)
    }
  }

  const rootCategories = categories.filter((c) => !c.parentId)

  return (
    <div className="p-8">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm shadow-lg"
          style={{ background: toast.type === 'success' ? '#7C9070' : '#D4845E', color: '#fff' }}
        >
          {toast.msg}
        </div>
      )}

      <h1 className="text-2xl font-semibold mb-6" style={{ color: '#2D2D2D' }}>分類管理</h1>

      {/* 新增表單 */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: '#fff', border: '1px solid #F0EFEC' }}
      >
        <h2 className="font-medium text-sm mb-4" style={{ color: '#6B6B6B' }}>新增分類</h2>
        <form onSubmit={handleAdd} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B6B6B' }}>
              分類名稱 *
            </label>
            <input
              required
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="例：韓國美妝"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
            />
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B6B6B' }}>
              上層分類（選填）
            </label>
            <select
              value={addParentId}
              onChange={(e) => setAddParentId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
            >
              <option value="">無（頂層）</option>
              {rootCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 rounded-[10px] text-sm text-white transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ background: '#7C9070' }}
          >
            {adding ? '新增中…' : '+ 新增'}
          </button>
        </form>
      </div>

      {/* 分類列表 */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #F0EFEC' }}>
        {loading ? (
          <div className="py-16 text-center" style={{ color: '#9E9E9E' }}>載入中…</div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center" style={{ color: '#9E9E9E' }}>尚無分類</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #F0EFEC' }}>
                {['分類名稱', 'Slug', '上層分類', '商品數', '操作'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: '#6B6B6B' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const parent = categories.find((c) => c.id === cat.parentId)
                const isEditing = editSlug === cat.slug

                return (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #F7F6F3' }}>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <form onSubmit={handleEdit} className="flex gap-2 items-center">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 rounded text-sm outline-none"
                            style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D', width: 160 }}
                          />
                          <select
                            value={editParentId}
                            onChange={(e) => setEditParentId(e.target.value)}
                            className="px-2 py-1 rounded text-sm outline-none"
                            style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
                          >
                            <option value="">無</option>
                            {rootCategories.filter((c) => c.id !== cat.id).map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            disabled={editSaving}
                            className="text-xs px-2 py-1 rounded"
                            style={{ background: '#7C9070', color: '#fff' }}
                          >
                            {editSaving ? '…' : '儲存'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditSlug(null)}
                            className="text-xs px-2 py-1 rounded"
                            style={{ background: '#F0EFEC', color: '#6B6B6B' }}
                          >
                            取消
                          </button>
                        </form>
                      ) : (
                        <span className="text-sm font-medium" style={{ color: '#2D2D2D' }}>
                          {cat.parentId && <span style={{ color: '#9E9E9E' }}>↳ </span>}
                          {cat.name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: '#9E9E9E' }}>
                      {cat.slug}
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: '#6B6B6B' }}>
                      {parent?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: '#2D2D2D' }}>
                      {cat._count.products}
                    </td>
                    <td className="px-5 py-3">
                      {!isEditing && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => startEdit(cat)}
                            className="text-sm transition-colors hover:opacity-70"
                            style={{ color: '#7C9070' }}
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => setDeleteSlug(cat.slug)}
                            className="text-sm transition-colors hover:opacity-70"
                            style={{ color: cat._count.products > 0 ? '#9E9E9E' : '#D4845E' }}
                            disabled={cat._count.products > 0}
                            title={cat._count.products > 0 ? '分類下有商品，無法刪除' : ''}
                          >
                            刪除
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 刪除確認 Modal */}
      {deleteSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-2xl p-6 w-80" style={{ background: '#fff' }}>
            <h3 className="font-semibold mb-2" style={{ color: '#2D2D2D' }}>確認刪除分類</h3>
            <p className="text-sm mb-5" style={{ color: '#6B6B6B' }}>
              此操作無法復原，請確認分類下沒有商品。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteSlug(null)}
                className="flex-1 py-2 rounded-[10px] text-sm"
                style={{ background: '#F0EFEC', color: '#6B6B6B' }}
                disabled={deleting}
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteSlug)}
                className="flex-1 py-2 rounded-[10px] text-sm text-white"
                style={{ background: '#D4845E' }}
                disabled={deleting}
              >
                {deleting ? '處理中…' : '確認刪除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
