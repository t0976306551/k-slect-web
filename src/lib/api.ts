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
