// 統一核心型別 — 匹配 k-slect-backend TypeORM 實體

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
  optionValues?: ProductOptionValue[]  // TypeORM ManyToMany 直接回傳陣列
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
  externalUrl: string | null
  origin: string | null
  category?: Pick<Category, 'id' | 'name' | 'slug'>
  inventory?: Pick<Inventory, 'sku' | 'quantity' | 'lowStockThreshold'>
  image?: string | null   // images[0]，API 層轉換後加入
  images: string[] | null // 商品圖片 URL 陣列（後台 jsonb nullable）
  descriptionImages?: string[] | null // 商品說明區塊圖片
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
export type CustomerStatus = 'active' | 'inactive' | 'blacklisted' | 'vip'

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
  productId: string | null
  productName: string      // 下單時商品名稱快照
  sku: string              // 下單時 SKU 快照
  image: string | null
  variantSnapshot?: Record<string, string> | null  // {"顏色":"紅色","尺寸":"M"}
  quantity: number
  priceAtOrder: number    // 下單當下價格快照
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

export type PaymentMethod = 'seller_ship' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface Order {
  id: string
  orderNo: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  trackingNo: string | null
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
  platform: string
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
