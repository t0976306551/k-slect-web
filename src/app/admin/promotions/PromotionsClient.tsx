'use client'

import { useState, useEffect } from 'react'
import { getPromotions } from '@/lib/promotions'
import type { PromotionRecord, PromotionChannel } from '@/lib/promotions'

const CHANNEL_LABELS: Record<PromotionChannel, string> = {
  LINE: '💬 LINE',
  FB: '👍 Facebook',
}

const CHANNEL_COLORS: Record<PromotionChannel, string> = {
  LINE: 'bg-green-100 text-green-700',
  FB: 'bg-blue-100 text-blue-700',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PromotionsClient() {
  const [records, setRecords] = useState<PromotionRecord[]>([])
  const [channelFilter, setChannelFilter] = useState<PromotionChannel | 'ALL'>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setRecords(getPromotions())
  }, [])

  const filtered = channelFilter === 'ALL'
    ? records
    : records.filter((r) => r.channel === channelFilter)

  return (
    <div className="space-y-6">
      {/* 頁首 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">推廣紀錄</h1>
          <p className="text-sm text-gray-500 mt-0.5">共 {records.length} 筆推廣紀錄</p>
        </div>
        {/* 管道篩選 */}
        <div className="flex items-center gap-2">
          {(['ALL', 'LINE', 'FB'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                channelFilter === ch
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {ch === 'ALL' ? '全部' : CHANNEL_LABELS[ch]}
            </button>
          ))}
        </div>
      </div>

      {/* 空狀態 */}
      {filtered.length === 0 && (
        <div className="text-center py-24 text-gray-400">
          <div className="text-5xl mb-4">📣</div>
          <p className="text-gray-500">
            {records.length === 0 ? '尚無推廣紀錄' : '此管道尚無推廣紀錄'}
          </p>
          {records.length === 0 && (
            <a
              href="/admin/products"
              className="mt-3 inline-block text-sm text-purple-600 hover:underline"
            >
              前往商品管理開始推廣
            </a>
          )}
        </div>
      )}

      {/* 紀錄表格 */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">推廣時間</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">管道</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">推廣商品</th>
                <th className="px-4 py-3 text-center text-gray-600 font-medium">訊息預覽</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((record) => (
                <>
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                  >
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(record.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CHANNEL_COLORS[record.channel]}`}
                      >
                        {CHANNEL_LABELS[record.channel]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {record.productNames.map((name, i) => (
                          <span
                            key={i}
                            className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full border border-purple-100"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedId(expandedId === record.id ? null : record.id)
                        }}
                        className="text-purple-500 hover:text-purple-700 text-xs font-medium"
                      >
                        {expandedId === record.id ? '收合 ▲' : '查看 ▼'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === record.id && (
                    <tr key={`${record.id}-expanded`} className="bg-gray-50">
                      <td colSpan={4} className="px-6 py-4">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white border border-gray-200 rounded-xl p-4 leading-relaxed">
                          {record.message}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
