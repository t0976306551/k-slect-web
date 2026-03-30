'use client'

import { useEffect, useState, useCallback } from 'react'

interface InventoryItem {
  id: string
  sku: string
  quantity: number
  lowStockThreshold: number
  product: { id: string; name: string; status: string }
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // 行內編輯
  const [editId, setEditId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [editThreshold, setEditThreshold] = useState('')
  const [editSku, setEditSku] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const url = lowStockOnly ? '/api/v1/inventory?lowStock=true' : '/api/v1/inventory'
    const res = await fetch(url)
    const json = await res.json()
    if (json.data) setItems(json.data)
    setLoading(false)
  }, [lowStockOnly])

  useEffect(() => { load() }, [load])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function startEdit(item: InventoryItem) {
    setEditId(item.id)
    setEditQuantity(String(item.quantity))
    setEditThreshold(String(item.lowStockThreshold))
    setEditSku(item.sku)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/inventory/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseInt(editQuantity),
          lowStockThreshold: parseInt(editThreshold),
          sku: editSku,
        }),
      })
      const json = await res.json()
      if (json.error) { showToast(json.error.message, 'error'); return }
      setEditId(null)
      showToast('庫存已更新')
      load()
    } finally {
      setSaving(false)
    }
  }

  const lowCount = items.filter((i) => i.quantity <= i.lowStockThreshold).length

  return (
    <div className="p-8">
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm shadow-lg"
          style={{ background: toast.type === 'success' ? '#7C9070' : '#D4845E', color: '#fff' }}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#2D2D2D' }}>庫存管理</h1>
          {lowCount > 0 && (
            <p className="text-sm mt-1" style={{ color: '#D4845E' }}>
              ⚠ {lowCount} 件商品庫存低於安全閾值
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm" style={{ color: '#6B6B6B' }}>僅顯示低庫存</span>
        </label>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #F0EFEC' }}>
        {loading ? (
          <div className="py-16 text-center" style={{ color: '#9E9E9E' }}>載入中…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center" style={{ color: '#9E9E9E' }}>
            {lowStockOnly ? '目前無低庫存商品' : '尚無庫存紀錄'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #F0EFEC' }}>
                {['商品', 'SKU', '庫存數量', '安全閾值', '狀態', '操作'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: '#6B6B6B' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isLow = item.quantity <= item.lowStockThreshold
                const isEditing = editId === item.id

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F7F6F3' }}>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium" style={{ color: '#2D2D2D' }}>
                        {item.product.name}
                      </p>
                      {item.product.status === 'inactive' && (
                        <span className="text-xs" style={{ color: '#9E9E9E' }}>已下架</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: '#9E9E9E' }}>
                      {isEditing ? (
                        <input
                          value={editSku}
                          onChange={(e) => setEditSku(e.target.value)}
                          className="px-2 py-1 rounded text-xs outline-none"
                          style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D', width: 110 }}
                        />
                      ) : (
                        item.sku
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          className="px-2 py-1 rounded text-sm outline-none"
                          style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D', width: 80 }}
                        />
                      ) : (
                        <span
                          className="text-sm font-medium"
                          style={{ color: isLow ? '#D4845E' : '#2D2D2D' }}
                        >
                          {item.quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editThreshold}
                          onChange={(e) => setEditThreshold(e.target.value)}
                          className="px-2 py-1 rounded text-sm outline-none"
                          style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D', width: 80 }}
                        />
                      ) : (
                        <span className="text-sm" style={{ color: '#6B6B6B' }}>
                          {item.lowStockThreshold}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{
                          background: isLow ? '#D4845E20' : '#7C907020',
                          color: isLow ? '#D4845E' : '#7C9070',
                        }}
                      >
                        {isLow ? '庫存不足' : '正常'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <form onSubmit={handleSave} className="flex items-center gap-2">
                          <button
                            type="submit"
                            disabled={saving}
                            className="text-xs px-2.5 py-1 rounded"
                            style={{ background: '#7C9070', color: '#fff' }}
                          >
                            {saving ? '…' : '儲存'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditId(null)}
                            className="text-xs px-2.5 py-1 rounded"
                            style={{ background: '#F0EFEC', color: '#6B6B6B' }}
                          >
                            取消
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="text-sm transition-colors hover:opacity-70"
                          style={{ color: '#7C9070' }}
                        >
                          編輯
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
