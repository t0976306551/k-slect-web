/**
 * POST /api/v1/promotions/[id]/send-now
 *
 * 立即發送推廣訊息（跳過排程），依 platform 呼叫 LINE/FB API。
 * 推廣資料從後台 API 取得，發送完成後 PATCH 後台更新狀態。
 */

import { NextRequest, NextResponse } from 'next/server'
import { backendRequest } from '@/lib/backend'
import { broadcastLineMessage } from '@/lib/line'
import { createPagePost } from '@/lib/facebook'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type ApiSuccess<T> = { data: T; error: null }
type ApiError = { data: null; error: { code: string; message: string } }

function ok<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, error: null })
}

function fail(e: unknown): NextResponse<ApiError> {
  console.error('[promotions/send-now Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

type PromotionRecord = {
  id: string
  platform: string
  message: string
  utmUrl: string | null
  aiGeneratedCopy: Record<string, string> | null
  metadata: Record<string, unknown> | null
  status: string
}

/** 依 platform 取得要發送的文案 */
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

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteContext) {
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const { id } = await params

    // 從後台取得推廣資料
    const fetchResult = await backendRequest<PromotionRecord>(`/promotions/${id}`)
    if (fetchResult.error) {
      const status = fetchResult.error.code === 'NOT_FOUND' ? 404 : 500
      return NextResponse.json(fetchResult, { status })
    }

    const promotion = fetchResult.data

    if (promotion.status === 'sent') {
      return NextResponse.json(
        { data: null, error: { code: 'ALREADY_SENT', message: '此推廣已發送，不可重複發送' } },
        { status: 422 },
      )
    }

    const { lineCopy, fbCopy } = resolveCopy(promotion)
    const errors: string[] = []
    const metadata = promotion.metadata ?? {}

    // 發送 LINE 廣播
    if (lineCopy) {
      try {
        await broadcastLineMessage(lineCopy)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`LINE: ${msg}`)
        console.error('[send-now] LINE 發送失敗', err)
      }
    }

    // 發送 Facebook 貼文
    if (fbCopy) {
      const pageId = process.env.FACEBOOK_PAGE_ID
      const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN

      if (!pageId || !pageToken) {
        errors.push('Facebook: FACEBOOK_PAGE_ID 或 FACEBOOK_PAGE_ACCESS_TOKEN 未設定')
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
          console.error('[send-now] Facebook 發送失敗', err)
        }
      }
    }

    const allFailed = errors.length > 0 && !lineCopy && !fbCopy
    const partialFail = errors.length > 0 && (lineCopy || fbCopy)

    // 更新後台狀態
    const patchResult = await backendRequest<PromotionRecord>(`/promotions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: errors.length === 0 || partialFail ? 'sent' : 'failed',
        sentAt: new Date().toISOString(),
        scheduledAt: null,
        metadata: {
          ...metadata,
          last_error: errors.length > 0 ? errors.join('; ') : undefined,
        },
      }),
    })

    if (patchResult.error) {
      return NextResponse.json(patchResult, { status: 500 })
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          data: patchResult.data,
          error: { code: 'PARTIAL_FAILURE', message: `部分發送失敗：${errors.join('; ')}` },
        },
        { status: 207 },
      )
    }

    return ok(patchResult.data)
  } catch (e) {
    return fail(e)
  }
}
