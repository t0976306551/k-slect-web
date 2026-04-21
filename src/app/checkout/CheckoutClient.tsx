'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Store, AlertCircle } from 'lucide-react'
import { getCart, getCartTotal, clearCart } from '@/lib/cart'
import { createOrder } from '@/lib/api'
import type { CartItem } from '@/lib/cart'

interface FormState {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  note: string
}

const INITIAL_FORM: FormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress: '',
  note: '',
}

export default function CheckoutClient() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const items = getCart()
    if (items.length === 0) {
      router.replace('/cart')
      return
    }
    setCartItems(items)
    const savedEmail = localStorage.getItem('customer_email')
    if (savedEmail) {
      setForm((prev) => ({ ...prev, customerEmail: savedEmail }))
    }
  }, [router])

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (cartItems.length === 0) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await createOrder({
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone || undefined,
        customerAddress: form.customerAddress,
        paymentMethod: 'seller_ship',
        note: form.note || undefined,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      })

      if (res.error) {
        setSubmitError(res.error.message)
      } else {
        clearCart()
        localStorage.setItem('customer_email', form.customerEmail)
        const id = res.data?.id ?? ''
        const total = res.data?.totalAmount ?? getCartTotal(cartItems)
        router.replace(`/checkout/success?orderId=${encodeURIComponent(id)}&total=${total}`)
      }
    } catch {
      setSubmitError('下單失敗，請稍後再試或聯繫客服')
    } finally {
      setSubmitting(false)
    }
  }

  const total = getCartTotal(cartItems)

  const inputCls =
    'w-full border border-[#E8E8E8] bg-white rounded-[10px] px-4 py-3 text-[14px] text-[#2D2D2D] placeholder:text-[#C8C8C8] focus:outline-none focus:border-[#7C9070] focus:ring-2 focus:ring-[#7C9070]/10 transition-all'
  const labelCls =
    'block text-[11px] font-medium tracking-[0.05em] uppercase text-[#9E9E9E] mb-2'

  return (
    <>
      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-6 md:py-10 pb-[96px] md:pb-10">
        {/* Page header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-1.5 text-[12px] text-[#9E9E9E] mb-3">
            <Link href="/cart" className="hover:text-[#7C9070] transition-colors">
              購物車
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#2D2D2D]">結帳</span>
          </div>
          <h1 className="font-fraunces font-medium text-[28px] md:text-[34px] text-[#2D2D2D] leading-tight">
            結帳
          </h1>
          <p className="text-[13px] text-[#9E9E9E] mt-1">{cartItems.length} 件商品</p>
        </div>

        <div className="md:grid md:grid-cols-[1fr_340px] md:gap-8 md:items-start">
          {/* Left: form */}
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Shipping info */}
            <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6 space-y-4">
              <h2 className="font-fraunces font-medium text-[17px] text-[#2D2D2D]">收件資訊</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    姓名 <span className="text-[#D4845E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.customerName}
                    onChange={(e) => handleChange('customerName', e.target.value)}
                    className={inputCls}
                    placeholder="王小明"
                  />
                </div>
                <div>
                  <label className={labelCls}>手機號碼</label>
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(e) => handleChange('customerPhone', e.target.value)}
                    className={inputCls}
                    placeholder="0912-345-678"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  電子郵件 <span className="text-[#D4845E]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.customerEmail}
                  onChange={(e) => handleChange('customerEmail', e.target.value)}
                  className={inputCls}
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className={labelCls}>
                  收件地址 <span className="text-[#D4845E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.customerAddress}
                  onChange={(e) => handleChange('customerAddress', e.target.value)}
                  className={inputCls}
                  placeholder="台北市信義區..."
                />
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6">
              <h2 className="font-fraunces font-medium text-[17px] text-[#2D2D2D] mb-4">付款方式</h2>
              <div className="flex items-center gap-3.5 rounded-[12px] p-4 border-2 border-[#7C9070] bg-[#7C9070]/5">
                <div className="w-9 h-9 rounded-full bg-[#F7F6F3] flex items-center justify-center shrink-0">
                  <Store size={17} className="text-[#7C9070]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-jakarta font-medium text-[14px] text-[#2D2D2D]">
                    賣貨便取貨付款
                  </div>
                  <div className="text-[12px] text-[#9E9E9E] mt-0.5">7-11 超商取貨，到貨後付款</div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-[#7C9070] flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#7C9070]" />
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5 md:p-6">
              <h2 className="font-fraunces font-medium text-[17px] text-[#2D2D2D] mb-4">訂單備註</h2>
              <textarea
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="有任何特別需求請填寫..."
              />
            </div>

            {submitError && (
              <div className="flex gap-2.5 bg-red-50 border border-red-100 rounded-[12px] p-4 text-[13px] text-red-500">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Desktop submit button */}
            <button
              type="submit"
              disabled={submitting || cartItems.length === 0}
              className="hidden md:flex w-full items-center justify-between bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#E0DDD8] disabled:text-[#8E8E93] text-white font-jakarta font-semibold text-[15px] px-6 py-4 rounded-[12px] transition-colors"
            >
              <span>{submitting ? '處理中...' : '確認下單'}</span>
              {!submitting && (
                <span className="tabular-nums">NT$ {total.toLocaleString('zh-TW')}</span>
              )}
            </button>
          </form>

          {/* Right: sticky order summary */}
          <div className="mt-4 md:mt-0 md:sticky md:top-[80px]">
            <div className="bg-white rounded-[16px] border border-[#F0EFEC] p-5">
              <h2 className="font-fraunces font-medium text-[17px] text-[#2D2D2D] mb-4">訂單摘要</h2>

              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={`${item.productId}::${item.variantId ?? ''}`}
                    className="flex justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="line-clamp-1 text-[13px] text-[#2D2D2D]">
                        {item.productName}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.variantLabel && (
                          <>
                            <span className="text-[11px] text-[#9E9E9E]">{item.variantLabel}</span>
                            <span className="text-[11px] text-[#C8C8C8]">·</span>
                          </>
                        )}
                        <span className="text-[11px] text-[#9E9E9E]">×{item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-[13px] font-medium text-[#2D2D2D] shrink-0 tabular-nums">
                      NT$ {(item.price * item.quantity).toLocaleString('zh-TW')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#F0EFEC] mt-4 pt-4 space-y-2.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#9E9E9E]">小計</span>
                  <span className="text-[#2D2D2D] tabular-nums">
                    NT$ {total.toLocaleString('zh-TW')}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#9E9E9E]">運費</span>
                  <span className="text-[#9E9E9E]">於結帳時確認</span>
                </div>
                <div className="flex justify-between font-jakarta font-bold text-[15px] pt-2.5 border-t border-[#F0EFEC]">
                  <span className="text-[#2D2D2D]">合計</span>
                  <span className="text-[#7C9070] tabular-nums">
                    NT$ {total.toLocaleString('zh-TW')}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/cart"
              className="flex items-center justify-center gap-1 mt-3 text-[13px] text-[#9E9E9E] hover:text-[#7C9070] transition-colors"
            >
              <ChevronRight size={13} className="rotate-180" />
              修改購物車
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-[#F0EFEC] px-4 py-3" style={{ bottom: 'calc(54px + env(safe-area-inset-bottom, 0px))' }}>
        <button
          type="submit"
          form="checkout-form"
          disabled={submitting || cartItems.length === 0}
          className="w-full flex items-center justify-between bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#E0DDD8] disabled:text-[#8E8E93] text-white font-jakarta font-semibold text-[15px] px-5 py-3.5 rounded-[12px] transition-colors"
        >
          <span>{submitting ? '處理中...' : '確認下單'}</span>
          {!submitting && (
            <span className="tabular-nums">NT$ {total.toLocaleString('zh-TW')}</span>
          )}
        </button>
      </div>
    </>
  )
}

