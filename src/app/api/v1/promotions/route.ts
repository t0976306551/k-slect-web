import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { AppError, ValidationError } from '@/lib/errors'

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

const createPromotionSchema = z.object({
  channel: z.enum(['LINE', 'FB']),
  productIds: z.array(z.string().min(1)).min(1),
  message: z.string().min(1),
  utmUrl: z.string().url().optional(),
  status: z.enum(['draft', 'sent', 'scheduled', 'failed']).default('draft'),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/** GET /api/v1/promotions — 列出推廣紀錄 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const channel = searchParams.get('channel') ?? undefined
    const status = searchParams.get('status') ?? undefined
    const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100)
    const offset = Number(searchParams.get('offset') ?? '0')

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where: {
          ...(channel ? { channel } : {}),
          ...(status ? { status } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.promotion.count({
        where: {
          ...(channel ? { channel } : {}),
          ...(status ? { status } : {}),
        },
      }),
    ])

    return ok({ promotions, total, limit, offset })
  } catch (e) {
    return fail(e)
  }
}

/** POST /api/v1/promotions — 建立推廣紀錄 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown
    const parsed = createPromotionSchema.safeParse(body)

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((i) => i.message).join('; '))
    }

    const { channel, productIds, message, utmUrl, status, metadata } = parsed.data

    const promotion = await prisma.promotion.create({
      data: {
        channel,
        productIds,
        message,
        utmUrl: utmUrl ?? null,
        status,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    })

    return ok(promotion, 201)
  } catch (e) {
    return fail(e)
  }
}
