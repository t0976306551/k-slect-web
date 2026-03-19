/**
 * Claude AI 整合模組
 *
 * 使用 claude-haiku-4-5-20251001（低成本高速）生成雙平台行銷文案。
 * 環境變數：ANTHROPIC_API_KEY
 */

import Anthropic from '@anthropic-ai/sdk'
import { AppError } from './errors'

/** 速率限制：記憶體 Map，5 次/分鐘/IP */
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60_000

export function checkRateLimit(ip: string): void {
  const now = Date.now()
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (timestamps.length >= RATE_LIMIT) {
    throw new AppError('請求過於頻繁，請稍後再試', 'RATE_LIMIT_EXCEEDED', 429)
  }
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
}

export interface GeneratedCopy {
  line: string
  facebook: string
}

export interface ProductContext {
  name: string
  description?: string | null
  price: number
  category?: string | null
}

function buildPrompt(product: ProductContext, platform: 'line' | 'facebook' | 'both'): string {
  const priceStr = `NT$${product.price.toLocaleString('zh-TW')}`
  const desc = product.description ? `\n商品描述：${product.description}` : ''
  const cat = product.category ? `\n分類：${product.category}` : ''

  const lineReq = platform !== 'facebook'
    ? 'LINE 版本：100字以內，含 2-3 個 emoji，活潑語氣，附 #Kslect #韓貨 hashtag'
    : ''
  const fbReq = platform !== 'line'
    ? 'Facebook 版本：150-200字，含 emoji，敘事感，附 3-5 個相關 hashtag'
    : ''

  const platformReq = [lineReq, fbReq].filter(Boolean).join('\n')

  return `你是韓貨電商 K-slect 的行銷文案專家。請根據以下商品資訊，生成正體中文（台灣用語）行銷文案。

商品名稱：${product.name}${desc}${cat}
售價：${priceStr}

請生成以下格式的 JSON（只回傳 JSON，不要其他文字）：
{
  "line": "LINE 推廣文案",
  "facebook": "Facebook 推廣文案"
}

${platformReq}
注意：使用台灣正體中文用詞，避免大陸用語。`
}

/** 呼叫 Claude API 生成雙平台行銷文案 */
export async function generatePromotionCopy(
  product: ProductContext,
  platform: 'line' | 'facebook' | 'both',
): Promise<GeneratedCopy> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new AppError('ANTHROPIC_API_KEY 未設定', 'AI_CONFIG_MISSING', 500)
  }

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: '你是韓貨電商行銷文案專家，只回傳合法 JSON，不附任何說明文字。',
    messages: [
      {
        role: 'user',
        content: buildPrompt(product, platform),
      },
    ],
  })

  const rawText = response.content[0]?.type === 'text' ? response.content[0].text.trim() : ''

  // 清理可能的 markdown code block
  const jsonText = rawText.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new AppError('AI 文案解析失敗，請重試', 'AI_PARSE_ERROR', 502)
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).line !== 'string' ||
    typeof (parsed as Record<string, unknown>).facebook !== 'string'
  ) {
    throw new AppError('AI 回應格式不符，請重試', 'AI_FORMAT_ERROR', 502)
  }

  const copy = parsed as GeneratedCopy

  // 若只需單平台，沿用另一個欄位的值（避免空字串）
  if (platform === 'line') {
    return { line: copy.line, facebook: copy.line }
  }
  if (platform === 'facebook') {
    return { line: copy.facebook, facebook: copy.facebook }
  }

  return copy
}
