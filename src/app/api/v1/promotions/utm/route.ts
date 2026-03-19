import { NextRequest, NextResponse } from 'next/server'
import { AppError, ValidationError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://k-slect.com'

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
  console.error('[UTM API Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

/**
 * GET /api/v1/promotions/utm
 *
 * 產生帶 UTM 參數的商品追蹤連結
 *
 * Query params:
 *   productId  (必填) 商品 ID
 *   source     (選填) utm_source，預設 line
 *   medium     (選填) utm_medium，預設 social
 *   campaign   (選填) utm_campaign，預設 product-promo
 *
 * Response:
 *   { url: string, params: { source, medium, campaign } }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const productId = searchParams.get('productId')
    if (!productId) {
      throw new ValidationError('productId 為必填參數')
    }

    const source = searchParams.get('source') ?? 'line'
    const medium = searchParams.get('medium') ?? 'social'
    const campaign = searchParams.get('campaign') ?? 'product-promo'

    const url = new URL(`${SITE_URL}/products/${encodeURIComponent(productId)}`)
    url.searchParams.set('utm_source', source)
    url.searchParams.set('utm_medium', medium)
    url.searchParams.set('utm_campaign', campaign)

    return ok({
      url: url.toString(),
      params: { source, medium, campaign },
    })
  } catch (e) {
    return fail(e)
  }
}
