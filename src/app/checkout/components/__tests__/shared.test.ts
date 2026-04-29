import { describe, it, expect, vi } from 'vitest'
import { buildOrderPayload, validateForm, INITIAL_FORM } from '../shared'
import type { FormState } from '../shared'
import type { CartItem } from '@/lib/cart'

vi.mock('@/lib/merchant', () => ({
  getMerchantBankAccount: () => ({
    bankName: '測試銀行',
    bankCode: '000',
    branchName: '總行',
    accountName: '測試帳戶',
    accountNumber: '1234567890',
    paymentDeadlineHours: 24,
  }),
}))

const BASE_FORM: FormState = {
  ...INITIAL_FORM,
  customerName: '王小明',
  customerEmail: 'test@example.com',
  customerPhone: '0912345678',
  shippingMethod: 'cvs_pickup',
  shippingProvider: 'seven_eleven',
  pickupStoreName: '中山門市',
  pickupStoreCode: '123456',
}

const ITEM_WITHOUT_VARIANT: CartItem = {
  productId: 'prod-001',
  productName: '測試商品',
  price: 500,
  quantity: 2,
  variantId: undefined,
  variantLabel: undefined,
}

const ITEM_WITH_VARIANT: CartItem = {
  productId: 'prod-002',
  productName: '有規格商品',
  price: 300,
  quantity: 1,
  variantId: 'variant-uuid-abc',
  variantLabel: '紅色 / M',
}

// ── buildOrderPayload ────────────────────────────────────────────────────────

describe('buildOrderPayload', () => {
  it('應包含 variantId 在有規格的商品中', () => {
    const payload = buildOrderPayload(BASE_FORM, [ITEM_WITH_VARIANT])
    expect(payload.items[0].variantId).toBe('variant-uuid-abc')
  })

  it('無規格商品 variantId 應為 undefined', () => {
    const payload = buildOrderPayload(BASE_FORM, [ITEM_WITHOUT_VARIANT])
    expect(payload.items[0].variantId).toBeUndefined()
  })

  it('混合商品，各自 variantId 正確', () => {
    const payload = buildOrderPayload(BASE_FORM, [ITEM_WITHOUT_VARIANT, ITEM_WITH_VARIANT])
    expect(payload.items).toHaveLength(2)
    expect(payload.items[0].variantId).toBeUndefined()
    expect(payload.items[1].variantId).toBe('variant-uuid-abc')
  })

  it('items 包含正確的 productId 和 quantity', () => {
    const payload = buildOrderPayload(BASE_FORM, [ITEM_WITH_VARIANT])
    expect(payload.items[0]).toMatchObject({
      productId: 'prod-002',
      quantity: 1,
      variantId: 'variant-uuid-abc',
    })
  })

  it('超商取貨時 customerAddress 含門市名稱與代碼', () => {
    const payload = buildOrderPayload(BASE_FORM, [ITEM_WITHOUT_VARIANT])
    expect(payload.customerAddress).toBe('中山門市（123456）')
  })

  it('宅配時 customerAddress 為填寫的地址', () => {
    const form: FormState = {
      ...BASE_FORM,
      shippingMethod: 'home_delivery',
      shippingProvider: 'black_cat',
      customerAddress: '台北市中山區中山北路一段1號',
    }
    const payload = buildOrderPayload(form, [ITEM_WITHOUT_VARIANT])
    expect(payload.customerAddress).toBe('台北市中山區中山北路一段1號')
  })

  it('空 phone 應為 undefined', () => {
    const form: FormState = { ...BASE_FORM, customerPhone: '' }
    const payload = buildOrderPayload(form, [ITEM_WITHOUT_VARIANT])
    expect(payload.customerPhone).toBeUndefined()
  })
})

// ── validateForm ─────────────────────────────────────────────────────────────

describe('validateForm', () => {
  it('完整表單應回傳 null', () => {
    expect(validateForm(BASE_FORM)).toBeNull()
  })

  it('未填姓名應回傳錯誤', () => {
    expect(validateForm({ ...BASE_FORM, customerName: '' })).toBe('請填寫收件人姓名')
    expect(validateForm({ ...BASE_FORM, customerName: '   ' })).toBe('請填寫收件人姓名')
  })

  it('未填 email 應回傳錯誤', () => {
    expect(validateForm({ ...BASE_FORM, customerEmail: '' })).toBe('請填寫電子郵件')
  })

  it('email 格式有誤應回傳錯誤', () => {
    expect(validateForm({ ...BASE_FORM, customerEmail: 'not-an-email' })).toBe('電子郵件格式有誤')
    expect(validateForm({ ...BASE_FORM, customerEmail: 'no@tld' })).toBe('電子郵件格式有誤')
    expect(validateForm({ ...BASE_FORM, customerEmail: '@nodomain.com' })).toBe('電子郵件格式有誤')
  })

  it('合法 email 不應回傳格式錯誤', () => {
    expect(validateForm({ ...BASE_FORM, customerEmail: 'user@example.com' })).toBeNull()
    expect(validateForm({ ...BASE_FORM, customerEmail: 'user+tag@sub.domain.tw' })).toBeNull()
  })

  it('超商取貨但未填門市應回傳錯誤', () => {
    expect(
      validateForm({ ...BASE_FORM, shippingMethod: 'cvs_pickup', pickupStoreName: '' }),
    ).toBe('請填寫取貨門市')
  })

  it('宅配但未填地址應回傳錯誤', () => {
    expect(
      validateForm({
        ...BASE_FORM,
        shippingMethod: 'home_delivery',
        shippingProvider: 'black_cat',
        customerAddress: '',
      }),
    ).toBe('請填寫收件地址')
  })
})
