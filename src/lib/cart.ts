export interface CartItem {
  readonly productId: string
  readonly productName: string
  readonly price: number
  quantity: number
}

const CART_KEY = 'k_slect_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function addToCart(item: Omit<CartItem, 'quantity'>): CartItem[] {
  const cart = getCart()
  const existing = cart.find((i) => i.productId === item.productId)
  if (existing) {
    const updated = cart.map((i) =>
      i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
    )
    saveCart(updated)
    return updated
  }
  const updated = [...cart, { ...item, quantity: 1 }]
  saveCart(updated)
  return updated
}

export function updateQuantity(productId: string, quantity: number): CartItem[] {
  const cart = getCart()
  if (quantity <= 0) {
    return removeFromCart(productId)
  }
  const updated = cart.map((i) =>
    i.productId === productId ? { ...i, quantity } : i
  )
  saveCart(updated)
  return updated
}

export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart()
  const updated = cart.filter((i) => i.productId !== productId)
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
