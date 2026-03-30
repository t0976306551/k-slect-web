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
    status: 'pending_payment',
    paymentMethod: (input.paymentMethod as Order['paymentMethod']) ?? 'bank_transfer',
    paymentStatus: 'pending',
    totalAmount,
    note: null,
    createdAt: now,
    updatedAt: now,
  }
  return { data: order, error: null }
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

export async function mockFetchCategoryBySlug(
  slug: string,
): Promise<ApiResponse<MockCategoryData>> {
  // 'hot' 和 'new' 是虛擬分類，用銷量與上架時間篩選
  let catId = slug
  let catName = slug

  const found = mockCategories.find((c) => c.id === slug)
  if (!found && slug !== 'hot' && slug !== 'new') {
    return { data: null, error: { code: 'NOT_FOUND', message: '分類不存在' } }
  }
  if (found) catName = found.name

  let filteredProducts = mockProducts.map(toProductWithMeta)

  if (slug === 'hot') {
    catName = '熱銷推薦'
    filteredProducts = [...filteredProducts].sort((a, b) => b.soldCount - a.soldCount)
  } else if (slug === 'new') {
    catName = '新品上架'
    filteredProducts = [...filteredProducts].slice().reverse()
  } else {
    filteredProducts = filteredProducts.filter((p) => p.categoryId === catId)
  }

  return {
    data: {
      id: catId,
      name: catName,
      slug,
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
