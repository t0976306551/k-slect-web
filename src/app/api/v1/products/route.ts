import { NextRequest, NextResponse } from 'next/server'
import { storefrontRequest, backendRequest } from '@/lib/backend'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const params = new URLSearchParams()
  if (searchParams.get('categoryId')) params.set('categoryId', searchParams.get('categoryId')!)
  if (searchParams.get('q')) params.set('q', searchParams.get('q')!)
  if (searchParams.get('limit')) params.set('limit', searchParams.get('limit')!)
  if (searchParams.get('offset')) params.set('offset', searchParams.get('offset')!)

  const qs = params.toString()
  const result = await storefrontRequest<{ products: unknown[]; total: number }>(`/products${qs ? `?${qs}` : ''}`)

  // storefront 回傳 { products: [...], total: N }，正規化為陣列格式供前端使用
  // 同時補上 image 欄位（images[0]），供前端元件直接使用
  if (result.data) {
    const products = result.data.products.map((p) => {
      const product = p as Record<string, unknown>
      const images = product.images
      return { ...product, image: Array.isArray(images) ? (images[0] ?? null) : null }
    })
    return NextResponse.json(
      { data: products, error: null },
      { status: 200 },
    )
  }
  return NextResponse.json(result, { status: result.error ? 500 : 200 })
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req)
  if (authError) return authError

  const body = await req.json()
  // 管理操作：需要 service token
  const result = await backendRequest('/products', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return NextResponse.json(result, { status: result.error ? (result.error.code === 'VALIDATION_ERROR' ? 400 : 500) : 201 })
}
