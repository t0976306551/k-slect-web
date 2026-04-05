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
} from '../types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

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

export async function fetchCategories(): Promise<ApiResponse<CategorySummary[]>> {
  if (USE_MOCK) return mockFetchCategories()
  const res = await fetch('/api/v1/categories')
  return res.json() as Promise<ApiResponse<CategorySummary[]>>
}

export async function fetchCategoryById(id: string): Promise<ApiResponse<CategoryWithProducts>> {
  if (USE_MOCK) return mockFetchCategoryById(id)
  const res = await fetch(`/api/v1/categories/${id}`)
  return res.json() as Promise<ApiResponse<CategoryWithProducts>>
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
