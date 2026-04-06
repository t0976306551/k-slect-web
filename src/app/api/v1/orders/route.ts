import { NextRequest, NextResponse } from 'next/server'
import { backendRequest, storefrontRequest } from '@/lib/backend'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const params = new URLSearchParams()
  if (searchParams.get('status')) params.set('status', searchParams.get('status')!)
  if (searchParams.get('email')) params.set('search', searchParams.get('email')!)
  if (searchParams.get('limit')) params.set('limit', searchParams.get('limit')!)
  if (searchParams.get('page')) params.set('page', searchParams.get('page')!)

  const qs = params.toString()
  const result = await backendRequest(`/orders${qs ? `?${qs}` : ''}`)
  return NextResponse.json(result, { status: result.error ? 500 : 200 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  // 前台顧客建立訂單 → 使用公開的 storefront 端點
  const result = await storefrontRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const status = result.error
    ? (result.error.code === 'VALIDATION_ERROR' ? 400 : result.error.code === 'NOT_FOUND' ? 404 : result.error.code === 'INSUFFICIENT_STOCK' ? 422 : 500)
    : 201
  return NextResponse.json(result, { status })
}
