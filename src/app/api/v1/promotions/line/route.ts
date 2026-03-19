/**
 * POST /api/v1/promotions/line
 *
 * 根據選取的商品 ID 列表，產生 LINE 推廣訊息（一鍵複製用）。
 * MVP：不需要 LINE API 金鑰，直接回傳格式化文字。
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError, ValidationError } from '@/lib/errors'
import { buildLineMessage, buildMultiProductLineMessage } from '@/lib/line'

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
  console.error('[Promotions/LINE Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

const linePromoSchema = z.object({
  /** 1–10 個商品 ID */
  productIds: z.array(z.string().min(1)).min(1).max(10),
})

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    const result = linePromoSchema.safeParse(body)
    if (!result.success) {
      throw new ValidationError(result.error.message)
    }

    const { productIds } = result.data

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'active' },
      select: { id: true, name: true, price: true, description: true },
    })

    if (products.length === 0) {
      throw new NotFoundError('找不到指定商品')
    }

    const normalized = products.map((p) => ({
      ...p,
      description: p.description ?? undefined,
    }))

    const payload =
      normalized.length === 1
        ? buildLineMessage(normalized[0]!)
        : buildMultiProductLineMessage(normalized)

    return ok({
      text: payload.text,
      productUrl: payload.productUrl,
      productCount: products.length,
    })
  } catch (e) {
    return fail(e)
  }
}
