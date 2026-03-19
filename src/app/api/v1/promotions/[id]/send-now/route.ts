/**
 * POST /api/v1/promotions/[id]/send-now
 *
 * 立即發送推廣訊息（跳過排程），依 platform 呼叫 LINE/FB API。
 */

import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError } from '@/lib/errors'
import { broadcastLineMessage } from '@/lib/line'
import { createPagePost } from '@/lib/facebook'

export const dynamic = 'force-dynamic'

type ApiSuccess<T> = { data: T; error: null }
type ApiError = { data: null; error: { code: string; message: string } }

function ok<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, error: null })
}

function fail(e: unknown): NextResponse<ApiError> {
  if (e instanceof AppError) {
    return NextResponse.json(
      { data: null, error: { code: e.code, message: e.message } },
      { status: e.statusCode },
    )
  }
  console.error('[promotions/send-now Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

type RouteParams = { params: { id: string } }

/** 依 platform 取得要發送的文案 */
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

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: params.id },
    })

    if (!promotion) {
      throw new NotFoundError(`推廣紀錄 ${params.id} 不存在`)
    }

    if (promotion.sendStatus === 'sent') {
      throw new AppError('此推廣已發送，不可重複發送', 'ALREADY_SENT', 422)
    }

    const { lineCopy, fbCopy } = resolveCopy(promotion)
    const errors: string[] = []
    const metadata = (promotion.metadata as Record<string, unknown>) ?? {}

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

    const updated = await prisma.promotion.update({
      where: { id: params.id },
      data: {
        status: errors.length === 0 || partialFail ? 'sent' : 'failed',
        sendStatus: errors.length === 0 ? 'sent' : allFailed ? 'failed' : 'sent',
        sentAt: new Date(),
        scheduledAt: null,
        metadata: {
          ...metadata,
          last_error: errors.length > 0 ? errors.join('; ') : undefined,
        } as Prisma.InputJsonValue,
      },
    })

    if (errors.length > 0) {
      return NextResponse.json(
        {
          data: updated,
          error: { code: 'PARTIAL_FAILURE', message: `部分發送失敗：${errors.join('; ')}` },
        },
        { status: 207 },
      )
    }

    return ok(updated)
  } catch (e) {
    return fail(e)
  }
}
