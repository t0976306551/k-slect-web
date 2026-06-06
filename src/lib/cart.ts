import type { CartItem } from '@/types'

export type { CartItem }

const CART_KEY = 'k_slect_cart'

function cartItemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function addToCart(item: Omit<CartItem, 'quantity'>): CartItem[] {
  const cart = getCart()
  const key = cartItemKey(item.productId, item.variantId)
  const existing = cart.find((i) => cartItemKey(i.productId, i.variantId) === key)
  if (existing) {
    const updated = cart.map((i) =>
      cartItemKey(i.productId, i.variantId) === key ? { ...i, quantity: i.quantity + 1 } : i
    )
    saveCart(updated)
    return updated
  }
  const updated = [...cart, { ...item, quantity: 1 }]
  saveCart(updated)
  return updated
}

export function updateQuantity(productId: string, quantity: number, variantId?: string): CartItem[] {
  const cart = getCart()
  if (quantity <= 0) {
    return removeFromCart(productId, variantId)
  }
  const key = cartItemKey(productId, variantId)
  const updated = cart.map((i) =>
    cartItemKey(i.productId, i.variantId) === key ? { ...i, quantity } : i
  )
  saveCart(updated)
  return updated
}

export function removeFromCart(productId: string, variantId?: string): CartItem[] {
  const cart = getCart()
  const key = cartItemKey(productId, variantId)
  const updated = cart.filter((i) => cartItemKey(i.productId, i.variantId) !== key)
  saveCart(updated)
  return updated
}

export function clearCart(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_KEY)
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}
