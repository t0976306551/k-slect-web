'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Customer, CustomerStatus } from '@/types'

const STATUS_LABEL: Record<CustomerStatus, string> = {
  active: '正常',
  blacklisted: '黑名單',
  vip: 'VIP',
}

const STATUS_CLASS: Record<CustomerStatus, string> = {
  active: 'bg-green-100 text-green-800',
  blacklisted: 'bg-red-100 text-red-800',
  vip: 'bg-yellow-100 text-yellow-800',
}

const STATUS_TABS: Array<{ value: CustomerStatus | ''; label: string }> = [
  { value: '', label: '全部' },
  { value: 'active', label: '正常' },
  { value: 'vip', label: 'VIP' },
  { value: 'blacklisted', label: '黑名單' },
]

async function patchCustomer(id: string, data: Partial<Pick<Customer, 'status' | 'tags' | 'note'>>) {
  const res = await fetch(`/api/v1/customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('更新失敗')
  const json = await res.json()
  return json.data as Customer
}

function StatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function TagChips({
  tags,
  onRemove,
  onAdd,
}: {
  tags: string[]
  onRemove: (tag: string) => void
  onAdd: (tag: string) => void
}) {
  const [input, setInput] = useState('')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      onAdd(input.trim())
      setInput('')
    }
  }

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
        >
          {tag}
          <button
            onClick={() => onRemove(tag)}
            className="ml-0.5 hover:text-blue-600 font-bold leading-none"
            title="移除標籤"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="+ 標籤"
        className="text-xs border-b border-gray-300 focus:border-blue-500 outline-none px-1 w-16 bg-transparent"
      />
    </div>
  )
}

function NoteCell({ id, note, onSaved }: { id: string; note: string | null; onSaved: (note: string | null) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(note ?? '')
  const [saving, setSaving] = useState(false)

  async function handleBlur() {
    setEditing(false)
    const newNote = value.trim() || null
    if (newNote === note) return
    setSaving(true)
    try {
      await patchCustomer(id, { note: newNote })
      onSaved(newNote)
    } catch {
      // 復原
      setValue(note ?? '')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        rows={2}
        className="w-full text-xs border border-blue-400 rounded p-1 resize-none"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={`text-left text-xs w-full min-h-[1.5rem] ${saving ? 'opacity-50' : ''} ${value ? 'text-gray-700' : 'text-gray-400 italic'}`}
      title="點擊編輯備注"
    >
      {value || '點擊新增備注…'}
    </button>
  )
}

function CustomerRow({
  customer,
  onChange,
}: {
  customer: Customer
  onChange: (updated: Customer) => void
}) {
  async function toggleBlacklist() {
    const newStatus: CustomerStatus = customer.status === 'blacklisted' ? 'active' : 'blacklisted'
    try {
      const updated = await patchCustomer(customer.id, { status: newStatus })
      onChange(updated)
    } catch {
      alert('操作失敗，請重試')
    }
  }

  async function handleRemoveTag(tag: string) {
    const tags = customer.tags.filter((t) => t !== tag)
    try {
      const updated = await patchCustomer(customer.id, { tags })
      onChange(updated)
    } catch {
      alert('移除標籤失敗')
    }
  }

  async function handleAddTag(tag: string) {
    if (customer.tags.includes(tag)) return
    const tags = [...customer.tags, tag]
    try {
      const updated = await patchCustomer(customer.id, { tags })
      onChange(updated)
    } catch {
      alert('新增標籤失敗')
    }
  }

  function handleNoteSaved(note: string | null) {
    onChange({ ...customer, note })
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="font-medium text-sm text-gray-900">{customer.name}</div>
        <div className="text-xs text-gray-500">{customer.email}</div>
        {customer.phone && <div className="text-xs text-gray-400">{customer.phone}</div>}
      </td>
      <td className="px-4 py-3 text-center text-sm text-gray-700">
        {customer._count?.orders ?? 0}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={customer.status as CustomerStatus} />
      </td>
      <td className="px-4 py-3 max-w-[200px]">
        <TagChips tags={customer.tags} onRemove={handleRemoveTag} onAdd={handleAddTag} />
      </td>
      <td className="px-4 py-3 max-w-[180px]">
        <NoteCell id={customer.id} note={customer.note} onSaved={handleNoteSaved} />
      </td>
      <td className="px-4 py-3">
        <button
          onClick={toggleBlacklist}
          className={`text-xs px-2 py-1 rounded border transition-colors ${
            customer.status === 'blacklisted'
              ? 'border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-700'
              : 'border-red-300 text-red-600 hover:bg-red-50'
          }`}
        >
          {customer.status === 'blacklisted' ? '解除黑名單' : '加入黑名單'}
        </button>
      </td>
    </tr>
  )
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | ''>('')
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const limit = 20

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      params.set('limit', String(limit))
      params.set('offset', String(offset))

      const res = await fetch(`/api/v1/customers?${params}`)
      const json = await res.json()
      if (json.data) {
        setCustomers(json.data.customers)
        setTotal(json.data.total)
      }
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, offset])

  useEffect(() => {
    setOffset(0)
  }, [search, statusFilter])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  function handleCustomerChange(updated: Customer) {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">會員管理</h1>
        <p className="text-sm text-gray-500">共 {total} 位會員</p>
      </div>

      {/* 搜尋 */}
      <div className="mb-4 flex gap-3 items-center">
        <input
          type="text"
          placeholder="搜尋姓名、Email、電話…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-xs border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Status Tabs */}
      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">載入中…</div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">沒有符合條件的會員</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  會員
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide w-20">
                  訂單數
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-24">
                  狀態
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  標籤
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  備注
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-28">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <CustomerRow key={c.id} customer={c} onChange={handleCustomerChange} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            第 {currentPage} / {totalPages} 頁
          </span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
            >
              上一頁
            </button>
            <button
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
            >
              下一頁
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
