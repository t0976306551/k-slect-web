/**
 * LINE 推廣訊息工具
 *
 * MVP 策略（無 API 審核需求）：
 * - 產生格式化推廣文案，讓賣家一鍵複製後手動貼到 LINE 群組
 * - UTM 追蹤連結自動附加
 *
 * 未來擴充（需 LINE Official Account 申請通過後）：
 * - LINE Messaging API 廣播訊息（LINE_CHANNEL_ACCESS_TOKEN）
 * - Flex Message 商品卡片
 *
 * 申請流程：https://tw.linebiz.com/service/line-official-account/
 */

import type { CartItem } from '@/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://k-slect.com'

export interface ProductInfo {
  id: string
  name: string
  price: number
  imageUrl?: string
  description?: string
}

export interface LineMessagePayload {
  /** 純文字訊息（複製用） */
  text: string
  /** 帶 UTM 的商品連結 */
  productUrl: string
}

/** 產生 UTM 追蹤連結 */
function buildUtmUrl(productId: string, source = 'line', campaign = 'product-promo'): string {
  const url = new URL(`${SITE_URL}/products/${productId}`)
  url.searchParams.set('utm_source', source)
  url.searchParams.set('utm_medium', 'social')
  url.searchParams.set('utm_campaign', campaign)
  return url.toString()
}

/** 產生韓系風格的 LINE 推廣訊息（單一商品） */
export function buildLineMessage(product: ProductInfo): LineMessagePayload {
  const productUrl = buildUtmUrl(product.id)

  const descSnippet = product.description
    ? product.description.slice(0, 50) + (product.description.length > 50 ? '…' : '')
    : ''

  const lines: string[] = [
    '✨ 韓貨新品到啦！',
    '',
    `【${product.name}】`,
  ]

  if (descSnippet) lines.push(descSnippet)

  lines.push(
    '',
    `💰 售價：NT$${product.price.toLocaleString('zh-TW')}`,
    `🛒 立即選購：${productUrl}`,
    '',
    '#Kslect #韓貨 #韓系',
  )

  return { text: lines.join('\n'), productUrl }
}

/** 產生多商品推廣訊息 */
export function buildMultiProductLineMessage(products: ProductInfo[]): LineMessagePayload {
  if (products.length === 0) throw new Error('至少需要一個商品')

  const firstProduct = products[0]!
  const productUrl = buildUtmUrl(firstProduct.id, 'line', 'multi-promo')

  const lines: string[] = [
    '🛍️ K-slect 韓貨特選！',
    '',
    ...products.map(
      (p) =>
        `• ${p.name} — NT$${p.price.toLocaleString('zh-TW')}`,
    ),
    '',
    `🔗 查看全部商品：${productUrl}`,
    '',
    '#Kslect #韓貨 #韓系特選',
  ]

  return { text: lines.join('\n'), productUrl }
}

/** 產生購物車 LINE 訊息文字 */
export function buildCartLineMessage(items: CartItem[]): string {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const lines: string[] = ['您好！我想詢問以下商品：', '', '商品清單：']
  items.forEach((item, i) => {
    const spec = item.variantLabel ? `（${item.variantLabel}）` : ''
    const subtotal = item.price * item.quantity
    lines.push(`${i + 1}. ${item.productName}${spec} x ${item.quantity} NT$${subtotal.toLocaleString('zh-TW')}`)
  })
  lines.push('', `合計：NT$${total.toLocaleString('zh-TW')}`, '', '請問如何訂購與付款？謝謝！')
  return lines.join('\n')
}

/** 產生帶購物車訊息的 LINE OA 聯絡 URL */
export function buildLineContactUrl(items: CartItem[]): string {
  const oaId = process.env.NEXT_PUBLIC_LINE_OA_ID
  if (!oaId) {
    console.warn('[line.ts] NEXT_PUBLIC_LINE_OA_ID 未設定，fallback 到 LINE 首頁')
    return 'https://line.me'
  }
  const message = buildCartLineMessage(items)
  return `https://line.me/R/oaMessage/${oaId}/?text=${encodeURIComponent(message)}`
}

/**
 * LINE Messaging API 廣播（需 Official Account 申請通過）
 *
 * @throws Error 若 LINE_CHANNEL_ACCESS_TOKEN 未設定
 */
export async function broadcastLineMessage(text: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN 尚未設定，請先完成 LINE Official Account 申請')
  }

  const res = await fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ type: 'text', text }],
    }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`LINE 廣播失敗：${res.status} ${error}`)
  }
}
