import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError, ValidationError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

type ApiSuccess<T> = { data: T; error: null }
type ApiError = { data: null; error: { code: string; message: string } }

function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, error: null }, { status })
}

function fail(e: unknown): NextResponse<ApiError> {
  if (e instanceof AppError) {
    return NextResponse.json(
      { data: null, error: { code: e.code, message: e.message } },
      { status: e.statusCode },
    )
  }
  console.error('[Promotions API Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

const updatePromotionSchema = z.object({
  status: z.enum(['draft', 'sent', 'scheduled', 'failed']).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

type RouteParams = { params: { id: string } }

/** GET /api/v1/promotions/[id] — 取得單一推廣紀錄 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: params.id },
    })

    if (!promotion) {
      throw new NotFoundError(`推廣紀錄 ${params.id} 不存在`)
    }

    return ok(promotion)
  } catch (e) {
    return fail(e)
  }
}

/** PATCH /api/v1/promotions/[id] — 更新推廣紀錄狀態 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const existing = await prisma.promotion.findUnique({ where: { id: params.id } })
    if (!existing) {
      throw new NotFoundError(`推廣紀錄 ${params.id} 不存在`)
    }

    const body = await req.json() as unknown
    const parsed = updatePromotionSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((i) => i.message).join('; '))
    }

    const updated = await prisma.promotion.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.metadata !== undefined
          ? { metadata: parsed.data.metadata as Prisma.InputJsonValue }
          : {}),
      },
    })

    return ok(updated)
  } catch (e) {
    return fail(e)
  }
}

/** DELETE /api/v1/promotions/[id] — 刪除推廣紀錄 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const existing = await prisma.promotion.findUnique({ where: { id: params.id } })
    if (!existing) {
      throw new NotFoundError(`推廣紀錄 ${params.id} 不存在`)
    }

    await prisma.promotion.delete({ where: { id: params.id } })

    return ok({ deleted: true })
  } catch (e) {
    return fail(e)
  }
}
