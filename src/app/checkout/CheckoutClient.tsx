'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, AlertCircle } from 'lucide-react'
import { getCart, getCartTotal, clearCart } from '@/lib/cart'
import { createOrder, fetchAccountProfile } from '@/lib/api'
import type { CartItem } from '@/lib/cart'
import type { ShippingMethod } from '@/types'
import { INITIAL_FORM, validateForm, buildOrderPayload } from './components/shared'
import type { FormState } from './components/shared'
import ContactInfoSection from './components/ContactInfoSection'
import ShippingMethodSection from './components/ShippingMethodSection'
import PaymentMethodSection from './components/PaymentMethodSection'
import OrderNoteSection from './components/OrderNoteSection'
import OrderSummary from './components/OrderSummary'
import { DesktopSubmitButton, MobileSubmitButton } from './components/SubmitButton'

const FORM_ID = 'checkout-form'

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

    let active = true
    async function loadProfile() {
      try {
        const res = await fetchAccountProfile()
        if (!active) return
        setForm((prev) => {
          const next = { ...prev }
          if (savedEmail && !next.customerEmail) next.customerEmail = savedEmail
          if (res.data) {
            const p = res.data
            if (!next.customerName && p.name) next.customerName = p.name
            if (p.email) next.customerEmail = p.email
            if (!next.customerPhone && p.phone) next.customerPhone = p.phone
            if (!next.customerAddress && p.address) next.customerAddress = p.address
            if (p.defaultShippingMethod) next.shippingMethod = p.defaultShippingMethod
            if (p.defaultShippingProvider) {
              next.shippingProvider = p.defaultShippingProvider
            } else if (p.defaultShippingMethod === 'home_delivery') {
              next.shippingProvider = 'black_cat'
            }
          }
          return next
        })
      } catch {
        if (!active) return
        if (savedEmail) {
          setForm((prev) => ({ ...prev, customerEmail: savedEmail }))
        }
      }
    }
    loadProfile()
    return () => { active = false }
  }, [router])

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleShippingMethodChange(method: ShippingMethod) {
    setForm((prev) => ({
      ...prev,
      shippingMethod: method,
      shippingProvider:
        method === 'home_delivery'
          ? 'black_cat'
          : prev.shippingProvider === 'black_cat'
            ? 'seven_eleven'
            : prev.shippingProvider,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (cartItems.length === 0) return

    const validationError = validateForm(form)
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await createOrder(buildOrderPayload(form, cartItems))

      if (res.error) {
        setSubmitError(res.error.message)
        return
      }

      clearCart()
      localStorage.setItem('customer_email', form.customerEmail)
      const id = res.data?.id ?? ''
      const orderTotal = res.data?.totalAmount ?? getCartTotal(cartItems)
      const page = form.paymentMethod === 'bank_transfer' ? 'bank-transfer' : 'success'
      router.replace(`/checkout/${page}?orderId=${encodeURIComponent(id)}&total=${orderTotal}`)
    } catch {
      setSubmitError('下單失敗，請稍後再試或聯繫客服')
    } finally {
      setSubmitting(false)
    }
  }

  const total = getCartTotal(cartItems)
  const buttonDisabled = submitting || cartItems.length === 0

  return (
    <>
      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-6 md:py-10 pb-[96px] md:pb-10">
        {/* 頁面標題 */}
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
          {/* 左欄：表單 */}
          <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
            <ContactInfoSection form={form} onChange={handleChange} />
            <ShippingMethodSection
              form={form}
              onChange={handleChange}
              onShippingMethodChange={handleShippingMethodChange}
            />
            <PaymentMethodSection />
            <OrderNoteSection note={form.note} onChange={handleChange} />

            {submitError && (
              <div className="flex gap-2.5 bg-red-50 border border-red-100 rounded-[12px] p-4 text-[13px] text-red-500">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <DesktopSubmitButton submitting={submitting} disabled={buttonDisabled} total={total} />
          </form>

          {/* 右欄：訂單摘要 */}
          <OrderSummary items={cartItems} total={total} />
        </div>
      </div>

      <MobileSubmitButton
        formId={FORM_ID}
        submitting={submitting}
        disabled={buttonDisabled}
        total={total}
      />
    </>
  )
}
