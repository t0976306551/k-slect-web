'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCart, getCartTotal, clearCart } from '@/lib/cart'
import { createOrder } from '@/lib/api'
import type { CartItem } from '@/lib/cart'

type PaymentMethod = 'bank_transfer' | 'seller_ship'

interface FormState {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  paymentMethod: PaymentMethod
  note: string
}

const INITIAL_FORM: FormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress: '',
  paymentMethod: 'bank_transfer',
  note: '',
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const items = getCart()
    if (items.length === 0) {
      router.replace('/cart')
      return
    }
    setCartItems(items)
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
        paymentMethod: form.paymentMethod,
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
        setOrderId(res.data?.id ?? null)
      }
    } catch {
      setSubmitError('下單失敗，請稍後再試或聯繫客服')
    } finally {
      setSubmitting(false)
    }
  }

  // 訂單成功畫面
  if (orderId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800">下單成功！</h2>
        <p className="text-gray-500 text-sm">
          訂單編號：<span className="font-mono text-purple-600 font-semibold">{orderId}</span>
        </p>

        {form.paymentMethod === 'bank_transfer' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left text-sm">
            <h3 className="font-semibold text-yellow-800 mb-2">付款說明</h3>
            <p className="text-yellow-700">
              請在 24 小時內完成銀行轉帳，並將匯款帳號後 5 碼傳送給我們確認。
            </p>
          </div>
        )}

        {form.paymentMethod === 'seller_ship' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left text-sm">
            <h3 className="font-semibold text-blue-800 mb-2">取貨說明</h3>
            <p className="text-blue-700">
              我們會以賣貨便寄送，到貨後請至超商取貨並付款。
            </p>
          </div>
        )}

        <Link
          href="/products"
          className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
        >
          繼續購物
        </Link>
      </div>
    )
  }

  const total = getCartTotal(cartItems)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">結帳</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* 結帳表單 */}
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-purple-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">收件資訊</h2>

            <div>
              <label className="block text-sm text-gray-600 mb-1">姓名 *</label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="王小明"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">電子郵件 *</label>
              <input
                type="email"
                required
                value={form.customerEmail}
                onChange={(e) => handleChange('customerEmail', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">手機號碼</label>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="0912-345-678"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">收件地址 *</label>
              <input
                type="text"
                required
                value={form.customerAddress}
                onChange={(e) => handleChange('customerAddress', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="台北市信義區..."
              />
            </div>
          </div>

          {/* 付款方式 */}
          <div className="bg-white rounded-xl border border-purple-100 p-6 space-y-3">
            <h2 className="font-semibold text-gray-800">付款方式</h2>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={form.paymentMethod === 'bank_transfer'}
                onChange={() => handleChange('paymentMethod', 'bank_transfer')}
                className="mt-1 accent-purple-600"
              />
              <div>
                <span className="font-medium text-sm text-gray-800">銀行轉帳</span>
                <p className="text-xs text-gray-400 mt-0.5">下單後 24 小時內完成匯款</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="seller_ship"
                checked={form.paymentMethod === 'seller_ship'}
                onChange={() => handleChange('paymentMethod', 'seller_ship')}
                className="mt-1 accent-purple-600"
              />
              <div>
                <span className="font-medium text-sm text-gray-800">賣貨便取貨付款</span>
                <p className="text-xs text-gray-400 mt-0.5">超商取貨，到貨後付款</p>
              </div>
            </label>
          </div>

          {/* 備註 */}
          <div className="bg-white rounded-xl border border-purple-100 p-6">
            <label className="block text-sm text-gray-600 mb-1">訂單備註</label>
            <textarea
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
              placeholder="有任何特別需求請填寫..."
            />
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || cartItems.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {submitting ? '處理中...' : `確認下單（NT$ ${total.toLocaleString('zh-TW')}）`}
          </button>
        </form>

        {/* 購物清單摘要 */}
        <div className="md:col-span-2 space-y-3">
          <div className="bg-white rounded-xl border border-purple-100 p-4">
            <h2 className="font-semibold text-gray-800 mb-3">購物清單</h2>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1">
                    {item.productName}
                    <span className="text-gray-400 ml-1">×{item.quantity}</span>
                  </span>
                  <span className="font-medium text-gray-800 ml-2">
                    NT$ {(item.price * item.quantity).toLocaleString('zh-TW')}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold">
              <span>合計</span>
              <span className="text-purple-700">NT$ {total.toLocaleString('zh-TW')}</span>
            </div>
          </div>
          <Link
            href="/cart"
            className="block text-center text-sm text-purple-500 hover:underline"
          >
            修改購物車
          </Link>
        </div>
      </div>
    </div>
  )
}
