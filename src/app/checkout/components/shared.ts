import type { CartItem } from '@/lib/cart'
import { getMerchantBankAccount } from '@/lib/merchant'
import type { CreateOrderInput, PaymentMethod, ShippingMethod, ShippingProvider } from '@/types'

export interface FormState {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  note: string
  paymentMethod: PaymentMethod
  shippingMethod: ShippingMethod
  shippingProvider: ShippingProvider
  pickupStoreCode: string
  pickupStoreName: string
}

export const INITIAL_FORM: FormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress: '',
  note: '',
  paymentMethod: 'bank_transfer',
  shippingMethod: 'cvs_pickup',
  shippingProvider: 'seven_eleven',
  pickupStoreCode: '',
  pickupStoreName: '',
}

export const CVS_PROVIDERS: readonly {
  readonly value: ShippingProvider
  readonly label: string
  readonly desc: string
}[] = [
  { value: 'seven_eleven', label: '7-11', desc: '統一超商取貨' },
  { value: 'family_mart', label: '全家', desc: '全家便利商店取貨' },
] as const

export const INPUT_CLS =
  'w-full border border-[#E8E8E8] bg-white rounded-[10px] px-4 py-3 text-[14px] text-[#2D2D2D] placeholder:text-[#C8C8C8] focus:outline-none focus:border-[#7C9070] focus:ring-2 focus:ring-[#7C9070]/10 transition-all'

export const LABEL_CLS =
  'block text-[11px] font-medium tracking-[0.05em] uppercase text-[#9E9E9E] mb-2'

/** 表單驗證，回傳錯誤訊息或 null */
export function validateForm(form: FormState): string | null {
  if (form.shippingMethod === 'cvs_pickup' && !form.pickupStoreName.trim()) {
    return '請填寫取貨門市'
  }
  if (form.shippingMethod === 'home_delivery' && !form.customerAddress.trim()) {
    return '請填寫收件地址'
  }
  return null
}

/** 從表單狀態 + 購物車品項組裝 createOrder 的 payload */
export function buildOrderPayload(form: FormState, cartItems: readonly CartItem[]): CreateOrderInput {
  const isCvs = form.shippingMethod === 'cvs_pickup'
  const isCvsProvider =
    form.shippingProvider === 'seven_eleven' || form.shippingProvider === 'family_mart'

  return {
    customerName: form.customerName,
    customerEmail: form.customerEmail,
    customerPhone: form.customerPhone || undefined,
    customerAddress: isCvs
      ? form.pickupStoreCode
        ? `${form.pickupStoreName}（${form.pickupStoreCode}）`
        : form.pickupStoreName
      : form.customerAddress,
    paymentMethod: form.paymentMethod,
    shippingMethod: form.shippingMethod,
    shippingProvider: form.shippingProvider,
    pickupStore:
      isCvs && isCvsProvider
        ? { provider: form.shippingProvider as 'seven_eleven' | 'family_mart', storeCode: form.pickupStoreCode, storeName: form.pickupStoreName }
        : null,
    bankTransferInfoSnapshot:
      form.paymentMethod === 'bank_transfer' ? getMerchantBankAccount() : undefined,
    note: form.note || undefined,
    items: cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  }
}
