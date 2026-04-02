import type { ApiResponse, Product, Order } from './api'
import { mockProducts, mockCategories } from './mock-data'

export interface ProductWithMeta extends Product {
  image: string
  rating: number
  reviewCount: number
  soldCount: number
  tag?: string
  originalPrice?: number
}

function toProductWithMeta(p: (typeof mockProducts)[0]): ProductWithMeta {
  const now = new Date().toISOString()
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? null,
    price: p.price,
    status: 'active',
    categoryId: p.category,
    image: p.image,
    rating: p.rating,
    reviewCount: p.reviewCount,
    soldCount: p.soldCount,
    tag: p.tag,
    originalPrice: p.originalPrice,
    createdAt: now,
    updatedAt: now,
    inventory: { sku: `mock-${p.id}`, quantity: 99, lowStockThreshold: 5 },
  }
}

export async function mockFetchProducts(params?: {
  categoryId?: string
  q?: string
}): Promise<ApiResponse<ProductWithMeta[]>> {
  let results = mockProducts.map(toProductWithMeta)
  if (params?.categoryId) {
    results = results.filter((p) => p.categoryId === params.categoryId)
  }
  if (params?.q) {
    const q = params.q.toLowerCase()
    results = results.filter((p) => p.name.toLowerCase().includes(q))
  }
  return { data: results, error: null }
}

export async function mockFetchProduct(
  idOrSlug: string,
): Promise<ApiResponse<ProductWithMeta>> {
  const product = mockProducts.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug,
  )
  if (!product) {
    return { data: null, error: { code: 'NOT_FOUND', message: '商品不存在' } }
  }
  return { data: toProductWithMeta(product), error: null }
}

export async function mockCreateOrder(input: {
  customerName: string
  customerAddress: string
  paymentMethod: string
  items: Array<{ productId: string; quantity: number }>
}): Promise<ApiResponse<Order>> {
  const now = new Date().toISOString()

  const totalAmount = input.items.reduce((sum, item) => {
    const product = mockProducts.find((p) => p.id === item.productId || p.slug === item.productId)
    return sum + (product?.price ?? 0) * item.quantity
  }, 0)

  const order: Order = {
    id: `ORD-${Date.now()}`,
    customerId: 'mock-customer',
    status: 'pending_ship',
    paymentMethod: 'seller_ship',
    paymentStatus: 'pending',
    totalAmount,
    note: null,
    createdAt: now,
    updatedAt: now,
  }
  return { data: order, error: null }
}

export interface MockCategory {
  id: string
  slug: string
  name: string
  icon: string
  color: string
  productCount: number
}

export function mockFetchCategories(): ApiResponse<MockCategory[]> {
  const data = mockCategories.map((c) => ({
    ...c,
    productCount: mockProducts.filter((p) => p.category === c.slug).length,
  }))
  return { data, error: null }
}

export interface MockCategoryProduct {
  id: string
  name: string
  slug: string | null
  price: number
  status: string
  image: string
  inventory: { quantity: number } | null
}

export interface MockCategoryData {
  id: string
  name: string
  slug: string
  products: MockCategoryProduct[]
}

export async function mockFetchCategoryById(
  id: string,
): Promise<ApiResponse<MockCategoryData>> {
  const found = mockCategories.find((c) => c.id === id)
  if (!found) {
    return { data: null, error: { code: 'NOT_FOUND', message: '分類不存在' } }
  }

  const filteredProducts = mockProducts
    .map(toProductWithMeta)
    .filter((p) => p.categoryId === found.slug)

  return {
    data: {
      id,
      name: found.name,
      slug: found.slug,
      products: filteredProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        status: p.status,
        image: p.image,
        inventory: { quantity: 99 },
      })),
    },
    error: null,
  }
}
