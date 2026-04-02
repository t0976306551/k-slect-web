'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Copy } from 'lucide-react'
import { generateLineMessage, addPromotion } from '@/lib/promotions'
import type { Product } from '@/lib/api'

interface LineShareModalProps {
  products: Product[]
  onClose: () => void
}

export default function LineShareModal({ products, onClose }: LineShareModalProps) {
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const generated = generateLineMessage(
      products.map((p) => ({ id: p.id, name: p.name, price: p.price })),
    )
    setMessage(generated)
  }, [products])

  // 關閉時按 Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message)
      // 記錄推廣紀錄
      addPromotion({
        productIds: products.map((p) => p.id),
        productNames: products.map((p) => p.name),
        channel: 'LINE',
        message,
      })
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // fallback：選取文字
      const el = document.querySelector<HTMLTextAreaElement>('#line-message-textarea')
      el?.select()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-green-500" />
            <h2 className="font-semibold text-gray-800">LINE 推廣訊息</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>

        {/* 商品清單 */}
        <div className="px-6 pt-4">
          <p className="text-xs text-gray-500 mb-2">已選取 {products.length} 件商品</p>
          <div className="flex flex-wrap gap-1 mb-4">
            {products.map((p) => (
              <span
                key={p.id}
                className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full border border-purple-100"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>

        {/* 訊息預覽 */}
        <div className="px-6">
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            訊息預覽（可編輯）
          </label>
          <textarea
            id="line-message-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={10}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">
            複製後手動貼到 LINE 群組
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {copied ? (
              <>
                <span>✓</span>
                <span>已複製！貼到 LINE 群組吧</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>一鍵複製訊息</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
