import { mockFetchProducts, mockFetchProduct, mockCreateOrder, mockFetchCategoryById, mockFetchCategories } from './mock-handlers'
import type { MockCategoryData, MockCategoryProduct, ProductWithMeta, MockCategory } from './mock-handlers'
import type {
  ApiResponse,
  Product,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Promotion,
  PromotionChannel,
  PromotionStatus,
  CreateOrderInput,
  CartItem,
} from '../types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

// 重新 export，讓現有頁面元件仍可從 api.ts import，無需改動所有頁面
export type {
  ApiResponse,
  Product,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Promotion,
  PromotionChannel,
  PromotionStatus,
  CreateOrderInput,
  CartItem,
}

// 局部使用：create promotion 的輸入（僅 api.ts 內部邏輯需要）
interface CreatePromotionInput {
  channel: PromotionChannel
  productIds: string[]
  message: string
  utmUrl?: string
  status?: PromotionStatus
  metadata?: Record<string, unknown>
}

export async function fetchProducts(params?: {
  categoryId?: string
  q?: string
  status?: string
}): Promise<ApiResponse<Product[]>> {
  if (USE_MOCK) return mockFetchProducts(params)
  const query = new URLSearchParams()
  if (params?.categoryId) query.set('categoryId', params.categoryId)
  if (params?.q) query.set('q', params.q)
  if (params?.status) query.set('status', params.status)

  const url = `/api/v1/products${query.toString() ? `?${query.toString()}` : ''}`
  const res = await fetch(url)
  return res.json() as Promise<ApiResponse<Product[]>>
}

export async function fetchProduct(id: string): Promise<ApiResponse<ProductWithMeta>> {
  if (USE_MOCK) return mockFetchProduct(id)
  const res = await fetch(`/api/v1/products/${id}`)
  return res.json() as Promise<ApiResponse<ProductWithMeta>>
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<ApiResponse<Order>> {
  if (USE_MOCK) return mockCreateOrder(input)
  const res = await fetch('/api/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return res.json() as Promise<ApiResponse<Order>>
}

export type { MockCategoryData, MockCategoryProduct, MockCategory }
export type { ProductWithMeta }

export async function fetchCategories(): Promise<ApiResponse<MockCategory[]>> {
  if (USE_MOCK) return mockFetchCategories()
  const res = await fetch('/api/v1/categories')
  return res.json() as Promise<ApiResponse<MockCategory[]>>
}

export async function fetchCategoryById(id: string): Promise<ApiResponse<MockCategoryData>> {
  if (USE_MOCK) return mockFetchCategoryById(id)
  const res = await fetch(`/api/v1/categories/${id}`)
  return res.json() as Promise<ApiResponse<MockCategoryData>>
}

// --- Promotions ---

export async function fetchPromotions(params?: {
  channel?: PromotionChannel
  status?: PromotionStatus
  limit?: number
  offset?: number
}): Promise<ApiResponse<{ promotions: Promotion[]; total: number; limit: number; offset: number }>> {
  const query = new URLSearchParams()
  if (params?.channel) query.set('channel', params.channel)
  if (params?.status) query.set('status', params.status)
  if (params?.limit !== undefined) query.set('limit', String(params.limit))
  if (params?.offset !== undefined) query.set('offset', String(params.offset))

  const url = `/api/v1/promotions${query.toString() ? `?${query.toString()}` : ''}`
  const res = await fetch(url)
  return res.json() as Promise<ApiResponse<{ promotions: Promotion[]; total: number; limit: number; offset: number }>>
}

export async function createPromotion(
  input: CreatePromotionInput,
): Promise<ApiResponse<Promotion>> {
  const res = await fetch('/api/v1/promotions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return res.json() as Promise<ApiResponse<Promotion>>
}

export async function deletePromotion(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  const res = await fetch(`/api/v1/promotions/${id}`, { method: 'DELETE' })
  return res.json() as Promise<ApiResponse<{ deleted: boolean }>>
}

export interface LineMessageResult {
  text: string
  productUrl: string
  products: Array<{ id: string; name: string; price: number }>
}

export async function generateLineMessage(
  productIds: string[],
): Promise<ApiResponse<LineMessageResult>> {
  const res = await fetch('/api/v1/promotions/line-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productIds }),
  })
  return res.json() as Promise<ApiResponse<LineMessageResult>>
}

export async function generateUtmUrl(params: {
  productId: string
  source?: string
  medium?: string
  campaign?: string
}): Promise<ApiResponse<{ url: string; params: { source: string; medium: string; campaign: string } }>> {
  const query = new URLSearchParams({ productId: params.productId })
  if (params.source) query.set('source', params.source)
  if (params.medium) query.set('medium', params.medium)
  if (params.campaign) query.set('campaign', params.campaign)

  const res = await fetch(`/api/v1/promotions/utm?${query.toString()}`)
  return res.json() as Promise<ApiResponse<{ url: string; params: { source: string; medium: string; campaign: string } }>>
}
