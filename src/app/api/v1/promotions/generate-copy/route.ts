/**
 * POST /api/v1/promotions/generate-copy
 *
 * 使用 Claude AI 為指定商品生成 LINE / Facebook 雙平台行銷文案。
 * 需要環境變數：ANTHROPIC_API_KEY
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AppError, NotFoundError, ValidationError } from '@/lib/errors'
import { generatePromotionCopy, checkRateLimit } from '@/lib/claude'

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
  console.error('[generate-copy Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

const schema = z.object({
  productId: z.string().min(1),
  platform: z.enum(['line', 'facebook', 'both']).default('both'),
  lang: z.enum(['zh-TW', 'ja']).default('zh-TW'),
})

export async function POST(req: NextRequest) {
  try {
    // 速率限制（依 IP）
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'
    checkRateLimit(ip)

    const body: unknown = await req.json()
    const result = schema.safeParse(body)
    if (!result.success) {
      throw new ValidationError(result.error.issues.map((i) => i.message).join('; '))
    }

    const { productId, platform } = result.data

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        status: true,
        category: { select: { name: true } },
      },
    })

    if (!product || product.status !== 'active') {
      throw new NotFoundError(`找不到商品 ID: ${productId}`)
    }

    const copy = await generatePromotionCopy(
      {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category.name,
      },
      platform,
    )

    return ok({
      ...copy,
      productId,
      platform,
      generatedAt: new Date().toISOString(),
    })
  } catch (e) {
    return fail(e)
  }
}
