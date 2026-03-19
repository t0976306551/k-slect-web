export interface ApiResponse<T> {
  data: T | null
  error: { code: string; message: string } | null
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  status: string
  categoryId: string
  category?: { id: string; name: string; slug: string }
  inventory?: { sku: string; quantity: number }
}

export interface OrderItem {
  productId: string
  quantity: number
}

export interface CreateOrderInput {
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress: string
  paymentMethod: 'bank_transfer' | 'seller_ship'
  note?: string
  items: OrderItem[]
}

export interface Order {
  id: string
  status: string
  paymentMethod: string
  totalAmount: number
  note: string | null
  createdAt: string
}

export async function fetchProducts(params?: {
  categoryId?: string
  q?: string
  status?: string
}): Promise<ApiResponse<Product[]>> {
  const query = new URLSearchParams()
  if (params?.categoryId) query.set('categoryId', params.categoryId)
  if (params?.q) query.set('q', params.q)
  if (params?.status) query.set('status', params.status)

  const url = `/api/v1/products${query.toString() ? `?${query.toString()}` : ''}`
  const res = await fetch(url)
  return res.json() as Promise<ApiResponse<Product[]>>
}

export async function fetchProduct(id: string): Promise<ApiResponse<Product>> {
  const res = await fetch(`/api/v1/products/${id}`)
  return res.json() as Promise<ApiResponse<Product>>
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<ApiResponse<Order>> {
  const res = await fetch('/api/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return res.json() as Promise<ApiResponse<Order>>
}

// --- Promotions ---

export type PromotionChannel = 'LINE' | 'FB'
export type PromotionStatus = 'draft' | 'sent' | 'scheduled' | 'failed'

export interface Promotion {
  id: string
  channel: PromotionChannel
  productIds: string[]
  message: string
  utmUrl: string | null
  status: PromotionStatus
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface CreatePromotionInput {
  channel: PromotionChannel
  productIds: string[]
  message: string
  utmUrl?: string
  status?: PromotionStatus
  metadata?: Record<string, unknown>
}

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
