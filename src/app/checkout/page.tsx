'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Truck, Store } from 'lucide-react'
import { getCart, clearCart, getCartTotal } from '@/lib/cart'
import type { CartItem } from '@/lib/cart'
import { createOrder } from '@/lib/api'
import { getMerchantBankAccount } from '@/lib/merchant'
import type { ShippingMethod } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('home_delivery')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    const cart = getCart()
    if (cart.length === 0) {
      router.replace('/cart')
      return
    }
    setItems(cart)
    const savedEmail = localStorage.getItem('customer_email')
    if (savedEmail) setEmail(savedEmail)
  }, [router])

  const total = getCartTotal(items)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('請填寫姓名'); return }
    if (!address.trim() && shippingMethod === 'home_delivery') { setError('請填寫收件地址'); return }

    setSubmitting(true)
    setError(null)

    try {
      const bankInfo = getMerchantBankAccount()
      const result = await createOrder({
        customerName: name.trim(),
        customerEmail: email.trim() || undefined,
        customerPhone: phone.trim() || undefined,
        customerAddress: address.trim(),
        paymentMethod: 'bank_transfer',
        shippingMethod,
        note: note.trim() || undefined,
        bankTransferInfoSnapshot: bankInfo,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          variantId: i.variantId,
        })),
      })

      if (result.error) {
        setError(result.error.message ?? '下單失敗，請稍後再試')
        return
      }

      if (email.trim()) localStorage.setItem('customer_email', email.trim())
      clearCart()

      const orderId = result.data?.id
      router.push(`/checkout/bank-transfer?orderId=${orderId}`)
    } catch {
      setError('網路錯誤，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="bg-[#F7F6F3] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-[#F0EFEC]">
        <div className="max-w-[800px] mx-auto px-4 md:px-8 py-5 flex items-center gap-3">
          <Link href="/cart" className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="font-fraunces text-[22px] font-medium text-[#2D2D2D] tracking-tight">結帳</h1>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <form onSubmit={handleSubmit} className="flex flex-col md:grid md:grid-cols-[1fr_300px] md:gap-8 gap-4">

          {/* Left: Form */}
          <div className="flex flex-col gap-4">

            {/* Contact info */}
            <section className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6 flex flex-col gap-4">
              <h2 className="font-fraunces text-[17px] font-medium text-[#2D2D2D]">聯絡資訊</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block font-jakarta text-[13px] font-medium text-[#2D2D2D] mb-1.5">
                    姓名 <span className="text-[#D4845E]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="王小明"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full font-jakarta text-[14px] text-[#2D2D2D] placeholder-[#AEAAA4] border border-[#E8E6E2] rounded-[10px] px-4 py-3 outline-none focus:border-[#7C9070] focus:ring-2 focus:ring-[#7C9070]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-jakarta text-[13px] font-medium text-[#2D2D2D] mb-1.5">手機</label>
                  <input
                    type="tel"
                    placeholder="0912-345-678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full font-jakarta text-[14px] text-[#2D2D2D] placeholder-[#AEAAA4] border border-[#E8E6E2] rounded-[10px] px-4 py-3 outline-none focus:border-[#7C9070] focus:ring-2 focus:ring-[#7C9070]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-jakarta text-[13px] font-medium text-[#2D2D2D] mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full font-jakarta text-[14px] text-[#2D2D2D] placeholder-[#AEAAA4] border border-[#E8E6E2] rounded-[10px] px-4 py-3 outline-none focus:border-[#7C9070] focus:ring-2 focus:ring-[#7C9070]/10 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Shipping */}
            <section className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6 flex flex-col gap-4">
              <h2 className="font-fraunces text-[17px] font-medium text-[#2D2D2D]">配送方式</h2>
              <div className="flex flex-col gap-2.5">
                {([
                  { value: 'home_delivery', label: '宅配到府', Icon: Truck, desc: '2–5 個工作天' },
                  { value: 'cvs_pickup', label: '超商取貨', Icon: Store, desc: '7-ELEVEN / 全家' },
                ] as const).map(({ value, label, Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setShippingMethod(value as ShippingMethod)}
                    className={`flex items-center gap-3 p-4 rounded-[12px] border transition-all text-left ${
                      shippingMethod === value
                        ? 'border-[#7C9070] bg-[#7C9070]/5'
                        : 'border-[#E8E6E2] hover:border-[#C8C6C2]'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      shippingMethod === value ? 'bg-[#7C9070]' : 'bg-[#F0EFEC]'
                    }`}>
                      <Icon size={16} className={shippingMethod === value ? 'text-white' : 'text-[#6B6B6B]'} />
                    </div>
                    <div>
                      <p className="font-jakarta text-[14px] font-semibold text-[#2D2D2D]">{label}</p>
                      <p className="font-jakarta text-[12px] text-[#6B6B6B]">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div>
                <label className="block font-jakarta text-[13px] font-medium text-[#2D2D2D] mb-1.5">
                  收件地址 <span className="text-[#D4845E]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="台北市信義區..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  className="w-full font-jakarta text-[14px] text-[#2D2D2D] placeholder-[#AEAAA4] border border-[#E8E6E2] rounded-[10px] px-4 py-3 outline-none focus:border-[#7C9070] focus:ring-2 focus:ring-[#7C9070]/10 transition-all"
                />
              </div>
              <div>
                <label className="block font-jakarta text-[13px] font-medium text-[#2D2D2D] mb-1.5">備註（選填）</label>
                <textarea
                  placeholder="配送時間、門口密碼等..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  className="w-full font-jakarta text-[14px] text-[#2D2D2D] placeholder-[#AEAAA4] border border-[#E8E6E2] rounded-[10px] px-4 py-3 outline-none focus:border-[#7C9070] focus:ring-2 focus:ring-[#7C9070]/10 transition-all resize-none"
                />
              </div>
            </section>

            {/* Payment method - bank transfer only */}
            <section className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6">
              <h2 className="font-fraunces text-[17px] font-medium text-[#2D2D2D] mb-3">付款方式</h2>
              <div className="flex items-center gap-3 p-4 rounded-[12px] border border-[#7C9070] bg-[#7C9070]/5">
                <div className="w-4 h-4 rounded-full border-2 border-[#7C9070] flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#7C9070]" />
                </div>
                <p className="font-jakarta text-[14px] font-semibold text-[#2D2D2D]">銀行轉帳</p>
              </div>
            </section>
          </div>

          {/* Right: Order summary */}
          <div className="md:sticky md:top-[72px] md:self-start">
            <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 flex flex-col gap-3.5">
              <h2 className="font-fraunces text-[17px] font-medium text-[#2D2D2D]">訂單摘要</h2>

              <div className="flex flex-col gap-2 border-t border-[#F0EFEC] pt-3">
                {items.map(item => (
                  <div key={`${item.productId}::${item.variantId ?? ''}`} className="flex items-start justify-between gap-2">
                    <p className="font-jakarta text-[12px] text-[#6B6B6B] leading-snug flex-1">
                      {item.productName}
                      {item.variantLabel && <span className="text-[#AEAAA4]">（{item.variantLabel}）</span>}
                      {item.quantity > 1 && <span> ×{item.quantity}</span>}
                    </p>
                    <p className="font-jakarta text-[12px] text-[#6B6B6B] tabular-nums flex-shrink-0">
                      {(item.price * item.quantity).toLocaleString('zh-TW')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-[#F0EFEC] pt-3">
                <span className="font-jakarta text-[14px] font-semibold text-[#2D2D2D]">合計</span>
                <span className="font-jakarta text-[20px] font-semibold text-[#2D2D2D] tabular-nums">
                  NT$ {total.toLocaleString('zh-TW')}
                </span>
              </div>

              {error && (
                <p className="font-jakarta text-[13px] text-[#D4845E] bg-[#D4845E]/8 rounded-[8px] px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full font-jakarta font-semibold text-[15px] bg-[#7C9070] hover:bg-[#6a7d5f] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-[10px] transition-all duration-200"
              >
                {submitting ? '處理中...' : '確認下單'}
              </button>

              <p className="font-jakarta text-[11px] text-[#AEAAA4] text-center leading-relaxed">
                下單即代表同意服務條款與隱私政策
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
