/**
 * GET /api/v1/cron/send-promotions
 *
 * Vercel Cron Job 端點（每分鐘執行）。
 * 掃描待發送的排程推廣並執行，含樂觀鎖防重複、失敗重試（最多 3 次）。
 *
 * 驗證：Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
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

/** 依 platform 取得發送文案 */
function resolveCopy(promotion: {
  platform: string
  message: string
  aiGeneratedCopy: Prisma.JsonValue | null
}): { lineCopy: string | null; fbCopy: string | null } {
  const ai = promotion.aiGeneratedCopy as Record<string, string> | null

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
async function sendPromotion(promotion: {
  id: string
  platform: string
  message: string
  utmUrl: string | null
  aiGeneratedCopy: Prisma.JsonValue | null
  metadata: Prisma.JsonValue | null
}): Promise<SendResult> {
  const { lineCopy, fbCopy } = resolveCopy(promotion)
  const errors: string[] = []
  const metadata = (promotion.metadata as Record<string, unknown>) ?? {}
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
    await prisma.promotion.update({
      where: { id: promotion.id },
      data: {
        status: 'sent',
        sendStatus: 'sent',
        sentAt: new Date(),
        metadata: metadata as Prisma.InputJsonValue,
      },
    })
    return { id: promotion.id, status: 'sent' }
  }

  const errorMsg = errors.join('; ')
  const nextRetry = retryCount + 1

  if (nextRetry >= MAX_RETRY) {
    // 重試次數耗盡 → 標記失敗
    await prisma.promotion.update({
      where: { id: promotion.id },
      data: {
        status: 'failed',
        sendStatus: 'failed',
        metadata: {
          ...metadata,
          retry_count: nextRetry,
          last_error: errorMsg,
        } as Prisma.InputJsonValue,
      },
    })
    return { id: promotion.id, status: 'failed', error: errorMsg }
  }

  // 安排下次重試（+5分鐘）
  await prisma.promotion.update({
    where: { id: promotion.id },
    data: {
      scheduledAt: new Date(Date.now() + RETRY_INTERVAL_MS),
      sendStatus: 'pending',
      metadata: {
        ...metadata,
        retry_count: nextRetry,
        last_error: errorMsg,
      } as Prisma.InputJsonValue,
    },
  })
  return { id: promotion.id, status: 'retry', error: errorMsg }
}

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

    const now = new Date()

    // 使用 updateMany 進行樂觀鎖：同時將符合條件的推廣標記為 in-process
    // 策略：先查詢，再在單一交易內更新 + 發送
    const pending = await prisma.promotion.findMany({
      where: {
        status: 'scheduled',
        sendStatus: 'pending',
        scheduledAt: { lte: now },
      },
      orderBy: { scheduledAt: 'asc' },
      take: BATCH_SIZE,
    })

    if (pending.length === 0) {
      return ok({ processed: 0, results: [] })
    }

    // 樂觀鎖：先鎖定（sendStatus 改成特殊狀態避免其他 cron 重複抓取）
    const ids = pending.map((p) => p.id)
    const locked = await prisma.promotion.updateMany({
      where: {
        id: { in: ids },
        sendStatus: 'pending', // 只鎖還是 pending 的（防 race）
      },
      data: { sendStatus: 'failed' }, // 暫時標記為失敗，成功後再改 sent
    })

    if (locked.count === 0) {
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
