/**
 * GET /api/v1/promotions/scheduled
 *
 * 查詢排程中的推廣清單，包含倒計時資訊。
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'

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
  console.error('[promotions/scheduled Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100)
    const offset = Number(searchParams.get('offset') ?? '0')

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where: {
          status: 'scheduled',
          sendStatus: 'pending',
        },
        orderBy: { scheduledAt: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.promotion.count({
        where: {
          status: 'scheduled',
          sendStatus: 'pending',
        },
      }),
    ])

    const now = new Date()
    const items = promotions.map((p) => ({
      ...p,
      secondsUntilSend: p.scheduledAt
        ? Math.max(0, Math.floor((p.scheduledAt.getTime() - now.getTime()) / 1000))
        : null,
    }))

    return ok({ promotions: items, total, limit, offset })
  } catch (e) {
    return fail(e)
  }
}
