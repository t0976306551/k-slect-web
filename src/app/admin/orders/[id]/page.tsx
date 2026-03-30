'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface OrderDetail {
  id: string
  status: string
  paymentMethod: string
  totalAmount: number
  note: string | null
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  items: {
    id: string
    quantity: number
    priceAtOrder: number
    product: { id: string; name: string }
  }[]
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

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function loadOrder() {
    const res = await fetch(`/api/v1/orders/${id}`)
    const json = await res.json()
    if (json.data) {
      setOrder(json.data)
      setNote(json.data.note ?? '')
    }
    setLoading(false)
  }

  useEffect(() => { loadOrder() }, [id])

  async function updateStatus(status: string) {
    const res = await fetch(`/api/v1/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const json = await res.json()
    if (json.error) { showToast(json.error.message); return }
    showToast(`狀態已更新為：${STATUS_LABEL[status]}`)
    loadOrder()
  }

  async function saveNote() {
    setSavingNote(true)
    const res = await fetch(`/api/v1/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    const json = await res.json()
    if (json.error) { showToast(json.error.message) }
    else { showToast('備註已儲存') }
    setSavingNote(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <span style={{ color: '#6B6B6B' }}>載入中…</span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8">
        <p style={{ color: '#D4845E' }}>找不到此訂單</p>
        <Link href="/admin/orders" className="text-sm mt-2 block" style={{ color: '#7C9070' }}>
          ← 返回訂單列表
        </Link>
      </div>
    )
  }

  const currentIdx = STATUS_FLOW.indexOf(order.status)
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIdx + 1]
    : null

  return (
    <div className="p-8 max-w-3xl">
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm shadow-lg"
          style={{ background: '#7C9070', color: '#fff' }}
        >
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="text-sm" style={{ color: '#6B6B6B' }}>
          ← 返回訂單列表
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#2D2D2D' }}>
            訂單詳情
          </h1>
          <p className="text-xs font-mono mt-1" style={{ color: '#9E9E9E' }}>{order.id}</p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-sm"
          style={{
            background: `${STATUS_COLOR[order.status]}20`,
            color: STATUS_COLOR[order.status],
          }}
        >
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      {/* 狀態進度 */}
      {order.status !== 'cancelled' && (
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: '#fff', border: '1px solid #F0EFEC' }}
        >
          <div className="flex items-center gap-2 mb-4">
            {STATUS_FLOW.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: i <= currentIdx ? '#7C9070' : '#F0EFEC',
                    color: i <= currentIdx ? '#fff' : '#9E9E9E',
                  }}
                >
                  {i < currentIdx ? '✓' : i + 1}
                </div>
                <span className="text-xs" style={{ color: i <= currentIdx ? '#2D2D2D' : '#9E9E9E' }}>
                  {STATUS_LABEL[s]}
                </span>
                {i < STATUS_FLOW.length - 1 && (
                  <div className="w-8 h-px" style={{ background: i < currentIdx ? '#7C9070' : '#F0EFEC' }} />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {nextStatus && (
              <button
                onClick={() => updateStatus(nextStatus)}
                className="px-4 py-2 rounded-[10px] text-sm text-white transition-opacity hover:opacity-90"
                style={{ background: '#7C9070' }}
              >
                → 推進至「{STATUS_LABEL[nextStatus]}」
              </button>
            )}
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <button
                onClick={() => updateStatus('cancelled')}
                className="px-4 py-2 rounded-[10px] text-sm transition-opacity hover:opacity-90"
                style={{ background: '#D4845E20', color: '#D4845E' }}
              >
                取消訂單
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* 客戶資訊 */}
        <div
          className="rounded-2xl p-5"
          style={{ background: '#fff', border: '1px solid #F0EFEC' }}
        >
          <h2 className="font-medium text-sm mb-3" style={{ color: '#6B6B6B' }}>客戶資訊</h2>
          <p className="font-medium" style={{ color: '#2D2D2D' }}>{order.customer.name}</p>
          <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>{order.customer.email}</p>
          {order.customer.phone && (
            <p className="text-sm" style={{ color: '#6B6B6B' }}>{order.customer.phone}</p>
          )}
        </div>

        {/* 付款資訊 */}
        <div
          className="rounded-2xl p-5"
          style={{ background: '#fff', border: '1px solid #F0EFEC' }}
        >
          <h2 className="font-medium text-sm mb-3" style={{ color: '#6B6B6B' }}>付款資訊</h2>
          <p className="text-sm" style={{ color: '#2D2D2D' }}>
            {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
          </p>
          <p className="text-2xl font-semibold mt-2" style={{ color: '#2D2D2D' }}>
            NT$ {order.totalAmount.toLocaleString()}
          </p>
          <p className="text-xs mt-1" style={{ color: '#9E9E9E' }}>
            建立於 {new Date(order.createdAt).toLocaleString('zh-TW')}
          </p>
        </div>
      </div>

      {/* 商品清單 */}
      <div
        className="rounded-2xl overflow-hidden mb-5"
        style={{ background: '#fff', border: '1px solid #F0EFEC' }}
      >
        <h2 className="font-medium text-sm px-5 py-4 border-b" style={{ color: '#6B6B6B', borderColor: '#F0EFEC' }}>
          訂購商品
        </h2>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #F0EFEC' }}>
              {['商品', '數量', '下單單價', '小計'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: '#6B6B6B' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #F7F6F3' }}>
                <td className="px-5 py-3 text-sm font-medium" style={{ color: '#2D2D2D' }}>
                  {item.product.name}
                </td>
                <td className="px-5 py-3 text-sm" style={{ color: '#6B6B6B' }}>
                  × {item.quantity}
                </td>
                <td className="px-5 py-3 text-sm" style={{ color: '#6B6B6B' }}>
                  NT$ {item.priceAtOrder.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-sm font-medium" style={{ color: '#2D2D2D' }}>
                  NT$ {(item.priceAtOrder * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
            <tr style={{ background: '#F7F6F3' }}>
              <td colSpan={3} className="px-5 py-3 text-sm font-medium text-right" style={{ color: '#6B6B6B' }}>
                合計
              </td>
              <td className="px-5 py-3 text-sm font-semibold" style={{ color: '#2D2D2D' }}>
                NT$ {order.totalAmount.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 備註 */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#fff', border: '1px solid #F0EFEC' }}
      >
        <h2 className="font-medium text-sm mb-3" style={{ color: '#6B6B6B' }}>備註</h2>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="輸入訂單備註…"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
          style={{ background: '#F7F6F3', border: '1px solid #F0EFEC', color: '#2D2D2D' }}
        />
        <button
          onClick={saveNote}
          disabled={savingNote}
          className="mt-3 px-4 py-2 rounded-[10px] text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: '#7C9070' }}
        >
          {savingNote ? '儲存中…' : '儲存備註'}
        </button>
      </div>
    </div>
  )
}
