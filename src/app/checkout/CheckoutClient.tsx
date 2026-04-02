'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

const inputCls = 'w-full border border-[#E8E8E8] bg-white rounded-[8px] px-3.5 py-2.5 text-[14px] text-[#2D2D2D] placeholder:text-[#C8C8C8] focus:outline-none focus:border-[#7C9070] transition-colors'
const labelCls = 'block text-[12px] text-[#9E9E9E] mb-1.5'

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

  return (
    <div className="max-w-[760px] mx-auto px-4 md:px-6 py-4 md:py-8">
      <h1 className="font-jakarta text-[18px] md:text-[22px] font-bold text-[#2D2D2D] mb-4 md:mb-6">結帳</h1>

      <div className="flex flex-col md:grid md:grid-cols-5 gap-4 md:gap-6">
        {/* Checkout form */}
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-3 md:space-y-4">
          {/* Shipping info */}
          <div className="bg-white rounded-[14px] border border-[#F0EFEC] p-4 md:p-5 space-y-3.5">
            <h2 className="font-jakarta font-semibold text-[#2D2D2D] text-[14px]">收件資訊</h2>

            <div>
              <label className={labelCls}>姓名 *</label>
              <input type="text" required value={form.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                className={inputCls} placeholder="王小明" />
            </div>
            <div>
              <label className={labelCls}>電子郵件 *</label>
              <input type="email" required value={form.customerEmail}
                onChange={(e) => handleChange('customerEmail', e.target.value)}
                className={inputCls} placeholder="example@email.com" />
            </div>
            <div>
              <label className={labelCls}>手機號碼</label>
              <input type="tel" value={form.customerPhone}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
                className={inputCls} placeholder="0912-345-678" />
            </div>
            <div>
              <label className={labelCls}>收件地址 *</label>
              <input type="text" required value={form.customerAddress}
                onChange={(e) => handleChange('customerAddress', e.target.value)}
                className={inputCls} placeholder="台北市信義區..." />
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-[14px] border border-[#F0EFEC] p-4 md:p-5">
            <h2 className="font-jakarta font-semibold text-[#2D2D2D] text-[14px] mb-3">付款方式</h2>
            <div className="flex items-start gap-3 rounded-[10px] p-3" style={{ background: '#F7F6F3' }}>
              <span className="text-[18px]">🏪</span>
              <div>
                <span className="font-jakarta font-medium text-[14px] text-[#2D2D2D]">賣貨便取貨付款</span>
                <p className="text-[12px] text-[#9E9E9E] mt-0.5">7-11 超商取貨，到貨後付款</p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-white rounded-[14px] border border-[#F0EFEC] p-4 md:p-5">
            <label className={labelCls}>訂單備註</label>
            <textarea value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="有任何特別需求請填寫..." />
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-100 rounded-[10px] p-3.5 text-[13px] text-red-500">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || cartItems.length === 0}
            className="w-full bg-[#7C9070] hover:bg-[#6a7d5f] disabled:bg-[#E0DDD8] disabled:text-[#8E8E93] text-white font-jakarta font-semibold text-[15px] py-3.5 rounded-[10px] transition-colors"
          >
            {submitting ? '處理中...' : `確認下單（NT$ ${total.toLocaleString('zh-TW')}）`}
          </button>
        </form>

        {/* Order summary */}
        <div className="md:col-span-2 space-y-3">
          <div className="bg-white rounded-[14px] border border-[#F0EFEC] p-4">
            <h2 className="font-jakarta font-semibold text-[#2D2D2D] text-[14px] mb-3">購物清單</h2>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between text-[13px]">
                  <span className="text-[#6B6B6B] line-clamp-1 flex-1">
                    {item.productName}
                    <span className="text-[#9E9E9E] ml-1">×{item.quantity}</span>
                  </span>
                  <span className="font-medium text-[#2D2D2D] ml-2">
                    NT$ {(item.price * item.quantity).toLocaleString('zh-TW')}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#F0EFEC] mt-3 pt-3 flex justify-between font-jakarta font-bold text-[14px]">
              <span className="text-[#2D2D2D]">合計</span>
              <span className="text-[#7C9070]">NT$ {total.toLocaleString('zh-TW')}</span>
            </div>
          </div>
          <Link href="/cart" className="block text-center text-[13px] text-[#7C9070] hover:underline">
            修改購物車
          </Link>
        </div>
      </div>
    </div>
  )
}

