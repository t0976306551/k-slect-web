/**
 * POST /api/v1/promotions/facebook/post
 *
 * 發佈商品推廣貼文到 Facebook 粉絲專頁。
 * 支援：單一圖文貼文、多商品輪播貼文、排程發佈。
 *
 * 前置條件：Meta App Review 通過，且賣家已完成 OAuth 授權。
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { storefrontRequest } from '@/lib/backend'
import { AppError, NotFoundError, ValidationError } from '@/lib/errors'
import { createPagePost, createCarouselPost } from '@/lib/facebook'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://k-slect.com'

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
  console.error('[Facebook Post Error]', e)
  return NextResponse.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤' } },
    { status: 500 },
  )
}

const fbPostSchema = z.object({
  /** 粉絲專頁 ID */
  pageId: z.string().min(1),
  /** 粉絲專頁 access token（從 OAuth 流程取得） */
  pageAccessToken: z.string().min(1),
  /** 要推廣的商品 ID 列表（1 個 = 一般貼文；2–10 個 = 輪播） */
  productIds: z.array(z.string().min(1)).min(1).max(10),
  /** 自訂貼文文案（選填；不填則自動生成） */
  message: z.string().max(2000).optional(),
  /** 排程發佈時間（ISO 8601 字串，選填） */
  scheduledAt: z.string().datetime().optional(),
})

type ProductData = {
  id: string
  name: string
  price: number
  description: string | null
  status: string
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const body: unknown = await req.json()
    const result = fbPostSchema.safeParse(body)
    if (!result.success) {
      throw new ValidationError(result.error.message)
    }

    const { pageId, pageAccessToken, productIds, message, scheduledAt } = result.data

    const productResults = await Promise.all(
      productIds.map((id) => storefrontRequest<ProductData>(`/products/${id}`)),
    )

    const products = productResults
      .filter((r) => !r.error && r.data?.status === 'active')
      .map((r) => r.data!)

    if (products.length === 0) {
      throw new NotFoundError('找不到指定商品')
    }

    const scheduledTimestamp = scheduledAt
      ? Math.floor(new Date(scheduledAt).getTime() / 1000)
      : undefined

    let postId: string

    if (products.length === 1) {
      const product = products[0]!
      const productUrl = `${SITE_URL}/products/${product.id}?utm_source=facebook&utm_medium=social&utm_campaign=product-promo`
      const defaultMessage = `✨ 韓貨新品！\n\n${product.name}\n💰 NT$${product.price.toLocaleString('zh-TW')}\n\n#Kslect #韓貨`

      postId = await createPagePost(pageId, pageAccessToken, {
        message: message ?? defaultMessage,
        link: productUrl,
        scheduledAt: scheduledTimestamp,
      })
    } else {
      const defaultMessage = `🛍️ K-slect 韓貨特選 ${products.length} 款新品！\n\n#Kslect #韓貨 #韓系`
      const items = products.map((p) => ({
        name: p.name,
        description: `NT$${p.price.toLocaleString('zh-TW')}`,
        link: `${SITE_URL}/products/${p.id}?utm_source=facebook&utm_medium=social&utm_campaign=multi-promo`,
      }))

      postId = await createCarouselPost(
        pageId,
        pageAccessToken,
        message ?? defaultMessage,
        items,
      )
    }

    return ok({
      postId,
      scheduled: !!scheduledAt,
      productCount: products.length,
    })
  } catch (e) {
    return fail(e)
  }
}
