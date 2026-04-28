'use client'

import { MessageCircle } from 'lucide-react'

interface Props {
  orderId: string
  total?: number
  last5?: string
}

/**
 * 產生 LINE 開啟 OA 對話的 deep link，並將訂單資訊預填入訊息。
 * LINE URL 格式：https://line.me/R/oaMessage/@BASICID/?text=...
 */
function buildLineUrl(orderId: string, total?: number, last5?: string): string {
  const oaId = process.env.NEXT_PUBLIC_LINE_OA_ID ?? ''
  if (!oaId) return ''

  const parts = [`匯款通知 #${orderId}`]
  if (total && total > 0) {
    parts.push(`NT$ ${total.toLocaleString('zh-TW')}`)
  }
  if (last5) {
    parts.push(`帳號末五碼：${last5}`)
  }

  const message = parts.join('  ')
  return `https://line.me/R/oaMessage/${oaId}/?text=${encodeURIComponent(message)}`
}

export default function LineNotifyButton({ orderId, total, last5 }: Props) {
  const oaId = process.env.NEXT_PUBLIC_LINE_OA_ID
  if (!oaId) return null

  const lineUrl = buildLineUrl(orderId, total, last5)

  return (
    <div className="mt-4 rounded-[14px] border border-[#06C755]/25 bg-[#06C755]/5 p-4">
      <p className="mb-3 text-[13px] font-medium text-[#2D2D2D]">透過 LINE 通知商家付款</p>
      <p className="mb-3 text-[12px] leading-relaxed text-[#6B6B6B]">
        點擊下方按鈕開啟 LINE 對話，訂單資訊會自動帶入，傳送後商家將立即確認並回覆。
      </p>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#06C755] py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
      >
        <MessageCircle size={16} />
        開啟 LINE 通知商家
      </a>
    </div>
  )
}
