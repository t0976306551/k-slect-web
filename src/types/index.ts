// 統一核心型別 — 匹配 Prisma schema（k-slect-web 後端）

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

// 分類摘要（列表頁顯示用，含商品數量與 UI 顯示欄位）
export interface CategorySummary {
  id: string
  slug: string
  name: string
  parentId: string | null
  icon?: string    // UI 顯示用，後端不回傳
  color?: string   // UI 顯示用，後端不回傳
  productCount: number
}

// 分類詳情（含商品列表）
export interface CategoryWithProducts {
  id: string
  name: string
  slug: string
  products: CategoryProductItem[]
}

export interface CategoryProductItem {
  id: string
  name: string
  slug: string | null
  price: number
  status: string
  image: string | null
  inventory: { quantity: number } | null
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
// Prisma 透過 ProductVariantOption join model 回傳，保留完整結構
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
  originalPrice?: number | null  // 原價（劃線價）
  status: 'active' | 'inactive'
  categoryId: string
  category?: Pick<Category, 'id' | 'name' | 'slug'>
  inventory?: Pick<Inventory, 'sku' | 'quantity' | 'lowStockThreshold'>
  image?: string | null   // images[0]，API 層轉換後加入
  images: string[] // 商品圖片 URL 陣列
  options?: ProductOption[]
  variants?: ProductVariant[]
  createdAt: string
  updatedAt: string
}

// 前台商品展示（含 UI 顯示用欄位）
export interface ProductWithMeta extends Product {
  image: string | null
  originalPrice?: number | null
  rating: number
  reviewCount: number
  soldCount: number
  tag?: string
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
  product?: Pick<Product, 'id' | 'name'>  // Prisma select 只回傳 id + name
  variantId?: string | null
  variantSnapshot?: Record<string, string> | null  // {"顏色":"紅色","尺寸":"M"}
  quantity: number
  priceAtOrder: number    // 下單當下價格快照
  createdAt: string
  updatedAt: string
}

// --- Order ---
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export type PaymentMethod = 'seller_ship' | 'bank_transfer'

export interface Order {
  id: string
  customerId: string
  customer?: Customer
  status: OrderStatus
  paymentMethod: PaymentMethod
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

// --- API Inputs ---
export interface CreateOrderInput {
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress: string
  paymentMethod: PaymentMethod
  note?: string
  items: Array<{ productId: string; quantity: number; variantId?: string }>
}

export interface CreatePromotionInput {
  channel: PromotionChannel
  productIds: string[]
  message: string
  utmUrl?: string
  status?: PromotionStatus
  metadata?: Record<string, unknown>
}

export interface LineMessageResult {
  text: string
  productUrl: string
  products: Array<{ id: string; name: string; price: number }>
}

// --- Cart（前台專用）---
export interface CartItem {
  readonly productId: string
  readonly productName: string
  readonly price: number
  quantity: number
  readonly image?: string | null
  readonly slug?: string
  readonly variantId?: string
  readonly variantLabel?: string  // 顯示用，例如 "紅色 / M"
}
