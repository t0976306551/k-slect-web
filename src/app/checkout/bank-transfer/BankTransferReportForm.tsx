'use client'

import { useEffect, useState } from 'react'
import { Check, Send } from 'lucide-react'
import { fetchBankTransferReport, submitBankTransferReport } from '@/lib/api'
import type { BankTransferReport } from '@/types'
import LineNotifyButton from './LineNotifyButton'

interface Props {
  orderId: string
  total?: number
}

export default function BankTransferReportForm({ orderId, total }: Props) {
  const [last5, setLast5] = useState('')
  const [transferredAt, setTransferredAt] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<BankTransferReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!orderId || orderId === 'ORD-XXXXXXX') {
      setLoading(false)
      return
    }
    async function load() {
      try {
        const res = await fetchBankTransferReport(orderId)
        if (!active) return
        if (res.data) setReport(res.data)
      } catch {
        // 尚未回報時不顯示錯誤，靜默失敗
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [orderId])

  if (!orderId || orderId === 'ORD-XXXXXXX') {
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\d{5}$/.test(last5)) {
      setError('請輸入正確的 5 位數匯款帳號末五碼')
      return
    }
    setSubmitting(true)
    setError(null)
    const res = await submitBankTransferReport(orderId, {
      last5,
      transferredAt: transferredAt || null,
      note: note || null,
    })
    setSubmitting(false)
    if (res.error) {
      setError(res.error.message)
      return
    }
    if (res.data) setReport(res.data)
  }

  if (loading) {
    return (
      <div className="mt-6 bg-white rounded-[16px] border border-[#F0EFEC] p-6 text-[13px] text-[#9E9E9E]">
        載入中…
      </div>
    )
  }

  if (report) {
    return (
      <div className="mt-6 bg-white rounded-[16px] border border-[#7C9070]/30 p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#7C9070] flex items-center justify-center">
            <Check size={12} className="text-white" strokeWidth={3} />
          </div>
          <h3 className="text-[15px] font-semibold text-[#2D2D2D]">匯款資訊已回報</h3>
        </div>
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-[#9E9E9E]">帳號末五碼</span>
            <span className="font-mono font-semibold text-[#2D2D2D]">{report.last5}</span>
          </div>
          {report.transferredAt && (
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">匯款時間</span>
              <span className="text-[#2D2D2D]">{report.transferredAt}</span>
            </div>
          )}
          {report.note && (
            <div className="flex justify-between gap-3">
              <span className="text-[#9E9E9E] shrink-0">備註</span>
              <span className="text-[#2D2D2D] text-right">{report.note}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#9E9E9E]">回報時間</span>
            <span className="text-[#2D2D2D]">
              {new Date(report.reportedAt).toLocaleString('zh-TW')}
            </span>
          </div>
        </div>
        <p className="mt-4 text-[12px] text-[#6B6B6B] leading-relaxed bg-[#F7F6F3] rounded-[8px] px-3 py-2">
          已通知商家對帳，款項確認後將更新訂單付款狀態。
        </p>
        <LineNotifyButton orderId={orderId} total={total} last5={report.last5} />
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 bg-white rounded-[16px] border border-[#F0EFEC] p-6"
    >
      <h3 className="text-[15px] font-semibold text-[#2D2D2D] mb-1">回報匯款資訊</h3>
      <p className="text-[12px] text-[#9E9E9E] mb-4">
        完成轉帳後，請回報您的匯款帳號末五碼以便商家對帳。
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-medium text-[#6B6B6B] mb-1.5">
            匯款帳號末五碼 <span className="text-[#D4845E]">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={last5}
            onChange={(e) => setLast5(e.target.value.replace(/\D/g, ''))}
            placeholder="例：12345"
            className="w-full text-[15px] font-mono tracking-widest text-center px-3 py-3 bg-white border border-[#E8E8E8] rounded-[10px] focus:border-[#7C9070] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#6B6B6B] mb-1.5">
            匯款時間（選填）
          </label>
          <input
            type="datetime-local"
            value={transferredAt}
            onChange={(e) => setTransferredAt(e.target.value)}
            className="w-full text-[14px] px-3 py-2.5 bg-white border border-[#E8E8E8] rounded-[10px] focus:border-[#7C9070] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#6B6B6B] mb-1.5">
            備註（選填）
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={200}
            placeholder="例：使用 ATM 轉帳"
            className="w-full text-[14px] px-3 py-2.5 bg-white border border-[#E8E8E8] rounded-[10px] focus:border-[#7C9070] focus:outline-none resize-none"
          />
        </div>

        {error && (
          <p className="text-[12px] text-[#D4845E] bg-[#FBE9E7] rounded-[8px] px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || last5.length !== 5}
          className="w-full flex items-center justify-center gap-2 bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#C5D1BD] text-white text-[14px] font-medium py-3 rounded-[10px] transition-colors"
        >
          <Send size={14} />
          {submitting ? '送出中…' : '送出回報'}
        </button>

        <LineNotifyButton orderId={orderId} total={total} last5={last5 || undefined} />
      </div>
    </form>
  )
}
