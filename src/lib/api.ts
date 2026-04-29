import { mockFetchProducts, mockFetchProduct, mockCreateOrder, mockFetchCategoryById, mockFetchCategories } from './mock-handlers'
import type {
  ApiResponse,
  Product,
  ProductWithMeta,
  Order,
  OrderStatus,
  PaymentMethod,
  Promotion,
  PromotionChannel,
  PromotionStatus,
  CreateOrderInput,
  CreatePromotionInput,
  LineMessageResult,
  CartItem,
  CategorySummary,
  CategoryWithProducts,
  CategoryProductItem,
  MemberProfile,
  BankTransferReport,
} from '../types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

// 重新 export，讓現有頁面元件仍可從 api.ts import，無需改動所有頁面
export type {
  ApiResponse,
  Product,
  ProductWithMeta,
  Order,
  OrderStatus,
  PaymentMethod,
  Promotion,
  PromotionChannel,
  PromotionStatus,
  CreateOrderInput,
  CreatePromotionInput,
  LineMessageResult,
  CartItem,
  CategorySummary,
  CategoryWithProducts,
  CategoryProductItem,
}

// 向後相容的別名（現有頁面從 api.ts import 的舊名稱）
export type MockCategory = CategorySummary
export type MockCategoryData = CategoryWithProducts
export type MockCategoryProduct = CategoryProductItem

// ── 共用 fetch 工具 ──

/** SSR 環境需要絕對 URL；瀏覽器端相對 URL 即可 */
function withBase(url: string): string {
  if (typeof window !== 'undefined') return url
  const base = process.env.NEXTAUTH_URL
  if (!base) throw new Error('NEXTAUTH_URL is required for server-side data fetching')
  return `${base.replace(/\/$/, '')}${url}`
}

const FETCH_TIMEOUT_MS = 10_000

/** GET 請求，回傳 ApiResponse<T> */
async function apiGet<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(withBase(url), { ...init, signal: controller.signal })
    return (await res.json()) as ApiResponse<T>
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { data: null, error: { code: 'TIMEOUT', message: '請求逾時，請稍後再試' } }
    }
    return { data: null, error: { code: 'NETWORK_ERROR', message: '網路錯誤，請稍後再試' } }
  } finally {
    clearTimeout(timer)
  }
}

/** POST/PATCH/DELETE 請求，回傳 ApiResponse<T> */
async function apiMutate<T>(
  url: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<ApiResponse<T>> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(withBase(url), {
      method,
      headers: JSON_HEADERS,
      signal: controller.signal,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
    return (await res.json()) as ApiResponse<T>
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { data: null, error: { code: 'TIMEOUT', message: '請求逾時，請稍後再試' } }
    }
    return { data: null, error: { code: 'NETWORK_ERROR', message: '網路錯誤，請稍後再試' } }
  } finally {
    clearTimeout(timer)
  }
}

/** 將 params 物件轉成 query string（過濾 undefined） */
function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value))
  }
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

// ── Account profile ──

export async function fetchAccountProfile(): Promise<ApiResponse<MemberProfile>> {
  return apiGet('/api/v1/account/profile', { cache: 'no-store' })
}

export async function updateAccountProfile(
  patch: Partial<Omit<MemberProfile, 'email'>>,
): Promise<ApiResponse<MemberProfile>> {
  return apiMutate('/api/v1/account/profile', 'PATCH', patch)
}

// ── Bank transfer report ──

export async function fetchBankTransferReport(
  orderId: string,
): Promise<ApiResponse<BankTransferReport | null>> {
  if (USE_MOCK) {
    return { data: null, error: null }
  }
  return apiGet(`/api/v1/orders/${encodeURIComponent(orderId)}/bank-transfer-report`)
}

export async function submitBankTransferReport(
  orderId: string,
  input: { last5: string; transferredAt?: string | null; note?: string | null },
): Promise<ApiResponse<BankTransferReport>> {
  if (USE_MOCK) {
    const report: BankTransferReport = {
      orderId,
      last5: input.last5,
      transferredAt: input.transferredAt ?? null,
      note: input.note ?? null,
      reportedAt: new Date().toISOString(),
    }
    return { data: report, error: null }
  }
  return apiMutate(
    `/api/v1/orders/${encodeURIComponent(orderId)}/bank-transfer-report`,
    'POST',
    input,
  )
}

// ── Products ──

export async function fetchProducts(params?: {
  categoryId?: string
  q?: string
}): Promise<ApiResponse<Product[]>> {
  if (USE_MOCK) return mockFetchProducts(params)
  const qs = buildQuery({
    categoryId: params?.categoryId,
    q: params?.q,
  })
  return apiGet(`/api/v1/products${qs}`)
}

export async function fetchProduct(id: string): Promise<ApiResponse<ProductWithMeta>> {
  if (USE_MOCK) return mockFetchProduct(id)
  return apiGet(`/api/v1/products/${id}`)
}

// ── Orders ──

export async function createOrder(input: CreateOrderInput): Promise<ApiResponse<Order>> {
  if (USE_MOCK) return mockCreateOrder(input)
  return apiMutate('/api/v1/orders', 'POST', input)
}

// ── Categories ──

export async function fetchCategories(): Promise<ApiResponse<CategorySummary[]>> {
  if (USE_MOCK) return mockFetchCategories()
  return apiGet('/api/v1/categories')
}

export async function fetchCategoryById(id: string): Promise<ApiResponse<CategoryWithProducts>> {
  if (USE_MOCK) return mockFetchCategoryById(id)
  return apiGet(`/api/v1/categories/${id}`)
}

// ── Promotions ──

export async function fetchPromotions(params?: {
  channel?: PromotionChannel
  status?: PromotionStatus
  limit?: number
  offset?: number
}): Promise<ApiResponse<{ promotions: Promotion[]; total: number; limit: number; offset: number }>> {
  const qs = buildQuery({
    channel: params?.channel,
    status: params?.status,
    limit: params?.limit,
    offset: params?.offset,
  })
  return apiGet(`/api/v1/promotions${qs}`)
}

export async function createPromotion(
  input: CreatePromotionInput,
): Promise<ApiResponse<Promotion>> {
  return apiMutate('/api/v1/promotions', 'POST', input)
}

export async function deletePromotion(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiMutate(`/api/v1/promotions/${id}`, 'DELETE')
}

export async function generateLineMessage(
  productIds: string[],
): Promise<ApiResponse<LineMessageResult>> {
  return apiMutate('/api/v1/promotions/line-message', 'POST', { productIds })
}

export async function generateUtmUrl(params: {
  productId: string
  source?: string
  medium?: string
  campaign?: string
}): Promise<ApiResponse<{ url: string; params: { source: string; medium: string; campaign: string } }>> {
  const qs = buildQuery({
    productId: params.productId,
    source: params.source,
    medium: params.medium,
    campaign: params.campaign,
  })
  return apiGet(`/api/v1/promotions/utm${qs}`)
}
