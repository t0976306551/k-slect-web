'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Copy, Check, Clock } from 'lucide-react'
import { getMerchantBankAccount } from '@/lib/merchant'
import type { MerchantBankAccount } from '@/lib/merchant'

export const dynamic = 'force-dynamic'

function BankTransferContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams?.get('orderId')
  const [copied, setCopied] = useState<string | null>(null)
  const [bankInfo] = useState<MerchantBankAccount>(() => getMerchantBankAccount())

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch { /* ignore */ }
  }

  const rows: { label: string; value: string; key: string }[] = [
    { label: '銀行名稱', value: bankInfo.bankName, key: 'bank' },
    { label: '銀行代碼', value: bankInfo.bankCode ?? '', key: 'code' },
    { label: '分行', value: bankInfo.branchName ?? '', key: 'branch' },
    { label: '帳戶名稱', value: bankInfo.accountName, key: 'name' },
    { label: '帳號', value: bankInfo.accountNumber, key: 'account' },
  ].filter(r => r.value)

  return (
    <div className="bg-[#F7F6F3] min-h-screen">
      <div className="max-w-[560px] mx-auto px-4 py-10 md:py-16 flex flex-col gap-6">

        {/* Icon + title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-[#D4845E]/10 flex items-center justify-center">
            <Clock size={28} className="text-[#D4845E]" />
          </div>
          <h1 className="font-fraunces text-[26px] md:text-[30px] font-medium text-[#2D2D2D] tracking-tight">
            等待您完成匯款
          </h1>
          <p className="font-jakarta text-[14px] text-[#6B6B6B] leading-relaxed max-w-[360px]">
            請於 {bankInfo.paymentDeadlineHours} 小時內完成匯款，並保留轉帳紀錄。確認收款後將盡快為您出貨。
          </p>
          {orderId && (
            <p className="font-jakarta text-[12px] text-[#AEAAA4]">
              訂單編號：<span className="font-semibold text-[#6B6B6B]">{orderId}</span>
            </p>
          )}
        </div>

        {/* Bank info card */}
        <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6 flex flex-col gap-0">
          <h2 className="font-fraunces text-[16px] font-medium text-[#2D2D2D] mb-4">匯款資訊</h2>
          {rows.map(({ label, value, key }, i) => (
            <div
              key={key}
              className={`flex items-center justify-between py-3.5 ${i < rows.length - 1 ? 'border-b border-[#F0EFEC]' : ''}`}
            >
              <div>
                <p className="font-jakarta text-[12px] text-[#6B6B6B]">{label}</p>
                <p className="font-jakarta text-[15px] font-semibold text-[#2D2D2D] mt-0.5 tabular-nums">{value}</p>
              </div>
              <button
                onClick={() => copy(value, key)}
                className="flex items-center gap-1.5 font-jakarta text-[12px] text-[#7C9070] hover:text-[#6a7d5f] transition-colors"
              >
                {copied === key ? <Check size={14} /> : <Copy size={14} />}
                {copied === key ? '已複製' : '複製'}
              </button>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div className="bg-[#D4845E]/8 rounded-[12px] p-4 flex flex-col gap-1.5">
          <p className="font-jakarta text-[13px] font-semibold text-[#D4845E]">匯款注意事項</p>
          <ul className="font-jakarta text-[13px] text-[#6B6B6B] flex flex-col gap-1 list-disc list-inside">
            <li>請務必在 {bankInfo.paymentDeadlineHours} 小時內完成匯款</li>
            <li>匯款後請保留轉帳截圖或紀錄</li>
            <li>若有任何問題，歡迎透過 LINE 聯繫客服</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center justify-center font-jakarta font-semibold text-[15px] bg-[#7C9070] hover:bg-[#6a7d5f] active:scale-[0.98] text-white py-3.5 rounded-[10px] transition-all duration-200"
          >
            繼續購物
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BankTransferPage() {
  return (
    <Suspense>
      <BankTransferContent />
    </Suspense>
  )
}
