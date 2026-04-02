// 統一核心型別 — 匹配 Prisma schema + 前後台共用

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string } }

// --- Category ---
export interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  parent?: Pick<Category, 'id' | 'name' | 'slug'> | null
  children?: Category[]
  _count?: { products: number }
  createdAt: string
  updatedAt: string
}

// --- Inventory ---
export interface Inventory {
  id: string
  productId: string
  sku: string
  quantity: number
  lowStockThreshold: number
  createdAt: string
  updatedAt: string
}

// --- Product Variants ---
export interface ProductOptionValue {
  id: string
  optionId: string
  value: string
  position: number
}

export interface ProductOption {
  id: string
  productId: string
  name: string
  position: number
  values: ProductOptionValue[]
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  price: number | null    // null = 沿用 Product.price
  image: string | null
  quantity: number
  lowStockThreshold: number
  status: string
  variantOptions: Array<{
    variantId: string
    optionValueId: string
    optionValue: ProductOptionValue
  }>
}

// --- Product ---
export interface Product {
  id: string
  name: string
  slug: string | null
  description: string | null
  price: number           // 台幣，整數
  status: 'active' | 'inactive'
  categoryId: string
  category?: Pick<Category, 'id' | 'name' | 'slug'>
  inventory?: Pick<Inventory, 'sku' | 'quantity' | 'lowStockThreshold'>
  images?: string[]       // 商品圖片 URL 陣列（未來 schema 擴充）
  options?: ProductOption[]
  variants?: ProductVariant[]
  createdAt: string
  updatedAt: string
}

// --- Customer ---
export type CustomerStatus = 'active' | 'blacklisted' | 'vip'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  tags: string[]
  note: string | null
  status: CustomerStatus
  _count?: { orders: number }
  createdAt: string
  updatedAt: string
}

// --- OrderItem ---
export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: Pick<Product, 'id' | 'name' | 'slug'>
  variantId?: string | null
  variantSnapshot?: Record<string, string> | null  // {"顏色":"紅色","尺寸":"M"}
  quantity: number
  priceAtOrder: number    // 下單當下價格快照（Prisma schema 欄位名）
  createdAt: string
  updatedAt: string
}

// --- Order ---
export type OrderStatus =
  | 'pending_ship'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded'

export type PaymentMethod = 'seller_ship'
export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface Order {
  id: string
  customerId: string
  customer?: Customer
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  totalAmount: number     // 台幣，整數
  note: string | null
  items?: OrderItem[]
  createdAt: string
  updatedAt: string
}

// --- Promotion ---
export type PromotionChannel = 'LINE' | 'FB'
export type PromotionStatus = 'draft' | 'scheduled' | 'sent' | 'failed'

export interface Promotion {
  id: string
  channel: PromotionChannel
  platform: string        // 'line' | 'facebook' | 'both'
  productIds: string[]
  message: string
  utmUrl: string | null
  status: PromotionStatus
  scheduledAt: string | null
  sentAt: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// --- Create Inputs ---
export interface CreateOrderInput {
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress: string
  paymentMethod: PaymentMethod
  note?: string
  items: Array<{ productId: string; quantity: number; variantId?: string }>
}

// --- Cart（前台專用）---
export interface CartItem {
  readonly productId: string
  readonly productName: string
  readonly price: number
  quantity: number
  readonly image?: string
  readonly slug?: string
  readonly variantId?: string
  readonly variantLabel?: string  // 顯示用，例如 "紅色 / M"
}
