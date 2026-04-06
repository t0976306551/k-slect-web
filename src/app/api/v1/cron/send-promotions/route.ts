/**
 * GET /api/v1/cron/send-promotions
 *
 * Vercel Cron Job 端點（每分鐘執行）。
 * 掃描待發送的排程推廣並執行，含失敗重試（最多 3 次）。
 * 推廣資料從後台 API 取得，狀態更新透過後台 API 寫入。
 *
 * 驗證：Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server'
import { backendRequest } from '@/lib/backend'
import { broadcastLineMessage } from '@/lib/line'
import { createPagePost } from '@/lib/facebook'

export const dynamic = 'force-dynamic'
// Vercel Cron 最大執行時間限制
export const maxDuration = 10

const BATCH_SIZE = 10
const RETRY_INTERVAL_MS = 5 * 60 * 1000 // 5 分鐘
const MAX_RETRY = 3

type ApiSuccess<T> = { data: T; error: null }
type ApiError = { data: null; error: { code: string; message: string } }

function ok<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, error: null })
}

function unauthorized(): NextResponse<ApiError> {
  return NextResponse.json(
    { data: null, error: { code: 'UNAUTHORIZED', message: '未授權' } },
    { status: 401 },
  )
}

function fail(e: unknown): NextResponse<ApiError> {
  console.error('[cron/send-promotions Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

interface SendResult {
  id: string
  status: 'sent' | 'retry' | 'failed'
  error?: string
}

type PromotionRecord = {
  id: string
  platform: string
  message: string
  utmUrl: string | null
  aiGeneratedCopy: Record<string, string> | null
  metadata: Record<string, unknown> | null
  status: string
  scheduledAt: string | null
}

/** 依 platform 取得發送文案 */
function resolveCopy(promotion: PromotionRecord): { lineCopy: string | null; fbCopy: string | null } {
  const ai = promotion.aiGeneratedCopy

  const lineCopy =
    ['line', 'both', 'LINE'].includes(promotion.platform)
      ? (ai?.line ?? promotion.message)
      : null

  const fbCopy =
    ['facebook', 'both', 'FB'].includes(promotion.platform)
      ? (ai?.facebook ?? promotion.message)
      : null

  return { lineCopy, fbCopy }
}

/** 發送單一推廣，回傳成功/失敗訊息 */
async function sendPromotion(promotion: PromotionRecord): Promise<SendResult> {
  const { lineCopy, fbCopy } = resolveCopy(promotion)
  const errors: string[] = []
  const metadata = promotion.metadata ?? {}
  const retryCount = (metadata.retry_count as number) ?? 0

  if (lineCopy) {
    try {
      await broadcastLineMessage(lineCopy)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`LINE: ${msg}`)
    }
  }

  if (fbCopy) {
    const pageId = process.env.FACEBOOK_PAGE_ID
    const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN

    if (!pageId || !pageToken) {
      errors.push('Facebook: 環境變數未設定')
    } else {
      try {
        const postId = await createPagePost(pageId, pageToken, {
          message: fbCopy,
          link: promotion.utmUrl ?? undefined,
        })
        metadata.fb_post_id = postId
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`Facebook: ${msg}`)
      }
    }
  }

  if (errors.length === 0) {
    // 全部成功
    await backendRequest(`/promotions/${promotion.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'sent',
        sentAt: new Date().toISOString(),
        metadata,
      }),
    })
    return { id: promotion.id, status: 'sent' }
  }

  const errorMsg = errors.join('; ')
  const nextRetry = retryCount + 1

  if (nextRetry >= MAX_RETRY) {
    // 重試次數耗盡 → 標記失敗
    await backendRequest(`/promotions/${promotion.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'failed',
        metadata: {
          ...metadata,
          retry_count: nextRetry,
          last_error: errorMsg,
        },
      }),
    })
    return { id: promotion.id, status: 'failed', error: errorMsg }
  }

  // 安排下次重試（+5分鐘）
  await backendRequest(`/promotions/${promotion.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      scheduledAt: new Date(Date.now() + RETRY_INTERVAL_MS).toISOString(),
      metadata: {
        ...metadata,
        retry_count: nextRetry,
        last_error: errorMsg,
      },
    }),
  })
  return { id: promotion.id, status: 'retry', error: errorMsg }
}

type PromotionListResponse = { promotions: PromotionRecord[]; total: number }

export async function GET(req: NextRequest) {
  try {
    // 驗證 CRON_SECRET
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
      if (token !== cronSecret) {
        return unauthorized()
      }
    }

    // 取得待發送的排程推廣
    const now = new Date().toISOString()
    const fetchResult = await backendRequest<PromotionListResponse>(
      `/promotions?status=scheduled&scheduledBefore=${encodeURIComponent(now)}&limit=${BATCH_SIZE}`,
    )

    if (fetchResult.error) {
      return NextResponse.json(fetchResult, { status: 500 })
    }

    const pending = fetchResult.data.promotions

    if (pending.length === 0) {
      return ok({ processed: 0, results: [] })
    }

    const results: SendResult[] = []

    for (const promotion of pending) {
      const result = await sendPromotion(promotion)
      results.push(result)
    }

    const summary = {
      processed: results.length,
      sent: results.filter((r) => r.status === 'sent').length,
      retry: results.filter((r) => r.status === 'retry').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    }

    console.info('[cron/send-promotions] 執行完成', summary)

    return ok(summary)
  } catch (e) {
    return fail(e)
  }
}
