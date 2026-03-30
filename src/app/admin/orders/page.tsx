'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface Order {
  id: string
  status: string
  paymentMethod: string
  totalAmount: number
  createdAt: string
  customer: { id: string; name: string; email: string }
  items: { id: string; quantity: number; product: { id: string; name: string } }[]
}

const STATUS_LABEL: Record<string, string> = {
  pending: '待確認',
  confirmed: '已確認',
  shipped: '已出貨',
  completed: '已完成',
  cancelled: '已取消',
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#FF9800',
  confirmed: '#7C9070',
  shipped: '#5C7A52',
  completed: '#2D2D2D',
  cancelled: '#D4845E',
}

const PAYMENT_LABEL: Record<string, string> = {
  bank_transfer: '銀行轉帳',
  seller_ship: '貨到付款',
}

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'completed']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const limit = 20
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const query = new URLSearchParams({ limit: String(limit), offset: String(page * limit) })
    if (statusFilter) query.set('status', statusFilter)
    const res = await fetch(`/api/v1/orders?${query}`)
    const json = await res.json()
    if (json.data) {
      setOrders(json.data.orders)
      setTotal(json.data.total)
    }
    setLoading(false)
  }, [statusFilter, page])

  useEffect(() => { load() }, [load])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/v1/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const json = await res.json()
    if (json.error) { showToast(json.error.message); return }
    showToast(`訂單狀態已更新為：${STATUS_LABEL[status]}`)
    load()
  }

  function nextStatus(current: string): string | null {
    const idx = STATUS_FLOW.indexOf(current)
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null
  }

  return (
    <div className="p-8">
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm shadow-lg"
          style={{ background: '#7C9070', color: '#fff' }}
        >
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: '#2D2D2D' }}>
          訂單管理
          <span className="text-base font-normal ml-2" style={{ color: '#9E9E9E' }}>
            共 {total} 筆
          </span>
        </h1>
      </div>

      {/* 狀態篩選 */}
      <div className="flex gap-2 mb-5">
        {[
          { value: '', label: '全部' },
          { value: 'pending', label: '待確認' },
          { value: 'confirmed', label: '已確認' },
          { value: 'shipped', label: '已出貨' },
          { value: 'completed', label: '已完成' },
          { value: 'cancelled', label: '已取消' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(0) }}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              background: statusFilter === opt.value ? '#7C9070' : '#fff',
              color: statusFilter === opt.value ? '#fff' : '#6B6B6B',
              border: '1px solid #F0EFEC',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #F0EFEC' }}>
        {loading ? (
          <div className="py-16 text-center" style={{ color: '#9E9E9E' }}>載入中…</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center" style={{ color: '#9E9E9E' }}>沒有符合的訂單</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #F0EFEC' }}>
                {['訂單編號', '客戶', '商品', '金額', '付款方式', '狀態', '操作'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: '#6B6B6B' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const next = nextStatus(order.status)
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #F7F6F3' }}>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs font-mono transition-colors hover:underline"
                        style={{ color: '#7C9070' }}
                      >
                        {order.id.slice(0, 10)}…
                      </Link>
                      <p className="text-xs mt-0.5" style={{ color: '#9E9E9E' }}>
                        {new Date(order.createdAt).toLocaleDateString('zh-TW')}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm" style={{ color: '#2D2D2D' }}>{order.customer.name}</p>
                      <p className="text-xs" style={{ color: '#9E9E9E' }}>{order.customer.email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: '#6B6B6B' }}>
                      {order.items[0]?.product.name ?? '—'}
                      {order.items.length > 1 && (
                        <span className="text-xs ml-1" style={{ color: '#9E9E9E' }}>
                          +{order.items.length - 1}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: '#2D2D2D' }}>
                      NT$ {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: '#6B6B6B' }}>
                      {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{
                          background: `${STATUS_COLOR[order.status]}20`,
                          color: STATUS_COLOR[order.status],
                        }}
                      >
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {next && (
                          <button
                            onClick={() => updateStatus(order.id, next)}
                            className="text-xs px-2.5 py-1 rounded-lg transition-opacity hover:opacity-80"
                            style={{ background: `${STATUS_COLOR[next]}15`, color: STATUS_COLOR[next] }}
                          >
                            → {STATUS_LABEL[next]}
                          </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <button
                            onClick={() => updateStatus(order.id, 'cancelled')}
                            className="text-xs transition-colors hover:opacity-70"
                            style={{ color: '#D4845E' }}
                          >
                            取消
                          </button>
                        )}
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-xs transition-colors hover:opacity-70"
                          style={{ color: '#6B6B6B' }}
                        >
                          詳情
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 分頁 */}
      {total > limit && (
        <div className="flex items-center justify-center gap-4 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: '#fff', border: '1px solid #F0EFEC', color: page === 0 ? '#9E9E9E' : '#2D2D2D' }}
          >
            上一頁
          </button>
          <span className="text-sm" style={{ color: '#6B6B6B' }}>
            第 {page + 1} 頁，共 {Math.ceil(total / limit)} 頁
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * limit >= total}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: '#fff',
              border: '1px solid #F0EFEC',
              color: (page + 1) * limit >= total ? '#9E9E9E' : '#2D2D2D',
            }}
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  )
}
