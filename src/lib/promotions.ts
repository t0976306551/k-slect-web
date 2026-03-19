export type PromotionChannel = 'LINE' | 'FB'

export interface PromotionRecord {
  readonly id: string
  readonly productIds: readonly string[]
  readonly productNames: readonly string[]
  readonly channel: PromotionChannel
  readonly message: string
  readonly createdAt: string
}

const PROMOTIONS_KEY = 'k_slect_promotions'

export function getPromotions(): PromotionRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PROMOTIONS_KEY)
    return raw ? (JSON.parse(raw) as PromotionRecord[]) : []
  } catch {
    return []
  }
}

export function addPromotion(
  record: Omit<PromotionRecord, 'id' | 'createdAt'>,
): PromotionRecord {
  const newRecord: PromotionRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const existing = getPromotions()
  const updated = [newRecord, ...existing]
  localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(updated))
  return newRecord
}

export function generateLineMessage(products: { name: string; price: number; id: string }[]): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://k-slect.com'

  if (products.length === 1) {
    const p = products[0]
    const utmUrl = `${origin}/products/${p.id}?utm_source=line&utm_medium=social&utm_campaign=promotion`
    const desc = p.name.slice(0, 50)
    return [
      '✨ 韓貨新品到啦！',
      '',
      p.name,
      desc !== p.name ? desc : '',
      '',
      `💰 售價：NT$${p.price.toLocaleString('zh-TW')}`,
      `🛒 立即選購：${utmUrl}`,
      '',
      '#Kslect #韓貨 #韓系',
    ]
      .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
      .join('\n')
  }

  const lines = [
    '✨ 韓貨精選推薦！',
    '',
    ...products.map((p, i) => {
      const utmUrl = `${origin}/products/${p.id}?utm_source=line&utm_medium=social&utm_campaign=promotion`
      return `${i + 1}. ${p.name} — NT$${p.price.toLocaleString('zh-TW')}\n   🛒 ${utmUrl}`
    }),
    '',
    '#Kslect #韓貨 #韓系',
  ]
  return lines.join('\n')
}
