import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { buildLineMessage, buildMultiProductLineMessage, type ProductInfo } from '@/lib/line'
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
  console.error('[LINE Message API Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

const lineMessageSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1, '至少需要一個商品 ID'),
})

/**
 * POST /api/v1/promotions/line-message
 *
 * 根據商品 ID 陣列，生成 LINE 推廣訊息模板
 * MVP 設計：無需 LINE API 申請，賣家複製文案後手動貼至 LINE 群組
 *
 * Request body:
 *   { productIds: string[] }
 *
 * Response:
 *   { text: string, productUrl: string, products: ProductInfo[] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown
    const parsed = lineMessageSchema.safeParse(body)

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((i) => i.message).join('; '))
    }

    const { productIds } = parsed.data

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'active' },
      include: {
        inventory: { select: { sku: true, quantity: true } },
      },
    })

    if (dbProducts.length === 0) {
      throw new NotFoundError('找不到指定的商品，請確認商品 ID 及上架狀態')
    }

    const products: ProductInfo[] = dbProducts.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description ?? undefined,
    }))

    const payload =
      products.length === 1
        ? buildLineMessage(products[0]!)
        : buildMultiProductLineMessage(products)

    return ok({
      text: payload.text,
      productUrl: payload.productUrl,
      products: products.map((p) => ({ id: p.id, name: p.name, price: p.price })),
    })
  } catch (e) {
    return fail(e)
  }
}
