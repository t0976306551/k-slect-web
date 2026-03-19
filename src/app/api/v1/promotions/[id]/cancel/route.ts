/**
 * POST /api/v1/promotions/[id]/cancel
 *
 * 取消排程推廣。只有 sendStatus=pending 的排程才可取消。
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError } from '@/lib/errors'

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
  console.error('[promotions/cancel Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

type RouteParams = { params: { id: string } }

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: params.id },
    })

    if (!promotion) {
      throw new NotFoundError(`推廣紀錄 ${params.id} 不存在`)
    }

    if (promotion.sendStatus !== 'pending') {
      throw new AppError(
        `此推廣已 ${promotion.sendStatus === 'sent' ? '發送' : '失敗'}，無法取消`,
        'CANNOT_CANCEL',
        422,
      )
    }

    if (promotion.status !== 'scheduled') {
      throw new AppError('只有排程中的推廣才可取消', 'CANNOT_CANCEL', 422)
    }

    const updated = await prisma.promotion.update({
      where: { id: params.id },
      data: {
        status: 'draft',
        scheduledAt: null,
      },
    })

    return ok(updated)
  } catch (e) {
    return fail(e)
  }
}
